"use client";

import {
  BookOpen01Icon,
  GridIcon,
  ListViewIcon,
  Search01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { saveMeetingGradesAction } from "@/app/actions/grade";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculatedGradeAverage,
  type GradeCategory,
  type GradeInput,
  gradeCategories,
  gradeColumns,
} from "@/lib/grading";
import GradeSpreadsheet from "./grade-spreadsheet";

type GradeStudent = GradeInput & { name: string; email: string };
type Draft = { studentId: number } & Record<GradeCategory, string>;

function toDraft(student: GradeStudent): Draft {
  return {
    studentId: student.studentId,
    programming: student.programming?.toString() ?? "",
    creativity: student.creativity?.toString() ?? "",
    design: student.design?.toString() ?? "",
  };
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function GradeStudents({
  classCode,
  meetingId,
  topic,
  students,
}: {
  classCode: string;
  meetingId: number;
  topic: string;
  students: GradeStudent[];
}) {
  const [drafts, setDrafts] = useState(() => students.map(toDraft));
  const [saved, setSaved] = useState(() => students.map(toDraft));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"form" | "spreadsheet">("form");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const draftById = new Map(drafts.map((draft) => [draft.studentId, draft]));
  const savedById = new Map(saved.map((draft) => [draft.studentId, draft]));
  const changed = drafts.filter((draft) => {
    const original = savedById.get(draft.studentId);
    return gradeCategories.some(({ key }) => draft[key] !== original?.[key]);
  });
  const visibleStudents = students.filter((student) => {
    const matchesSearch = `${student.name} ${student.email}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const draft = draftById.get(student.studentId);
    const complete = draft && calculatedGradeAverage(draft) !== "";
    return (
      matchesSearch &&
      (filter === "all" || (filter === "graded" ? complete : !complete))
    );
  });

  function updateScore(
    studentId: number,
    category: GradeCategory,
    value: string,
  ) {
    fillScores([studentId], category, value);
  }

  function fillScores(
    studentIds: number[],
    category: GradeCategory,
    value: string,
  ) {
    if (pending) return;
    const ids = new Set(studentIds);
    setDrafts((current) =>
      current.map((draft) =>
        ids.has(draft.studentId) ? { ...draft, [category]: value } : draft,
      ),
    );
    setMessage("");
    setError("");
  }

  function saveGrades() {
    if (pending || changed.length === 0) return;
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const result = await saveMeetingGradesAction({
          classCode,
          meetingId,
          grades: changed.map((draft) => ({
            studentId: draft.studentId,
            programming:
              draft.programming === "" ? null : Number(draft.programming),
            creativity:
              draft.creativity === "" ? null : Number(draft.creativity),
            design: draft.design === "" ? null : Number(draft.design),
          })),
        });
        if (result.error) {
          setError(result.error);
          return;
        }
        setSaved(drafts.map((draft) => ({ ...draft })));
        setMessage("Grades saved successfully.");
      } catch {
        setError("Unable to save grades. Please try again.");
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        saveGrades();
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Grade students
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter scores for{" "}
            <span className="text-foreground font-medium">{topic}</span> across
            Programming, Creativity, and Design.
          </p>
        </div>
        <Button
          type="submit"
          disabled={pending || changed.length === 0}
          className="shrink-0"
        >
          {pending ? "Saving..." : "Save grades"}
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {gradeCategories.map((category) => {
          const scores = drafts
            .map((draft) => draft[category.key])
            .filter(
              (value) =>
                value !== "" &&
                Number.isInteger(Number(value)) &&
                Number(value) >= 0 &&
                Number(value) <= 100,
            )
            .map(Number);
          const average = scores.length
            ? Math.round(
                scores.reduce((sum, value) => sum + value, 0) / scores.length,
              )
            : "—";
          return (
            <section
              key={category.key}
              aria-label={`${category.label} average`}
              className="border-border flex items-center gap-2 rounded-xl border bg-background px-3 py-5 shadow-xs lg:gap-3 lg:px-5 lg:py-6"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-white lg:size-11 ${category.color}`}
              >
                <HugeiconsIcon
                  icon={BookOpen01Icon}
                  size={21}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-medium lg:text-sm">
                  {category.label}
                </h2>
                <p className="text-muted-foreground mt-1 max-w-40 text-[10px] leading-relaxed lg:text-xs">
                  {category.description}
                </p>
              </div>
              <div className="border-border shrink-0 border-l pl-3 text-center lg:pl-4">
                <p className="text-xl font-semibold tabular-nums">{average}</p>
                <p className="text-muted-foreground mt-1 text-[10px]">
                  Average
                </p>
              </div>
            </section>
          );
        })}
      </div>

      <Tabs
        value={view}
        onValueChange={(value) => {
          if (value === "form" || value === "spreadsheet") setView(value);
        }}
        className="mt-8 gap-0"
      >
        <div className="border-border flex flex-wrap items-center gap-1 border-t pt-2.5">
          <TabsList variant="line" aria-label="Grade view">
            <TabsTrigger value="form">
              <HugeiconsIcon
                icon={ListViewIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Form
            </TabsTrigger>
            <TabsTrigger value="spreadsheet">
              <HugeiconsIcon
                icon={GridIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Spreadsheet
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-56">
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
                className="h-8 pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button type="button" variant="ghost" size="sm" />}
              >
                <HugeiconsIcon icon={SlidersHorizontalIcon} strokeWidth={1.8} />
                {filter === "all"
                  ? "Filter"
                  : filter === "graded"
                    ? "Fully graded"
                    : "Needs grading"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuRadioGroup
                  value={filter}
                  onValueChange={setFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    All students
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="graded">
                    Fully graded
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ungraded">
                    Needs grading
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="spreadsheet">
          <GradeSpreadsheet
            rows={visibleStudents.map((student) => ({
              studentId: student.studentId,
              name: student.name,
              programming: draftById.get(student.studentId)?.programming ?? "",
              creativity: draftById.get(student.studentId)?.creativity ?? "",
              design: draftById.get(student.studentId)?.design ?? "",
            }))}
            disabled={pending}
            onFill={fillScores}
          />
        </TabsContent>
        <TabsContent value="form">
          <div className="border-border mt-5 overflow-hidden rounded-xl border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[28%] px-4 py-3 text-xs font-normal">
                    Student
                  </TableHead>
                  {gradeColumns.map(({ key, label }) => (
                    <TableHead
                      key={key}
                      className="px-4 py-3 text-xs font-normal"
                    >
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleStudents.map((student) => {
                  const draft = draftById.get(student.studentId);
                  return (
                    <TableRow key={student.studentId}>
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-blue-50 text-[10px] font-medium text-blue-700">
                              {initials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className="max-w-52 truncate font-medium"
                            title={student.name}
                          >
                            {student.name}
                          </span>
                        </span>
                      </TableCell>
                      {gradeColumns.map(({ key, label }) =>
                        key === "finalAverage" ? (
                          <TableCell key={key} className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <output
                                aria-label={`${student.name} final average`}
                                className="inline-block w-[4.5rem] px-2 text-xs font-medium tabular-nums"
                              >
                                {draft
                                  ? calculatedGradeAverage(draft) || "—"
                                  : "—"}
                              </output>
                              <span className="text-muted-foreground text-[10px]">
                                /100
                              </span>
                            </span>
                          </TableCell>
                        ) : (
                          <TableCell key={key} className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                placeholder="—"
                                value={draft?.[key] ?? ""}
                                disabled={pending}
                                onChange={(event) =>
                                  updateScore(
                                    student.studentId,
                                    key,
                                    event.target.value,
                                  )
                                }
                                aria-label={`${student.name} ${label} score`}
                                className="h-8 w-[4.5rem] rounded-md px-2 text-xs font-medium tabular-nums placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <span className="text-muted-foreground text-[10px]">
                                /100
                              </span>
                            </span>
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  );
                })}
                {visibleStudents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-12 text-center"
                    >
                      {students.length === 0
                        ? "No students enrolled in this class yet."
                        : "No students match your search or filter."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-muted-foreground mt-3 text-xs">
        Final average is calculated when all three category scores are entered.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <p className="text-muted-foreground">
          {visibleStudents.length} of {students.length} students
          {changed.length > 0
            ? ` · ${changed.length} unsaved ${changed.length === 1 ? "student" : "students"}`
            : ""}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      )}
      <output className="mt-3 block text-sm text-emerald-700">{message}</output>
    </form>
  );
}
