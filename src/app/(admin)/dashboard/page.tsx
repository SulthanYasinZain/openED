import Link from "next/link";
import AssignTeacherDialog from "@/components/assign-teacher-dialog";
import DeleteClassButton from "@/components/class-delete-button";
import CreateClassDialog from "@/components/create-class-dialog";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const classData = await prisma.class.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      school: { select: { name: true } },
      teachers: {
        where: { isDeleted: false },
        select: {
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: { meetings: { where: { isDeleted: false } } },
      },
    },
  });

  const classes = classData.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    schoolName: item.school.name,
    teachers: item.teachers.map((item) => item.teacher),
    meetingCount: item._count.meetings,
  }));

  const teacherData = await prisma.user.findMany({
    where: {
      role: "MENTOR",
      isDeleted: false,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {classes.length} {classes.length === 1 ? "class" : "classes"} ·{" "}
            {teacherData.length}{" "}
            {teacherData.length === 1 ? "mentor" : "mentors"}
          </p>
        </div>
        <CreateClassDialog />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 && (
          <li className="border-border rounded-lg border px-4 py-8 text-center sm:col-span-2 lg:col-span-3">
            <p className="text-muted-foreground text-sm">
              No classes yet. Create the first one.
            </p>
          </li>
        )}

        {classes.map((classItem) => (
          <li
            key={classItem.id}
            className="border-border flex flex-col gap-2 rounded-lg border px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{classItem.name}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {classItem.code} · {classItem.schoolName}
                </p>
              </div>
              <DeleteClassButton classId={classItem.id} />
            </div>
            <p className="text-muted-foreground text-xs">
              {classItem.teachers[0]?.name ?? "No teacher"}
              {classItem.teachers.length > 1 &&
                ` +${classItem.teachers.length - 1}`}
              {" · "}
              {classItem.meetingCount}{" "}
              {classItem.meetingCount === 1 ? "meeting" : "meetings"}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <AssignTeacherDialog
                classId={classItem.id}
                className={classItem.name}
                teacherList={teacherData}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/dashboard/class/${classItem.code}`} />}
              >
                View
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
