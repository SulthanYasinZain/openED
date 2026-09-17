import JoinClassByCode from "@/components/join-class-by-code";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
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
    <>
      <ul>
        {classData.map((classItem) => (
          <li key={classItem.id}>
            {classItem.name}{" "}
            <button type="button" className="bg-black text-white">
              See Class{" "}
            </button>
          </li>
        ))}
      </ul>

      <JoinClassByCode />
    </>
  );
}
