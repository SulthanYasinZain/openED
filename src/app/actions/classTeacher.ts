"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
    await prisma.classTeacher.create({
      data: {
        classId,
        teacherId,
      },
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
