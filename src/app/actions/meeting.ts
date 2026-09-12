"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

type CreateMeetingInput = {
  classCode: string;
  topic: string;
  description: string | null;
  scheduledAt: string;
  fileKey: string;
};

type CreateMeetingResult = {
  error?: string;
};

export async function createMeetingAction(
  input: CreateMeetingInput,
): Promise<CreateMeetingResult> {
  await checkSession("ADMIN");

  const topic = input.topic.trim();
  const scheduledAt = new Date(input.scheduledAt);

  if (!input.classCode.trim()) {
    return { error: "Class is required" };
  }

  if (!topic) {
    return { error: "Topic name must be filled" };
  }

  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Invalid date" };
  }

  if (!input.fileKey.trim()) {
    return { error: "File is required" };
  }

  const classData = await prisma.class.findUnique({
    where: { code: input.classCode.trim() },
    select: { id: true },
  });

  if (!classData) {
    return { error: "Class not found" };
  }

  try {
    await prisma.classMeeting.create({
      data: {
        classId: classData.id,
        topic,
        description: input.description?.trim() || null,
        fileKey: input.fileKey.trim(),
        scheduledAt,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/class/${input.classCode.trim()}`);

    return {};
  } catch (error) {
    console.error("Create meeting error:", error);

    return { error: "Failed to save meeting" };
  }
}
