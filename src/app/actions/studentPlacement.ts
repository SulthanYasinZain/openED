"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAccessToken } from "@/lib/session";

export async function StudentJoinClassAction(
  classId: number,
  _formData: FormData,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;

  try {
    payload = await verifyAccessToken(token);
  } catch {
    redirect("/login");
  }

  if (payload.role !== "STUDENT") {
    redirect("/");
  }

  if (!Number.isInteger(classId) || classId <= 0) {
    return {
      error: "Invalid class ID",
    };
  }

  const isStudentAlreadyEnroll = await prisma.studentEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId: payload.userId,
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
        studentId: payload.userId,
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
