"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAccessToken, checkSession } from "@/lib/session";

type PreviouseState = {
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
    await prisma.studentEnrollment.create({
      data: {
        classId,
        studentId,
      },
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
