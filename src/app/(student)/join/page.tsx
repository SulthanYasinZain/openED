import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import JoinClassForm from "@/components/join-class-form";
interface PageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function JoinPage({ searchParams }: PageProps) {
  const { code } = await searchParams;

  if (!code || code.length !== 6) {
    return <InvalidPage />;
  }

  const sessionData = await checkSession("STUDENT");

  const classData = await prisma.class.findUnique({
    where: {
      code,
    },
  });

  if (!classData) {
    return <InvalidPage />;
  }

  const isStudentAlreadyEnroll = await prisma.studentEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId: classData.id,
        studentId: payload.userId,
      },
    },
  });

  if (isStudentAlreadyEnroll) {
    redirect(`/class/${isStudentAlreadyEnroll}`);
    return {
      error: "User Already Join",
    };
  }

  return <JoinClassForm classId={classData.id} />;
}

function InvalidPage() {
  return <p>the class code is invalid make sure you add the correct one </p>;
}
