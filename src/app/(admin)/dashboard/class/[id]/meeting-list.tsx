"use client";

import { DocumentAttachmentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Markdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export interface MeetingListItem {
  id: number;
  topic: string;
  description: string | null;
  fileUrl: string | null;
  scheduledAt: string;
}

export default function MeetingList({
  meetings,
}: {
  meetings: MeetingListItem[];
}) {
  if (meetings.length === 0) {
    return (
      <div className="border-border mt-8 rounded-lg border px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Belum ada pertemuan. Buat yang pertama.
        </p>
      </div>
    );
  }

  return (
    <Accordion className="mt-8">
      {meetings.map((meeting) => (
        <AccordionItem key={meeting.id} value={`meeting-${meeting.id}`}>
          <AccordionTrigger>
            <span className="flex min-w-0 flex-col items-start gap-0.5">
              <span className="truncate text-sm font-medium">
                {meeting.topic}
              </span>
              <span className="text-muted-foreground text-sm font-normal">
                {new Date(meeting.scheduledAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {meeting.description ? (
              <div className="[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
                <Markdown>{meeting.description}</Markdown>
              </div>
            ) : (
              <p className="text-muted-foreground">No description yet.</p>
            )}
            <div className="mt-4 flex items-center gap-2">
              {meeting.fileUrl && (
                <Button
                  type="button"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a href={meeting.fileUrl} target="_blank" rel="noreferrer">
                      <HugeiconsIcon
                        icon={DocumentAttachmentIcon}
                        strokeWidth={2}
                      />
                      View PDF
                    </a>
                  }
                />
              )}
              <Button type="button" variant="outline" size="sm">
                Grade
              </Button>
              <Button type="button" size="sm">
                Presence
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
