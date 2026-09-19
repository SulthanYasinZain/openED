import Link from "next/link";
import AssingTeacherForm from "@/components/assign-teacher-form";
import DeleteClassButton from "@/components/class-delete-button";
import CreateClassForm from "@/components/create-class-form";
import LogoutButton from "@/components/logout-button";
import AssignTeacherButton from "@/components/test-dialog-assign-teacher";
import { prisma } from "@/lib/prisma";
export default async function DashboardPage() {
  const classData = await prisma.class.findMany({
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

  const classes = classData.map((item) => ({
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
        {classes.map((classItem) => (
          <li
            key={classItem.id}
            className="p-2 border border-stone-200 rounded flex items-center justify-between"
          >
            <div>
              {classItem.name} - {classItem.code} -{" "}
              {classItem.teachers[0]?.name ?? "No teacher"}
            </div>

            <div className="flex gap-2">
              <DeleteClassButton classId={classItem.id} />
              <AssignTeacherButton teacherList={teacherData} />
              <Link href={`/dashboard/class/${classItem.code}`}>View</Link>
            </div>
          </li>
        ))}
      </ul>

      <AssingTeacherForm teacherList={teacherData} classList={classes} />
    </main>
  );
}
