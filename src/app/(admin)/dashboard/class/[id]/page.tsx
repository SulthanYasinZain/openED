import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  await checkSession("ADMIN");

  const { id: code } = await params;

  const classData = await prisma.class.findUnique({
    where: { code },
    select: {
      id: true,
      name: true,
      code: true,
      meetings: {
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          topic: true,
          description: true,
          fileUrl: true,
          scheduledAt: true,
          status: true,
        },
      },
    },
  });

  console.log(classData);

  if (!classData) {
    notFound();
  }

  return (
    <main className="p-6   space-y-4">
      <Link
        href="/dashboard"
        className="text-sm text-stone-500 hover:underline mb-4 inline-block"
      >
        ← Kembali ke Dashboard
      </Link>

      <div className="flex">
        <Link href={`/dashboard/class/${classData.code}/create`}>
          Buat Kelas
        </Link>
        <ul className="space-y-3">
          {classData.meetings.length === 0 && (
            <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-stone-500">
                Belum ada pertemuan. Buat yang pertama.
              </p>
            </li>
          )}

          {classData.meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-1">
                <p className="font-medium text-stone-900">{meeting.topic}</p>
                {meeting.fileUrl && (
                  <a
                    href={meeting.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-stone-500 hover:underline"
                  >
                    View material
                  </a>
                )}
                <p className="text-sm text-stone-500">
                  {meeting.scheduledAt.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-md border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50">
                  View
                </button>

                <button className="rounded-md border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50">
                  Grade
                </button>

                <button className="rounded-md bg-stone-900 px-3 py-2 text-sm text-white hover:bg-stone-800">
                  Presence
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <p>{classData.meetings.length} pertemuan</p>
          <p>{classData.name}</p>
        </div>
      </div>
    </main>
  );
}
