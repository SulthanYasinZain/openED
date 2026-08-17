import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken, checkSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateClassForm from "@/components/create-class-form";
import AssingTeacherForm from "@/components/assign-teacher-form";
import LogoutButton from "@/components/logout-button";
import DeleteClassButton from "@/components/class-delete-button";
import AssignTeacherButton from "@/components/test-dialog-assign-teacher";
export default async function DashboardPage() {
  const sessionData = await checkSession("ADMIN");

  let classData = await prisma.class.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      code: true,
      teachers: {
        select: {
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  classData = classData.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    teachers: item.teachers.map((item) => item.teacher),
  }));

  const teacherData = await prisma.user.findMany({
    where: {
      role: "TEACHER",
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return (
    <main className="p-4 space-y-2">
      <LogoutButton />
      <CreateClassForm />

      <ul className="space-y-2">
        {classData.map((classItem) => (
          <li
            key={classItem.id}
            className="p-2 border border-stone-200 rounded flex"
          >
            {classItem.name} - {classItem.code} -{" "}
            {classItem.teachers[0]?.name ?? "No teacher"}
            <DeleteClassButton classId={classItem.id} />
            <AssignTeacherButton/>
          </li>
        ))}
      </ul>

      <AssingTeacherForm teacherList={teacherData} classList={classData} />
    </main>
  );
}
