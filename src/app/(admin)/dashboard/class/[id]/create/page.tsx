import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateMeetingForm from "./create-meeting-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatePage({ params }: PageProps) {
  const { id: code } = await params;

  const classData = await prisma.class.findUnique({
    where: { code },
    select: { id: true },
  });

  if (!classData) {
    notFound();
  }

  return <CreateMeetingForm classCode={code} />;
}
