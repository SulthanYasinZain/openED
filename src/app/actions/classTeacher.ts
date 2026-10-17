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
    const existing = await prisma.classTeacher.findUnique({
      where: {
        classId_teacherId: {
          classId,
          teacherId,
        },
      },
    });

    if (existing && !existing.isDeleted) {
      return { error: "Teacher is already assigned to this class" };
    }

    const assignment = existing
      ? await prisma.classTeacher.update({
          where: { id: existing.id },
          data: { isDeleted: false },
        })
      : await prisma.classTeacher.create({
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

export async function RemoveTeacherAction(
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

  try {
    const existing = await prisma.classTeacher.findUnique({
      where: {
        classId_teacherId: {
          classId,
          teacherId,
        },
      },
    });

    if (!existing || existing.isDeleted) {
      return { error: "Teacher is not assigned to this class" };
    }

    await prisma.classTeacher.update({
      where: { id: existing.id },
      data: { isDeleted: true },
    });

    await logAudit({
      action: "DELETE",
      entityType: "ClassTeacher",
      entityId: existing.id,
      description: `Removed teacher #${teacherId} from class #${classId}`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("removing teacher error:", error);

    return {
      error: "Failed to remove teacher",
    };
  }
}
