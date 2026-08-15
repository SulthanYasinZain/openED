import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken, checkSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ClassPage() {
  const sessionData = await checkSession("STUDENT");

  const classData = await prisma.class.findMany({
    where: {
      studentEnrollments: {
        some: {
          studentId: sessionData.userId,
        },
      },
    },
  });

  return (
    <ul>
      {classData.map((classItem) => (
        <li key={classItem.id}>
          {classItem.name}{" "}
          <button className="bg-black text-white">See Class </button>
        </li>
      ))}
    </ul>
  );
}
