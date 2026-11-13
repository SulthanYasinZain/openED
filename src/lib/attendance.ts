import { z } from "zod";

export const attendanceOptions = [
  {
    value: "PRESENT",
    label: "Present",
    dot: "bg-emerald-500",
    selected:
      "border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100",
  },
  {
    value: "LATE",
    label: "Late",
    dot: "bg-amber-500",
    selected:
      "border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-100",
  },
  {
    value: "ABSENT",
    label: "Absent",
    dot: "bg-red-500",
    selected:
      "border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600/20 hover:bg-red-100",
  },
  {
    value: "EXCUSED",
    label: "Excused",
    dot: "bg-slate-400",
    selected:
      "border-slate-500 bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 hover:bg-slate-200",
  },
] as const;

export type AttendanceValue = (typeof attendanceOptions)[number]["value"];

export const saveAttendanceSchema = z.object({
  classCode: z.string().min(1),
  meetingId: z.number().int().positive(),
  attendance: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        status: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
        note: z.string().trim().max(500),
      }),
    )
    .min(1)
    .refine(
      (rows) => new Set(rows.map((row) => row.studentId)).size === rows.length,
      "Students must be unique",
    ),
});
