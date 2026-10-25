import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackForwardButtons from "@/components/back-forward-buttons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import GradeStudents from "./grade-students";

export default async function GradePage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id: classCode, meetingId: value } = await params;
  const meetingId = Number(value);
  if (!Number.isSafeInteger(meetingId) || meetingId <= 0) notFound();

  const meeting = await prisma.classMeeting.findFirst({
    where: {
      id: meetingId,
      isDeleted: false,
      class: { code: classCode, isDeleted: false },
    },
    select: {
      topic: true,
      grades: true,
      class: {
        select: {
          name: true,
          studentEnrollments: {
            where: {
              isDeleted: false,
              student: { isDeleted: false, role: "STUDENT" },
            },
            orderBy: { student: { name: "asc" } },
            select: {
              student: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
  });
  if (!meeting) notFound();

  const gradesByStudent = new Map(
    meeting.grades.map((grade) => [grade.studentId, grade]),
  );
  const students = meeting.class.studentEnrollments.map(({ student }) => {
    const grade = gradesByStudent.get(student.id);
    return {
      studentId: student.id,
      name: student.name || student.email,
      email: student.email,
      programming: grade?.programming ?? null,
      creativity: grade?.creativity ?? null,
      design: grade?.design ?? null,
    };
  });

  return (
    <main className="w-full px-6 py-10 text-[13px] text-stone-900">
      <div className="flex items-center gap-0.5">
        <BackForwardButtons />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={`/dashboard/class/${classCode}`} />}
              >
                {meeting.class.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={BookOpen01Icon}
                    size={12}
                    strokeWidth={2}
                  />
                  Grade students
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6">
        <GradeStudents
          classCode={classCode}
          meetingId={meetingId}
          topic={meeting.topic}
          students={students}
        />
      </div>
    </main>
  );
}
