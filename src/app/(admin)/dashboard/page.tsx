import { prisma } from "@/lib/prisma";
import ClassesDataTable from "./classes-data-table";
import ScheduleCalendar from "./schedule-calendar";
import ScheduleGantt from "./schedule-gantt";

export default async function DashboardPage() {
  const now = new Date();
  const [classData, teacherData, studentData, meetingData] = await Promise.all([
    prisma.class.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        school: { select: { name: true } },
        teachers: {
          where: { isDeleted: false },
          select: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        studentEnrollments: {
          where: { isDeleted: false },
          select: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { meetings: { where: { isDeleted: false } } },
        },
      },
    }),
    prisma.user.findMany({
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
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        isDeleted: false,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.classMeeting.findMany({
      where: { isDeleted: false },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        topic: true,
        scheduledAt: true,
        classId: true,
        class: { select: { name: true } },
      },
    }),
  ]);

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayCount = meetingData.filter((item) => {
    const date = item.scheduledAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return key === todayKey;
  }).length;

  const weekActivity = new Map<number, number[]>();
  for (const item of meetingData) {
    const weekday = (item.scheduledAt.getDay() + 6) % 7;
    const days = weekActivity.get(item.classId) ?? [];
    if (!days.includes(weekday)) {
      days.push(weekday);
      days.sort((a, b) => a - b);
    }
    weekActivity.set(item.classId, days);
  }

  const classes = classData.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    schoolName: item.school.name,
    status: item.status,
    teachers: item.teachers.map((item) => item.teacher),
    students: item.studentEnrollments.map((item) => item.student),
    meetingCount: item._count.meetings,
  }));

  const meetings = meetingData.map((item) => ({
    id: item.id,
    topic: item.topic,
    className: item.class.name,
    scheduledAt: item.scheduledAt.toISOString(),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-[13px] text-stone-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {now.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            · {todayCount} {todayCount === 1 ? "meeting" : "meetings"} today ·{" "}
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScheduleGantt meetings={meetings} />
        </div>
        <ScheduleCalendar meetings={meetings} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Classes{" "}
          <span className="text-muted-foreground font-normal">
            {classes.length}
          </span>
        </h2>
        <ClassesDataTable
          classes={classes}
          teachers={teacherData}
          students={studentData}
          weekActivity={Object.fromEntries(weekActivity)}
        />
      </div>
    </main>
  );
}
