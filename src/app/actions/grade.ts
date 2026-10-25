"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { saveGradesSchema } from "@/lib/grading";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

export async function saveMeetingGradesAction(input: unknown) {
  await checkSession("ADMIN");

  const parsed = saveGradesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Enter whole-number scores between 0 and 100, or leave them blank.",
    };
  }

  const { classCode, meetingId, grades } = parsed.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const meeting = await tx.classMeeting.findFirst({
        where: {
          id: meetingId,
          isDeleted: false,
          class: { code: classCode, isDeleted: false },
        },
        select: { classId: true, topic: true },
      });
      if (!meeting) return { error: "Meeting not found." };

      const enrolled = await tx.studentEnrollment.count({
        where: {
          classId: meeting.classId,
          isDeleted: false,
          studentId: { in: grades.map((grade) => grade.studentId) },
          student: { isDeleted: false, role: "STUDENT" },
        },
      });
      if (enrolled !== grades.length) {
        return {
          error:
            "The student list has changed. Refresh the page before saving.",
        };
      }

      for (const { studentId, ...scores } of grades) {
        await tx.meetingGrade.upsert({
          where: { meetingId_studentId: { meetingId, studentId } },
          create: { meetingId, studentId, ...scores },
          update: scores,
        });
      }
      return { topic: meeting.topic };
    });

    if ("error" in result) return { error: result.error };

    await logAudit({
      action: "GRADE",
      entityType: "ClassMeeting",
      entityId: meetingId,
      description: `Saved grades for ${grades.length} students in "${result.topic}"`,
    });
    revalidatePath(`/dashboard/class/${classCode}/meeting/${meetingId}/grade`);
    return { success: true };
  } catch (error) {
    console.error("Save meeting grades error:", error);
    return { error: "Unable to save grades. Please try again." };
  }
}
