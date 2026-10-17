"use client";

import {
  BookOpen01Icon,
  Calendar01Icon,
  Clock01Icon,
  DocumentAttachmentIcon,
  UserIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Markdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MeetingStatus } from "@/generated/prisma/client";

export interface MeetingListItem {
  id: number;
  topic: string;
  description: string | null;
  fileUrl: string | null;
  scheduledAt: string;
  status: MeetingStatus;
}

function formatStatus(status: MeetingStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function MeetingList({
  meetings,
}: {
  meetings: MeetingListItem[];
}) {
  if (meetings.length === 0) {
    return (
      <div className="border-border mt-6 rounded-xl border px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Belum ada pertemuan. Buat yang pertama.
        </p>
      </div>
    );
  }

  return (
    <Accordion className="mt-6 gap-3">
      {meetings.map((meeting) => {
        const date = new Date(meeting.scheduledAt);
        return (
          <AccordionItem
            key={meeting.id}
            value={`meeting-${meeting.id}`}
            className="rounded-xl border px-4"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden="true"
                  className="border-border flex w-12 shrink-0 flex-col items-center rounded-lg border py-1.5"
                >
                  <span className="text-base leading-5 font-semibold tabular-nums">
                    {date.getDate()}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                    {date
                      .toLocaleDateString("id-ID", { month: "short" })
                      .replace(".", "")}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col gap-1 pt-0.5">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-sm font-semibold">
                      {meeting.topic}
                    </span>
                    {meeting.status === "UPCOMING" ? (
                      <span className="text-muted-foreground text-xs">
                        {formatStatus(meeting.status)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        {formatStatus(meeting.status)}
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                    <HugeiconsIcon
                      icon={Calendar01Icon}
                      size={12}
                      strokeWidth={2}
                    />
                    {date.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    <span aria-hidden="true">·</span>
                    <HugeiconsIcon
                      icon={Clock01Icon}
                      size={12}
                      strokeWidth={2}
                    />
                    {date.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-4 pl-15">
                {meeting.description ? (
                  <div className="text-muted-foreground text-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
                    <Markdown>{meeting.description}</Markdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No description yet.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {meeting.fileUrl && (
                    <Button
                      type="button"
                      size="sm"
                      nativeButton={false}
                      render={
                        <a
                          href={meeting.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <HugeiconsIcon
                            icon={DocumentAttachmentIcon}
                            strokeWidth={2}
                            data-icon="inline-start"
                          />
                          View PDF
                        </a>
                      }
                    />
                  )}
                  <Button type="button" variant="outline" size="sm">
                    <HugeiconsIcon
                      icon={BookOpen01Icon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Grade
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <HugeiconsIcon
                      icon={UserIcon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Attendance
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <HugeiconsIcon
                      icon={Video01Icon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Join meeting
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
