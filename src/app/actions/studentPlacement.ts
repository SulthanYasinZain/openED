"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAccessToken, checkSession } from "@/lib/session";

export async function StudentJoinClassByCodeAction() {
  const sessionData = await checkSession();
}

export async function StudentJoinClassAction(
  classId: number,
  _formData: FormData,
) {
  const sessionData = await checkSession();

  if (!Number.isInteger(classId) || classId <= 0) {
    return {
      error: "Invalid class ID",
    };
  }

  const isStudentAlreadyEnroll = await prisma.studentEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId: sessionData.userId,
      },
    },
  });

  if (isStudentAlreadyEnroll) {
    redirect(`/class/${classId}`);
    return {
      error: "User Already Join",
    };
  }

  try {
    await prisma.studentEnrollment.create({
      data: {
        classId,
        studentId: sessionData.userId,
      },
    });
  } catch (error) {
    console.error("Enrollment error:", error);

    return {
      error: "Failed to join class",
    };
  }

  revalidatePath("/class");
  redirect(`/class/${classId}`);
  return {
    error: "",
  };
}
