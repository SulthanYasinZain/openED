import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateClassForm from "@/components/create-class-form";
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

  const classData = await prisma.class.findMany({});

  return (
    <main>
      <CreateClassForm />

      <ul>
        {classData.map((classItem) => (
          <li key={classItem.id}>
            {classItem.name} - {classItem.code}
          </li>
        ))}
      </ul>
    </main>
  );
}
