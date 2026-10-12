"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { classColor } from "./schedule-colors";
import { dayKey } from "./schedule-gantt";

export type ScheduleMeeting = {
  id: number;
  topic: string;
  className: string;
  scheduledAt: string;
};

const WEEKDAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function ScheduleCalendar({
  meetings,
}: {
  meetings: ScheduleMeeting[];
}) {
  const now = new Date();
  const today = dayKey(now);
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selected, setSelected] = useState(today);

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleMeeting[]>();
    for (const meeting of meetings) {
      const key = dayKey(new Date(meeting.scheduledAt));
      const list = map.get(key) ?? [];
      list.push(meeting);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    }
    return map;
  }, [meetings]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const leading = (first.getDay() + 6) % 7;
    const count = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const prevCount = new Date(cursor.year, cursor.month, 0).getDate();
    const items: { key: string; date: Date | null }[] = [];
    for (let index = 0; index < leading; index++) {
      items.push({
        key: `blank-${dayKey(new Date(cursor.year, cursor.month - 1, prevCount - leading + 1 + index))}`,
        date: null,
      });
    }
    for (let day = 1; day <= count; day++) {
      const date = new Date(cursor.year, cursor.month, day);
      items.push({ key: dayKey(date), date });
    }
    return items;
  }, [cursor]);

  const selectedMeetings = byDay.get(selected) ?? [];
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );

  function moveMonth(delta: number) {
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  return (
    <section aria-label="Schedule calendar" className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{monthLabel}</h2>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => moveMonth(-1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => moveMonth(1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-0.5">
        {WEEKDAY_HEADERS.map((label) => (
          <p
            key={label}
            className="text-muted-foreground pb-1 text-center text-[10px] font-medium"
          >
            {label}
          </p>
        ))}
        {cells.map(({ key: cellKey, date }) => {
          if (!date) {
            return <span key={cellKey} />;
          }
          const key = dayKey(date);
          const count = byDay.get(key)?.length ?? 0;
          const isToday = key === today;
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-label={`${date.getDate()}${count > 0 ? `, ${count} scheduled` : ""}`}
              className={`mx-auto flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-full text-xs tabular-nums ${isSelected ? "bg-foreground text-background font-semibold" : "text-stone-700 hover:bg-stone-100"} ${isToday && !isSelected ? "ring-2 ring-amber-400 ring-inset" : ""}`}
            >
              {date.getDate()}
              <span
                aria-hidden="true"
                style={{ width: count > 0 ? 4 + Math.min(count, 4) * 3 : 0 }}
                className={`h-1 rounded-full ${isSelected ? "bg-background" : "bg-amber-500"}`}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-3 border-t pt-2">
        <p className="text-xs font-semibold">
          {new Date(`${selected}T00:00:00`).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </p>
        {selectedMeetings.length === 0 ? (
          <p className="text-muted-foreground py-1.5 text-xs">
            No meetings this day.
          </p>
        ) : (
          <ul className="mt-1.5 flex max-h-32 flex-col gap-1.5 overflow-y-auto">
            {selectedMeetings.map((meeting) => (
              <li
                key={meeting.id}
                className="flex items-baseline gap-2 text-xs"
                title={`${meeting.topic} · ${meeting.className}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 size-2 shrink-0 rounded-[3px] ${classColor(meeting.className)}`}
                />
                <span className="font-semibold tabular-nums">
                  {new Date(meeting.scheduledAt).toLocaleTimeString("en-GB", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
                <span className="truncate text-stone-600">
                  {meeting.topic} · {meeting.className}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
