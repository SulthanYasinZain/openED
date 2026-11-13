import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import {
  bulkDeleteClassesAction,
  bulkUpdateClassStatusAction,
  createClassAction,
  deleteClassAction,
  duplicateClassAction,
  updateClassAction,
  updateClassStatusAction,
} from "./class";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    class: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    school: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));
const db = jest.mocked(prisma.class);
const tx = {
  class: { update: jest.fn() },
  classTeacher: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  studentEnrollment: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
function form(name = " Robotics ", schoolId = "2") {
  const data = new FormData();
  data.set("name", name);
  data.set("schoolId", schoolId);
  return data;
}
const update = {
  name: " Robotics ",
  schoolId: 2,
  teacherIds: [10, 11, 12, 12],
  studentIds: [20, 21, 22, 22],
};
beforeEach(() => {
  jest.resetAllMocks();
  db.findUnique.mockResolvedValue(null);
  db.create.mockResolvedValue({ id: 3 } as never);
  db.update.mockResolvedValue({ name: "Robotics" } as never);
  db.findMany.mockResolvedValue([{ id: 3, name: "Robotics" }] as never);
  (prisma.school.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
  (prisma.$transaction as jest.Mock).mockImplementation((callback) =>
    callback(tx),
  );
  tx.classTeacher.findMany.mockResolvedValue([]);
  tx.studentEnrollment.findMany.mockResolvedValue([]);
});

it.each([
  [" ", "2"],
  ["Robotics", "0"],
  ["Robotics", "1.5"],
])("rejects invalid class name or organization %s %s", async (name, school) => {
  expect((await createClassAction({}, form(name, school))).error).toBeTruthy();
  expect(db.create).not.toHaveBeenCalled();
});
it("creates a class with a collision-free code", async () => {
  db.findUnique
    .mockResolvedValueOnce({ id: 1 } as never)
    .mockResolvedValueOnce(null);
  expect(await createClassAction({}, form())).toEqual({ error: "" });
  expect(db.findUnique).toHaveBeenCalledTimes(2);
  expect(db.create).toHaveBeenCalledWith({
    data: {
      name: "Robotics",
      code: expect.stringMatching(/^[A-Z0-9]{6}$/),
      schoolId: 2,
    },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "CREATE", entityId: 3 }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
});
it("rejects a missing organization", async () => {
  (prisma.school.findUnique as jest.Mock).mockResolvedValue(null);
  expect((await createClassAction({}, form())).error).toBe(
    "Selected organization not found",
  );
  expect(db.create).not.toHaveBeenCalled();
});
it("duplicates meeting and material metadata without copying memberships", async () => {
  const material = {
    title: "Slides",
    description: null,
    type: "FILE",
    fileUrl: "https://files.example.com/slides.pdf",
    fileHash: "abc",
  };
  const meeting = {
    topic: "Intro",
    description: "Welcome",
    scheduledAt: new Date("2026-10-25T09:00:00Z"),
    status: "SCHEDULED",
    materials: [material],
  };
  db.findUnique
    .mockResolvedValueOnce({
      schoolId: 2,
      imageUrl: "image.png",
      isDeleted: false,
      meetings: [meeting],
    } as never)
    .mockResolvedValueOnce(null);
  expect(await duplicateClassAction(1, form(" Robotics copy "))).toEqual({
    error: "",
  });
  expect(db.create).toHaveBeenCalledWith({
    data: {
      name: "Robotics copy",
      code: expect.any(String),
      schoolId: 2,
      imageUrl: "image.png",
      meetings: { create: [{ ...meeting, materials: { create: [material] } }] },
    },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "CREATE", entityId: 3 }),
  );
});
it.each([null, { isDeleted: true }])(
  "rejects duplication of missing or deleted class %j",
  async (source) => {
    db.findUnique.mockResolvedValueOnce(source as never);
    expect((await duplicateClassAction(1, form())).error).toBe(
      "Class not found",
    );
    expect(db.create).not.toHaveBeenCalled();
  },
);
it("reconciles active, removed, restored and new members in one transaction", async () => {
  tx.classTeacher.findMany.mockResolvedValue([
    { id: 1, teacherId: 10, isDeleted: false },
    { id: 2, teacherId: 11, isDeleted: true },
    { id: 3, teacherId: 13, isDeleted: false },
  ]);
  tx.studentEnrollment.findMany.mockResolvedValue([
    { id: 4, studentId: 20, isDeleted: false },
    { id: 5, studentId: 21, isDeleted: true },
    { id: 6, studentId: 23, isDeleted: false },
  ]);
  expect(await updateClassAction(3, update)).toEqual({ error: "" });
  expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  expect(tx.class.update).toHaveBeenCalledWith({
    where: { id: 3 },
    data: { name: "Robotics", schoolId: 2 },
  });
  expect(tx.classTeacher.update.mock.calls).toEqual([
    [{ where: { id: 2 }, data: { isDeleted: false } }],
    [{ where: { id: 3 }, data: { isDeleted: true } }],
  ]);
  expect(tx.classTeacher.create).toHaveBeenCalledTimes(1);
  expect(tx.classTeacher.create).toHaveBeenCalledWith({
    data: { classId: 3, teacherId: 12 },
  });
  expect(tx.studentEnrollment.update.mock.calls).toEqual([
    [{ where: { id: 5 }, data: { isDeleted: false } }],
    [{ where: { id: 6 }, data: { isDeleted: true } }],
  ]);
  expect(tx.studentEnrollment.create).toHaveBeenCalledTimes(1);
  expect(tx.studentEnrollment.create).toHaveBeenCalledWith({
    data: { classId: 3, studentId: 22 },
  });
});
it.each([{ name: " " }, { schoolId: 0 }])(
  "rejects invalid class updates %j",
  async (values) => {
    expect(
      (await updateClassAction(3, { ...update, ...values })).error,
    ).toBeTruthy();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  },
);
it.each(["ACTIVE", "INACTIVE", "ARCHIVED"] as const)(
  "changes class status to %s",
  async (status) => {
    expect(await updateClassStatusAction(3, status)).toEqual({ error: "" });
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { status },
      select: { name: true },
    });
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "UPDATE", entityId: 3 }),
    );
  },
);
it("rejects invalid status and IDs before writing", async () => {
  expect((await updateClassStatusAction(0, "ACTIVE")).error).toBeTruthy();
  expect(
    (await updateClassStatusAction(3, "OTHER" as "ACTIVE")).error,
  ).toBeTruthy();
  expect(db.update).not.toHaveBeenCalled();
});
it("deduplicates a bulk status update and audits affected classes", async () => {
  expect(
    await bulkUpdateClassStatusAction([3, 3, 0, -1, 1.5], "ARCHIVED"),
  ).toEqual({ error: "" });
  expect(db.updateMany).toHaveBeenCalledWith({
    where: { id: { in: [3] } },
    data: { status: "ARCHIVED" },
  });
  expect(logAudit).toHaveBeenCalledTimes(1);
});
it("soft-deletes a class", async () => {
  db.findUnique.mockResolvedValueOnce({
    name: "Robotics",
    code: "ABC123",
  } as never);
  expect(await deleteClassAction(3, new FormData())).toEqual({ error: "" });
  expect(db.update).toHaveBeenCalledWith({
    where: { id: 3 },
    data: { isDeleted: true },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "DELETE", entityId: 3 }),
  );
});
it("soft-deletes a deduplicated bulk selection", async () => {
  expect(await bulkDeleteClassesAction([3, 3, -1])).toEqual({ error: "" });
  expect(db.updateMany).toHaveBeenCalledWith({
    where: { id: { in: [3] } },
    data: { isDeleted: true },
  });
  expect(logAudit).toHaveBeenCalledTimes(1);
});
it("rejects empty bulk selections", async () => {
  expect((await bulkUpdateClassStatusAction([], "ACTIVE")).error).toBe(
    "No classes selected",
  );
  expect((await bulkDeleteClassesAction([0, -1])).error).toBe(
    "No classes selected",
  );
  expect(db.updateMany).not.toHaveBeenCalled();
});
it("protects every class mutation with admin authorization", async () => {
  (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
  const calls = [
    () => createClassAction({}, form()),
    () => duplicateClassAction(3, form()),
    () => updateClassAction(3, update),
    () => updateClassStatusAction(3, "ACTIVE"),
    () => bulkUpdateClassStatusAction([3], "ACTIVE"),
    () => bulkDeleteClassesAction([3]),
    () => deleteClassAction(3, new FormData()),
  ];
  for (const call of calls) await expect(call()).rejects.toThrow("denied");
  expect(checkSession).toHaveBeenCalledTimes(calls.length);
  expect(checkSession).toHaveBeenCalledWith("ADMIN");
  expect(db.findUnique).not.toHaveBeenCalled();
  expect(db.updateMany).not.toHaveBeenCalled();
  expect(prisma.$transaction).not.toHaveBeenCalled();
});
