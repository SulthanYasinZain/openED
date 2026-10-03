"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

type PreviousState = {
  error?: string;
};

export async function AssignTeacherAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const teacherId = Number(formData.get("teacherId"));
  const classId = Number(formData.get("classId"));

  if (
    !Number.isInteger(teacherId) ||
    !Number.isInteger(classId) ||
    teacherId <= 0 ||
    classId <= 0
  ) {
    return { error: "Invalid teacher or class ID" };
  }

  if (!teacherId || !classId) {
    return { error: "All field must be fill" };
  }

  try {
    const assignment = await prisma.classTeacher.create({
      data: {
        classId,
        teacherId,
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "ClassTeacher",
      entityId: assignment.id,
      description: `Assigned teacher #${teacherId} to class #${classId}`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("assigning error:", error);

    return {
      error: "Failed to assign teacher",
    };
  }
}
