"use server";

import { revalidatePath } from "next/cache";
import { saveAttendanceSchema } from "@/lib/attendance";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

export async function saveMeetingAttendanceAction(input: unknown) {
  const session = await checkSession("ADMIN");
  const parsed = saveAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Choose an attendance status for each edited student and keep notes under 500 characters.",
    };
  }

  const { classCode, meetingId, attendance } = parsed.data;
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
          studentId: { in: attendance.map((row) => row.studentId) },
          student: { isDeleted: false, role: "STUDENT" },
        },
      });
      if (enrolled !== attendance.length) {
        return {
          error:
            "The student list has changed. Refresh the page before saving.",
        };
      }

      for (const { studentId, status, note } of attendance) {
        const data = {
          status,
          note: note || null,
          markedBy: session.userId,
          isDeleted: false,
        };
        await tx.attendance.upsert({
          where: { meetingId_studentId: { meetingId, studentId } },
          create: { meetingId, studentId, ...data },
          update: data,
        });
      }
      return { topic: meeting.topic };
    });
    if ("error" in result) return { error: result.error };

    await logAudit({
      action: "UPDATE",
      entityType: "ClassMeeting",
      entityId: meetingId,
      description: `Saved attendance for ${attendance.length} students in "${result.topic}"`,
    });
    revalidatePath(
      `/dashboard/class/${classCode}/meeting/${meetingId}/attendance`,
    );
    return { success: true };
  } catch (error) {
    console.error("Save meeting attendance error:", error);
    return { error: "Unable to save attendance. Please try again." };
  }
}
