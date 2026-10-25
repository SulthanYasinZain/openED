import { z } from "zod";

export const gradeCategories = [
  {
    key: "programming",
    label: "Programming",
    description: "Logic, implementation, and technical quality",
    color: "bg-[#5579c6]",
  },
  {
    key: "creativity",
    label: "Creativity",
    description: "Originality, exploration, and problem solving",
    color: "bg-[#8563b8]",
  },
  {
    key: "design",
    label: "Design",
    description: "Visual craft, usability, and presentation",
    color: "bg-[#d28d41]",
  },
] as const;

export const gradeColumns = [
  ...gradeCategories,
  { key: "finalAverage", label: "Final average" },
] as const;

export type GradeCategory = (typeof gradeCategories)[number]["key"];

export function calculatedGradeAverage(
  scores: Record<GradeCategory, string>,
): string {
  const values = gradeCategories.map(({ key }) => scores[key]);
  if (
    values.some(
      (value) =>
        value === "" ||
        !Number.isInteger(Number(value)) ||
        Number(value) < 0 ||
        Number(value) > 100,
    )
  )
    return "";
  const total = values.reduce((sum, value) => sum + Number(value), 0);
  return String(Math.round((total / values.length) * 100) / 100);
}

const score = z.number().int().min(0).max(100).nullable();

export const saveGradesSchema = z.object({
  classCode: z.string().min(1),
  meetingId: z.number().int().positive(),
  grades: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        programming: score,
        creativity: score,
        design: score,
      }),
    )
    .min(1)
    .refine(
      (grades) =>
        new Set(grades.map((grade) => grade.studentId)).size === grades.length,
      "Students must be unique",
    ),
});

export type GradeInput = z.infer<typeof saveGradesSchema>["grades"][number];
