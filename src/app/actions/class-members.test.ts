import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import { AssignTeacherAction, RemoveTeacherAction } from "./classTeacher";
import { EnrollStudentAction, RemoveStudentAction } from "./studentPlacement";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    classTeacher: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    studentEnrollment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe.each([
  {
    label: "teacher assignments",
    field: "teacherId",
    db: jest.mocked(prisma.classTeacher),
    add: AssignTeacherAction,
    remove: RemoveTeacherAction,
    entityType: "ClassTeacher",
  },
  {
    label: "student enrollment",
    field: "studentId",
    db: jest.mocked(prisma.studentEnrollment),
    add: EnrollStudentAction,
    remove: RemoveStudentAction,
    entityType: "StudentEnrollment",
  },
])("$label", ({ field, db, add, remove, entityType }) => {
  function form(memberId = "3", classId = "2") {
    const data = new FormData();
    data.set(field, memberId);
    data.set("classId", classId);
    return data;
  }
  beforeEach(() => {
    jest.resetAllMocks();
    (db.create as jest.Mock).mockResolvedValue({ id: 9 });
    (db.update as jest.Mock).mockResolvedValue({ id: 9 });
  });

  it.each([
    ["0", "2"],
    ["3", "-1"],
    ["abc", "2"],
    ["1.5", "2"],
  ])("rejects invalid member/class IDs %s, %s", async (member, classId) => {
    expect((await add({}, form(member, classId))).error).toMatch(/Invalid/);
    expect((await remove({}, form(member, classId))).error).toMatch(/Invalid/);
    expect(db.findUnique).not.toHaveBeenCalled();
  });
  it("creates a new membership and records an audit event", async () => {
    expect(await add({}, form())).toEqual({ error: "" });
    expect(checkSession).toHaveBeenCalledWith("ADMIN");
    expect(db.create).toHaveBeenCalledWith({
      data: { classId: 2, [field]: 3 },
    });
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREATE", entityType, entityId: 9 }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
  it("rejects an already active membership", async () => {
    (db.findUnique as jest.Mock).mockResolvedValue({ id: 9, isDeleted: false });
    expect((await add({}, form())).error).toMatch(/already/);
    expect(db.create).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });
  it("restores a deleted membership rather than duplicating it", async () => {
    (db.findUnique as jest.Mock).mockResolvedValue({ id: 9, isDeleted: true });
    expect(await add({}, form())).toEqual({ error: "" });
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { isDeleted: false },
    });
    expect(db.create).not.toHaveBeenCalled();
  });
  it.each([null, { id: 9, isDeleted: true }])(
    "rejects removal of a missing or inactive membership %j",
    async (existing) => {
      (db.findUnique as jest.Mock).mockResolvedValue(existing);
      expect((await remove({}, form())).error).toBeTruthy();
      expect(db.update).not.toHaveBeenCalled();
    },
  );
  it("soft-deletes an active membership", async () => {
    (db.findUnique as jest.Mock).mockResolvedValue({ id: 9, isDeleted: false });
    expect(await remove({}, form())).toEqual({ error: "" });
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { isDeleted: true },
    });
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DELETE", entityType, entityId: 9 }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
  it("denies both mutations before reading memberships", async () => {
    (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
    await expect(add({}, form())).rejects.toThrow("denied");
    await expect(remove({}, form())).rejects.toThrow("denied");
    expect(db.findUnique).not.toHaveBeenCalled();
  });
  it("does not audit a failed membership write", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      (db.create as jest.Mock).mockRejectedValue(new Error("offline"));
      expect((await add({}, form())).error).toMatch(/Failed/);
      expect(logAudit).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
