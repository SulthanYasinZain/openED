"use client";

import { Calendar01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { saveMeetingAttendanceAction } from "@/app/actions/attendance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type AttendanceValue, attendanceOptions } from "@/lib/attendance";
import { cn } from "@/lib/utils";

type AttendanceStudent = {
  studentId: number;
  name: string;
  email: string;
  status: AttendanceValue | null;
  note: string;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function MarkAttendance({
  classCode,
  meetingId,
  topic,
  className,
  scheduledAt,
  dateLabel,
  timeLabel,
  students,
}: {
  classCode: string;
  meetingId: number;
  topic: string;
  className: string;
  scheduledAt: string;
  dateLabel: string;
  timeLabel: string;
  students: AttendanceStudent[];
}) {
  const [drafts, setDrafts] = useState(students);
  const [saved, setSaved] = useState(students);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const savedById = new Map(saved.map((row) => [row.studentId, row]));
  const changed = drafts.filter((row) => {
    const original = savedById.get(row.studentId);
    return row.status !== original?.status || row.note !== original?.note;
  });
  const query = search.trim().toLowerCase();
  const visibleStudents = drafts.filter((student) =>
    `${student.name} ${student.email}`.toLowerCase().includes(query),
  );
  const unmarked = drafts.filter((row) => row.status === null).length;

  function updateStudent(
    studentId: number,
    values: Partial<Pick<AttendanceStudent, "status" | "note">>,
  ) {
    setDrafts((current) =>
      current.map((row) =>
        row.studentId === studentId ? { ...row, ...values } : row,
      ),
    );
    setMessage("");
    setError("");
  }

  function markAllPresent() {
    setDrafts((current) =>
      current.map((row) => ({ ...row, status: "PRESENT" })),
    );
    setMessage("");
    setError("");
  }

  function saveAttendance() {
    if (pending || changed.length === 0) return;
    if (changed.some((row) => row.status === null)) {
      setError(
        "Choose an attendance status for each student with an edited note.",
      );
      return;
    }
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const result = await saveMeetingAttendanceAction({
          classCode,
          meetingId,
          attendance: changed.map(({ studentId, status, note }) => ({
            studentId,
            status,
            note,
          })),
        });
        if (result.error) {
          setError(result.error);
          return;
        }
        setSaved(drafts.map((row) => ({ ...row })));
        setMessage("Attendance saved successfully.");
      } catch {
        setError("Unable to save attendance. Please try again.");
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        saveAttendance();
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mark attendance
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Record student presence for{" "}
            <span className="text-foreground font-medium">{topic}</span>.
          </p>
        </div>
        <Button
          type="submit"
          disabled={pending || changed.length === 0}
          className="shrink-0"
        >
          {pending ? "Saving..." : "Save attendance"}
        </Button>
      </div>

      <dl className="border-border mt-6 grid grid-cols-2 divide-x overflow-hidden rounded-xl border sm:grid-cols-4">
        {attendanceOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <dt className="text-muted-foreground inline-flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className={cn("size-2 rounded-full", option.dot)}
              />
              {option.label}
            </dt>
            <dd className="font-semibold tabular-nums">
              {drafts.filter((row) => row.status === option.value).length}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-border bg-muted/30 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-4 py-4">
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Calendar01Icon}
            size={18}
            strokeWidth={1.7}
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold">
              <time dateTime={scheduledAt}>{dateLabel}</time>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {timeLabel} · {className}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            pending ||
            drafts.length === 0 ||
            drafts.every((row) => row.status === "PRESENT")
          }
          onClick={markAllPresent}
        >
          Mark all present
        </Button>
      </div>

      <div className="mt-4 border-b pb-4">
        <div className="relative w-full max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            strokeWidth={1.8}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label="Search students"
            placeholder="Search students..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border-border mt-5 overflow-hidden rounded-xl border">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[25%] px-4 py-3 text-xs font-normal">
                Student
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-normal">
                Attendance status
              </TableHead>
              <TableHead className="w-[28%] px-4 py-3 text-xs font-normal">
                Note
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleStudents.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell className="px-4 py-3">
                  <span className="inline-flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-blue-50 text-[10px] font-medium text-blue-700">
                        {initials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="max-w-48 truncate font-medium"
                      title={student.name}
                    >
                      {student.name}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <fieldset className="inline-flex items-center gap-1.5">
                    <legend className="sr-only">
                      Attendance for {student.name}
                    </legend>
                    {attendanceOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        aria-pressed={student.status === option.value}
                        onClick={() =>
                          updateStudent(student.studentId, {
                            status: option.value,
                          })
                        }
                        className={cn(
                          "h-7 rounded-md px-2.5 text-xs font-normal shadow-none",
                          student.status === option.value
                            ? option.selected
                            : "text-muted-foreground",
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </fieldset>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Input
                    aria-label={`Note for ${student.name}`}
                    placeholder="Add a note..."
                    value={student.note}
                    maxLength={500}
                    disabled={pending}
                    onChange={(event) =>
                      updateStudent(student.studentId, {
                        note: event.target.value,
                      })
                    }
                    className="h-8 w-full min-w-32 border-transparent bg-muted/40 text-xs shadow-none hover:border-input focus-visible:bg-background"
                  />
                </TableCell>
              </TableRow>
            ))}
            {visibleStudents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground py-12 text-center"
                >
                  {students.length === 0
                    ? "No students enrolled in this class yet."
                    : "No students match your search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        {visibleStudents.length} of {students.length} students · {unmarked}{" "}
        unmarked{changed.length > 0 ? ` · ${changed.length} unsaved` : ""}
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      )}
      <output className="mt-3 block text-sm text-emerald-700">{message}</output>
    </form>
  );
}
