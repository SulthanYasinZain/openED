"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

type PreviousState = {
  error?: string;
};

export async function StudentJoinClassByCodeAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  const sessionData = await checkSession("STUDENT");

  const code = formData.get("code");

  if (typeof code !== "string" || !code.trim()) {
    return { error: "Field Must be fill" };
  }

  const classData = await prisma.class.findUnique({
    where: {
      code,
    },
    select: {
      id: true,
    },
  });

  if (!classData) {
    return {
      error: "Class not found",
    };
  }
  await enrollStudentToClass(classData.id, sessionData.userId);

  return redirect("/class");
}

export async function StudentJoinClassAction(
  classId: number,
  _formData: FormData,
) {
  const sessionData = await checkSession("STUDENT");

  if (!Number.isInteger(classId) || classId <= 0) {
    return {
      error: "Invalid class ID",
    };
  }

  await enrollStudentToClass(classId, sessionData.userId);
}

export async function EnrollStudentAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const studentId = Number(formData.get("studentId"));
  const classId = Number(formData.get("classId"));

  if (
    !Number.isInteger(studentId) ||
    !Number.isInteger(classId) ||
    studentId <= 0 ||
    classId <= 0
  ) {
    return { error: "Invalid student or class ID" };
  }

  const existing = await prisma.studentEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (existing && !existing.isDeleted) {
    return { error: "Student is already in this class" };
  }

  try {
    const enrollment = existing
      ? await prisma.studentEnrollment.update({
          where: { id: existing.id },
          data: { isDeleted: false },
        })
      : await prisma.studentEnrollment.create({
          data: {
            classId,
            studentId,
          },
        });

    await logAudit({
      action: "CREATE",
      entityType: "StudentEnrollment",
      entityId: enrollment.id,
      description: `Student #${studentId} enrolled in class #${classId}`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("Enrollment error:", error);

    return {
      error: "Failed to enroll student",
    };
  }
}

export async function RemoveStudentAction(
  _previousState: PreviousState,
  formData: FormData,
): Promise<PreviousState> {
  await checkSession("ADMIN");

  const studentId = Number(formData.get("studentId"));
  const classId = Number(formData.get("classId"));

  if (
    !Number.isInteger(studentId) ||
    !Number.isInteger(classId) ||
    studentId <= 0 ||
    classId <= 0
  ) {
    return { error: "Invalid student or class ID" };
  }

  try {
    const existing = await prisma.studentEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });

    if (!existing || existing.isDeleted) {
      return { error: "Student is not in this class" };
    }

    await prisma.studentEnrollment.update({
      where: { id: existing.id },
      data: { isDeleted: true },
    });

    await logAudit({
      action: "DELETE",
      entityType: "StudentEnrollment",
      entityId: existing.id,
      description: `Removed student #${studentId} from class #${classId}`,
    });

    revalidatePath("/dashboard");

    return { error: "" };
  } catch (error) {
    console.error("removing student error:", error);

    return {
      error: "Failed to remove student",
    };
  }
}

async function enrollStudentToClass(classId: number, studentId: number) {
  const isStudentAlreadyEnroll = await prisma.studentEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (isStudentAlreadyEnroll) {
    return {
      error: "You had already join this class",
    };
  }

  try {
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        classId,
        studentId,
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "StudentEnrollment",
      entityId: enrollment.id,
      description: `Student #${studentId} joined class #${classId}`,
    });
  } catch (error) {
    console.error("Enrollment error:", error);

    return {
      error: "Failed to join class",
    };
  }

  revalidatePath("/class");
  return {
    error: "",
  };
}
