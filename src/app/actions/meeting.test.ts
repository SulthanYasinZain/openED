import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import { createMeetingAction, findFileByHashAction } from "./meeting";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    class: { findUnique: jest.fn() },
    classMeeting: { create: jest.fn() },
    learningMaterial: { findFirst: jest.fn() },
  },
}));
const input = {
  classCode: " ABC123 ",
  topic: " Introduction ",
  description: " Welcome ",
  scheduledAt: "2026-10-25T09:00:00Z",
  fileUrl: " https://files.example.com/intro.pdf ",
  fileHash: " abc ",
};
beforeEach(() => {
  jest.resetAllMocks();
  (prisma.class.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
  (prisma.classMeeting.create as jest.Mock).mockResolvedValue({ id: 7 });
});

it.each([
  [{ classCode: " " }, "Class is required"],
  [{ topic: " " }, "Topic name must be filled"],
  [{ scheduledAt: "not-a-date" }, "Invalid date"],
  [{ fileUrl: " " }, "File is required"],
])("validates meeting input %j", async (values, error) => {
  expect(await createMeetingAction({ ...input, ...values })).toEqual({ error });
  expect(prisma.classMeeting.create).not.toHaveBeenCalled();
});
it("rejects an unknown class", async () => {
  (prisma.class.findUnique as jest.Mock).mockResolvedValue(null);
  expect((await createMeetingAction(input)).error).toBe("Class not found");
  expect(prisma.classMeeting.create).not.toHaveBeenCalled();
});
it("creates a meeting and its file material together", async () => {
  expect(await createMeetingAction(input)).toEqual({});
  expect(checkSession).toHaveBeenCalledWith("ADMIN");
  expect(prisma.classMeeting.create).toHaveBeenCalledWith({
    data: {
      classId: 2,
      topic: "Introduction",
      description: "Welcome",
      scheduledAt: new Date(input.scheduledAt),
      materials: {
        create: {
          title: "Introduction",
          type: "FILE",
          fileUrl: "https://files.example.com/intro.pdf",
          fileHash: "abc",
        },
      },
    },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "CREATE", entityId: 7 }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard/class/ABC123");
});
it("normalizes blank optional meeting fields to null", async () => {
  await createMeetingAction({ ...input, description: " ", fileHash: null });
  expect(prisma.classMeeting.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        description: null,
        materials: { create: expect.objectContaining({ fileHash: null }) },
      }),
    }),
  );
});
it("skips duplicate-file lookup for an empty hash", async () => {
  expect(await findFileByHashAction(" ")).toEqual({ fileUrl: null });
  expect(prisma.learningMaterial.findFirst).not.toHaveBeenCalled();
});
it("reuses only a nondeleted file with the matching hash", async () => {
  (prisma.learningMaterial.findFirst as jest.Mock).mockResolvedValue({
    fileUrl: "https://files.example.com/existing.pdf",
  });
  expect(await findFileByHashAction(" abc ")).toEqual({
    fileUrl: "https://files.example.com/existing.pdf",
  });
  expect(prisma.learningMaterial.findFirst).toHaveBeenCalledWith({
    where: { fileHash: "abc", isDeleted: false },
    select: { fileUrl: true },
  });
});
it("returns null when the file is not found", async () => {
  (prisma.learningMaterial.findFirst as jest.Mock).mockResolvedValue(null);
  expect(await findFileByHashAction("abc")).toEqual({ fileUrl: null });
});
it("reports a file lookup failure", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    (prisma.learningMaterial.findFirst as jest.Mock).mockRejectedValue(
      new Error("offline"),
    );
    expect(await findFileByHashAction("abc")).toEqual({
      fileUrl: null,
      error: "Failed to check for duplicates",
    });
  } finally {
    log.mockRestore();
  }
});
it("guards meeting creation and file lookup with admin access", async () => {
  (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
  await expect(createMeetingAction(input)).rejects.toThrow("denied");
  await expect(findFileByHashAction("abc")).rejects.toThrow("denied");
  expect(prisma.class.findUnique).not.toHaveBeenCalled();
  expect(prisma.learningMaterial.findFirst).not.toHaveBeenCalled();
});
