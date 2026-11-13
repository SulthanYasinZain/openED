import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import { saveMeetingGradesAction } from "./grade";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { $transaction: jest.fn() } }));

const tx = {
  classMeeting: { findFirst: jest.fn() },
  studentEnrollment: { count: jest.fn() },
  meetingGrade: { upsert: jest.fn() },
};
const input = {
  classCode: "ABC123",
  meetingId: 7,
  grades: [{ studentId: 3, programming: 0, creativity: 100, design: null }],
};

beforeEach(() => {
  jest.resetAllMocks();
  (prisma.$transaction as jest.Mock).mockImplementation((callback) =>
    callback(tx),
  );
  tx.classMeeting.findFirst.mockResolvedValue({
    classId: 2,
    topic: "Introduction",
  });
  tx.studentEnrollment.count.mockResolvedValue(1);
});

it("requires admin access before checking or writing grades", async () => {
  (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
  await expect(saveMeetingGradesAction(input)).rejects.toThrow("denied");
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

it.each([{ meetingId: 0 }, { classCode: "" }, { grades: [] }])(
  "rejects invalid batch %j",
  async (values) => {
    expect(
      (await saveMeetingGradesAction({ ...input, ...values })).error,
    ).toBeTruthy();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  },
);

it("does not audit or revalidate when the transaction fails", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("offline"));
    expect((await saveMeetingGradesAction(input)).error).toBeTruthy();
    expect(logAudit).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});

it.each([-1, 101, 50.5, Number.NaN])(
  "rejects invalid score %s without writing",
  async (score) => {
    const result = await saveMeetingGradesAction({
      ...input,
      grades: [{ ...input.grades[0], programming: score }],
    });
    expect(checkSession).toHaveBeenCalledWith("ADMIN");
    expect(result.error).toBeTruthy();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  },
);

it("rejects duplicate students", async () => {
  expect(
    (
      await saveMeetingGradesAction({
        ...input,
        grades: [input.grades[0], input.grades[0]],
      })
    ).error,
  ).toBeTruthy();
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

it("does not write grades for a meeting outside the requested class", async () => {
  tx.classMeeting.findFirst.mockResolvedValue(null);
  expect((await saveMeetingGradesAction(input)).error).toBe(
    "Meeting not found.",
  );
  expect(tx.classMeeting.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        id: 7,
        class: { code: "ABC123", isDeleted: false },
      }),
    }),
  );
  expect(tx.meetingGrade.upsert).not.toHaveBeenCalled();
});

it("does not write grades for students no longer enrolled", async () => {
  tx.studentEnrollment.count.mockResolvedValue(0);
  expect((await saveMeetingGradesAction(input)).error).toMatch(
    /student list has changed/,
  );
  expect(tx.meetingGrade.upsert).not.toHaveBeenCalled();
});

it("saves zero, full marks, and a cleared grade, then audits and revalidates", async () => {
  expect(await saveMeetingGradesAction(input)).toEqual({ success: true });
  expect(tx.meetingGrade.upsert).toHaveBeenCalledWith({
    where: { meetingId_studentId: { meetingId: 7, studentId: 3 } },
    create: {
      meetingId: 7,
      studentId: 3,
      programming: 0,
      creativity: 100,
      design: null,
    },
    update: { programming: 0, creativity: 100, design: null },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "GRADE", entityId: 7 }),
  );
  expect(revalidatePath).toHaveBeenCalledWith(
    "/dashboard/class/ABC123/meeting/7/grade",
  );
});
