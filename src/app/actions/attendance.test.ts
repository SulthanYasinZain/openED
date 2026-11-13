import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import { saveMeetingAttendanceAction } from "./attendance";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { $transaction: jest.fn() } }));
const tx = {
  classMeeting: { findFirst: jest.fn() },
  studentEnrollment: { count: jest.fn() },
  attendance: { upsert: jest.fn() },
};
const input = {
  classCode: "ABC123",
  meetingId: 7,
  attendance: [{ studentId: 3, status: "PRESENT", note: " Arrived early " }],
};
beforeEach(() => {
  jest.resetAllMocks();
  (checkSession as jest.Mock).mockResolvedValue({ userId: 42, role: "ADMIN" });
  (prisma.$transaction as jest.Mock).mockImplementation((callback) =>
    callback(tx),
  );
  tx.classMeeting.findFirst.mockResolvedValue({
    classId: 2,
    topic: "Introduction",
  });
  tx.studentEnrollment.count.mockResolvedValue(1);
});

it.each([
  { classCode: "" },
  { meetingId: 0 },
  { attendance: [] },
  { attendance: [{ ...input.attendance[0], status: "UNKNOWN" }] },
  { attendance: [{ ...input.attendance[0], studentId: 0 }] },
  { attendance: [{ ...input.attendance[0], note: "x".repeat(501) }] },
  { attendance: [input.attendance[0], input.attendance[0]] },
])("rejects invalid attendance %j without a transaction", async (values) => {
  expect(
    (await saveMeetingAttendanceAction({ ...input, ...values })).error,
  ).toBeTruthy();
  expect(checkSession).toHaveBeenCalledWith("ADMIN");
  expect(prisma.$transaction).not.toHaveBeenCalled();
});
it("rejects an unknown or cross-class meeting", async () => {
  tx.classMeeting.findFirst.mockResolvedValue(null);
  expect((await saveMeetingAttendanceAction(input)).error).toBe(
    "Meeting not found.",
  );
  expect(tx.classMeeting.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        id: 7,
        isDeleted: false,
        class: { code: "ABC123", isDeleted: false },
      },
    }),
  );
  expect(tx.attendance.upsert).not.toHaveBeenCalled();
});
it("rejects a batch containing an unenrolled or deleted student before writing", async () => {
  tx.studentEnrollment.count.mockResolvedValue(0);
  expect((await saveMeetingAttendanceAction(input)).error).toMatch(
    /student list has changed/,
  );
  expect(tx.studentEnrollment.count).toHaveBeenCalledWith({
    where: {
      classId: 2,
      isDeleted: false,
      studentId: { in: [3] },
      student: { isDeleted: false, role: "STUDENT" },
    },
  });
  expect(tx.attendance.upsert).not.toHaveBeenCalled();
});
it.each(["PRESENT", "LATE", "ABSENT", "EXCUSED"])(
  "saves status %s with the authenticated admin as marker",
  async (status) => {
    expect(
      await saveMeetingAttendanceAction({
        ...input,
        markedBy: 999,
        attendance: [{ ...input.attendance[0], status, markedBy: 999 }],
      }),
    ).toEqual({ success: true });
    const data = {
      status,
      note: "Arrived early",
      markedBy: 42,
      isDeleted: false,
    };
    expect(tx.attendance.upsert).toHaveBeenCalledWith({
      where: { meetingId_studentId: { meetingId: 7, studentId: 3 } },
      create: { meetingId: 7, studentId: 3, ...data },
      update: data,
    });
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "UPDATE", entityId: 7 }),
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/dashboard/class/ABC123/meeting/7/attendance",
    );
  },
);
it("clears a note with null while restoring a soft-deleted record", async () => {
  await saveMeetingAttendanceAction({
    ...input,
    attendance: [{ ...input.attendance[0], note: " " }],
  });
  expect(tx.attendance.upsert).toHaveBeenCalledWith(
    expect.objectContaining({
      update: expect.objectContaining({ note: null, isDeleted: false }),
    }),
  );
});
it("saves all validated students in a batch", async () => {
  tx.studentEnrollment.count.mockResolvedValue(2);
  await saveMeetingAttendanceAction({
    ...input,
    attendance: [
      input.attendance[0],
      { studentId: 4, status: "ABSENT", note: "" },
    ],
  });
  expect(tx.attendance.upsert).toHaveBeenCalledTimes(2);
  expect(tx.attendance.upsert).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      where: { meetingId_studentId: { meetingId: 7, studentId: 4 } },
    }),
  );
});
it("requires admin access before starting a transaction", async () => {
  (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
  await expect(saveMeetingAttendanceAction(input)).rejects.toThrow("denied");
  expect(prisma.$transaction).not.toHaveBeenCalled();
});
it("does not audit or revalidate a failed transaction", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("offline"));
    expect((await saveMeetingAttendanceAction(input)).error).toMatch(
      /Unable to save/,
    );
    expect(logAudit).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});
