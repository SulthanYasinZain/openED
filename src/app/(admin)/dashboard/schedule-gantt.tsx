"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import type { ScheduleMeeting } from "./schedule-calendar";
import { classColor } from "./schedule-colors";

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function mondayOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function minutesOf(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

const HOUR_PX = 52;
const MEETING_MINUTES = 60;

type Block = {
  meeting: ScheduleMeeting;
  top: number;
  height: number;
  lane: number;
  lanes: number;
};

export default function ScheduleGantt({
  meetings,
}: {
  meetings: ScheduleMeeting[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = dayKey(new Date());

  const days = useMemo(() => {
    const monday = mondayOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return day;
    });
  }, [weekOffset]);

  const weekMeetings = useMemo(
    () =>
      meetings
        .map((meeting) => ({
          meeting,
          date: new Date(meeting.scheduledAt),
        }))
        .filter(({ date }) => days.some((day) => dayKey(day) === dayKey(date))),
    [meetings, days],
  );

  const startHour = useMemo(() => {
    if (weekMeetings.length === 0) return 8;
    return Math.max(
      6,
      Math.floor(
        Math.min(...weekMeetings.map(({ date }) => minutesOf(date))) / 60,
      ),
    );
  }, [weekMeetings]);

  const endHour = useMemo(() => {
    if (weekMeetings.length === 0) return 16;
    return Math.min(
      21,
      Math.ceil(
        Math.max(
          ...weekMeetings.map(({ date }) => minutesOf(date) + MEETING_MINUTES),
        ) / 60,
      ),
    );
  }, [weekMeetings]);

  const hours = useMemo(
    () =>
      Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );
  const gridHeight = (endHour - startHour) * HOUR_PX;

  const blocksByDay = useMemo(() => {
    const map = new Map<string, Block[]>();
    for (const day of days) {
      const key = dayKey(day);
      const dayMeetings = weekMeetings
        .filter(({ date }) => dayKey(date) === key)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const blocks: Block[] = [];
      let cluster: { end: number; members: number[] } = {
        end: -1,
        members: [],
      };
      const clusters: { end: number; members: number[] }[] = [];
      for (const item of dayMeetings) {
        const start = minutesOf(item.date);
        if (start >= cluster.end) {
          cluster = { end: -1, members: [] };
          clusters.push(cluster);
        }
        const index = blocks.length;
        cluster.members.push(index);
        cluster.end = Math.max(cluster.end, start + MEETING_MINUTES);
        blocks.push({
          meeting: item.meeting,
          top: ((start - startHour * 60) / 60) * HOUR_PX,
          height: (MEETING_MINUTES / 60) * HOUR_PX - 3,
          lane: 0,
          lanes: 1,
        });
      }
      for (const group of clusters) {
        group.members.forEach((blockIndex, lane) => {
          blocks[blockIndex].lane = lane;
          blocks[blockIndex].lanes = group.members.length;
        });
      }
      map.set(key, blocks);
    }
    return map;
  }, [days, weekMeetings, startHour]);

  const rangeLabel = `${days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  const totalCount = weekMeetings.length;

  return (
    <section aria-label="Weekly schedule" className="flex flex-col">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {weekOffset === 0 ? "This week" : rangeLabel}
        </h2>
        <span className="text-muted-foreground text-sm tabular-nums">
          {weekOffset === 0 ? `${rangeLabel} · ` : ""}
          {totalCount} {totalCount === 1 ? "meeting" : "meetings"}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => setWeekOffset((offset) => offset - 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="rounded-md px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => setWeekOffset((offset) => offset + 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-150">
          <div className="grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))]">
            <div />
            {days.map((day) => {
              const isToday = dayKey(day) === today;
              return (
                <div
                  key={dayKey(day)}
                  className={`flex flex-col items-center rounded-lg py-1.5 ${isToday ? "bg-foreground text-background" : ""}`}
                >
                  <span
                    className={`text-[11px] font-medium ${isToday ? "text-background/70" : "text-muted-foreground"}`}
                  >
                    {day
                      .toLocaleDateString("en-GB", { weekday: "short" })
                      .replace(".", "")}
                  </span>
                  <span className="text-xl leading-7 font-semibold tabular-nums">
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {totalCount > 0 ? (
            <div className="mt-1 grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))]">
              <div className="relative" style={{ height: gridHeight }}>
                {hours.map((hour) => (
                  <span
                    key={hour}
                    style={{ top: (hour - startHour) * HOUR_PX }}
                    className="text-muted-foreground absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums"
                  >
                    {new Date(2026, 0, 1, hour).toLocaleTimeString("en-GB", {
                      hour: "numeric",
                      hour12: true,
                    })}
                  </span>
                ))}
              </div>
              {days.map((day) => {
                const key = dayKey(day);
                const isToday = key === today;
                const blocks = blocksByDay.get(key) ?? [];
                return (
                  <div
                    key={key}
                    style={{ height: gridHeight }}
                    className={`relative rounded-md ${isToday ? "bg-stone-100" : ""}`}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{ top: (hour - startHour) * HOUR_PX }}
                        className="border-border absolute right-0 left-0 border-t"
                      />
                    ))}
                    {isToday && (
                      <div className="bg-foreground absolute right-0 left-0 top-0 h-0.5 rounded-full" />
                    )}
                    {blocks.map((block) => (
                      <div
                        key={block.meeting.id}
                        title={`${block.meeting.topic} · ${block.meeting.className} · ${new Date(block.meeting.scheduledAt).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}`}
                        style={{
                          top: block.top,
                          height: Math.max(block.height, 20),
                          left: `calc(${(block.lane / block.lanes) * 100}% + 2px)`,
                          width: `calc(${100 / block.lanes}% - 4px)`,
                        }}
                        className={`absolute overflow-hidden rounded px-1.5 py-1 text-white ${classColor(block.meeting.className)}`}
                      >
                        <p className="truncate text-[11px] leading-4 font-semibold">
                          {new Date(
                            block.meeting.scheduledAt,
                          ).toLocaleTimeString("en-GB", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                        <p className="truncate text-[11px] leading-4 opacity-90">
                          {block.meeting.topic}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="border-border text-muted-foreground mt-1 rounded-md border border-dashed py-8 text-center text-xs">
              Nothing scheduled this week.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
