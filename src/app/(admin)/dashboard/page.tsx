import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateClassForm from "@/components/create-class-form";
import AssingTeacherForm from "@/components/assign-teacher-form";
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return redirect("/login");
  }

  let payload;

  try {
    payload = await verifyAccessToken(token);
  } catch {
    redirect("/login");
  }

  if (payload.role !== "ADMIN") {
    return redirect("/");
  }

  let classData = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
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

  console.dir(classData, { depth: null });
  return (
    <main>
      <CreateClassForm />

      <ul>
        {classData.map((classItem) => (
          <li key={classItem.id}>
            {classItem.name} - {classItem.code} -{" "}
            {classItem.teachers[0]?.name ?? "No teacher"}
          </li>
        ))}
      </ul>

      <AssingTeacherForm teacherList={teacherData} classList={classData} />
    </main>
  );
}
