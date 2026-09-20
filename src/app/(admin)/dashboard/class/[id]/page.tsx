import { ArrowLeft01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import MeetingList from "./meeting-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
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

  if (!classData) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Class {classData.code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          Back
        </Button>
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {classData.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {classData.meetings.length} pertemuan
          </p>
        </div>
        <Button
          type="button"
          nativeButton={false}
          render={<Link href={`/dashboard/class/${classData.code}/create`} />}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Create meeting
        </Button>
      </div>

      <MeetingList
        meetings={classData.meetings.map((meeting) => ({
          ...meeting,
          scheduledAt: meeting.scheduledAt.toISOString(),
        }))}
      />
    </main>
  );
}
