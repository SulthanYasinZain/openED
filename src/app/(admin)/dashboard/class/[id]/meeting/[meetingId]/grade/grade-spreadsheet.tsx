"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  calculatedGradeAverage,
  type GradeCategory,
  gradeCategories,
  gradeColumns,
} from "@/lib/grading";
import { cn } from "@/lib/utils";

type Cell = { studentId: number; column: number };
type Fill = {
  start: number;
  end: number;
  column: number;
  endColumn: number;
  value: string;
  studentIds: number[];
};

export type SpreadsheetRow = {
  studentId: number;
  name: string;
} & Record<GradeCategory, string>;

export default function GradeSpreadsheet({
  rows,
  disabled,
  onFill,
}: {
  rows: SpreadsheetRow[];
  disabled: boolean;
  onFill: (
    studentIds: number[],
    category: GradeCategory,
    value: string,
  ) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Cell | null>(null);
  const [fill, setFill] = useState<Fill | null>(null);
  const drag = useRef<Fill | null>(null);
  const activeRow = active
    ? rows.findIndex((row) => row.studentId === active.studentId)
    : -1;
  const selected = rows[activeRow];
  const category = active ? gradeCategories[active.column] : undefined;

  function finishFill(commit: boolean) {
    const current = drag.current;
    drag.current = null;
    setFill(null);
    if (!current || !commit || disabled) return;
    const first = Math.min(current.start, current.end);
    const last = Math.max(current.start, current.end);
    const firstColumn = Math.min(current.column, current.endColumn);
    const lastColumn = Math.max(current.column, current.endColumn);
    for (let column = firstColumn; column <= lastColumn; column++) {
      onFill(
        current.studentIds.slice(first, last + 1),
        gradeCategories[column].key,
        current.value,
      );
    }
  }

  return (
    <div
      ref={root}
      className="border-border mt-5 overflow-hidden rounded-xl border"
    >
      <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="bg-background min-w-12 rounded border px-2 py-1 text-center font-medium tabular-nums">
            {active && selected
              ? `${String.fromCharCode(66 + active.column)}${activeRow + 1}`
              : "—"}
          </span>
          <span className="text-muted-foreground">
            {selected && category
              ? `${selected.name} · ${category.label}`
              : "Select a score to start editing"}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            disabled || !selected || !active || activeRow >= rows.length - 1
          }
          onClick={() => {
            if (selected && active && category)
              onFill(
                rows.slice(activeRow + 1).map((row) => row.studentId),
                category.key,
                selected[category.key],
              );
          }}
        >
          Fill down
        </Button>
      </div>
      <div className="max-h-[65vh] overflow-auto">
        <table className="w-full min-w-[800px] border-collapse text-xs">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="text-muted-foreground w-12 border-r border-b p-2 font-normal"
              >
                #
              </th>
              <th
                scope="col"
                className="border-r border-b px-4 py-3 text-left font-medium"
              >
                <span className="text-muted-foreground mr-3 font-normal">
                  A
                </span>
                Student
              </th>
              {gradeColumns.map(({ key, label }, column) => (
                <th
                  scope="col"
                  key={key}
                  className="w-[18%] border-r border-b px-3 py-3 text-left font-medium last:border-r-0"
                >
                  <span className="text-muted-foreground mr-3 font-normal">
                    {String.fromCharCode(66 + column)}
                  </span>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.studentId}>
                <th
                  scope="row"
                  className="bg-muted/40 text-muted-foreground border-r border-b p-2 text-center font-normal tabular-nums"
                >
                  {rowIndex + 1}
                </th>
                <td className="border-r border-b px-4 py-3">
                  <span
                    className="block max-w-64 truncate font-medium"
                    title={row.name}
                  >
                    {row.name}
                  </span>
                </td>
                {gradeColumns.map(({ key, label }, column) => {
                  if (key === "finalAverage") {
                    return (
                      <td
                        key={key}
                        data-grade-row={rowIndex}
                        data-grade-column={column}
                        className="bg-muted/20 border-b px-3 text-right font-medium tabular-nums"
                      >
                        <output aria-label={`${row.name} final average`}>
                          {calculatedGradeAverage(row) || "—"}
                        </output>
                      </td>
                    );
                  }
                  const isActive =
                    active?.studentId === row.studentId &&
                    active.column === column;
                  const isFilling =
                    fill &&
                    column >= Math.min(fill.column, fill.endColumn) &&
                    column <= Math.max(fill.column, fill.endColumn) &&
                    rowIndex >= Math.min(fill.start, fill.end) &&
                    rowIndex <= Math.max(fill.start, fill.end);
                  return (
                    <td
                      key={key}
                      data-grade-row={rowIndex}
                      data-grade-column={column}
                      className={cn(
                        "relative border-r border-b p-0 last:border-r-0",
                        isFilling && "bg-primary/10",
                        isActive && "ring-primary z-1 ring-2 ring-inset",
                      )}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="(100|[0-9]{1,2})?"
                        value={row[key]}
                        placeholder="—"
                        disabled={disabled}
                        aria-label={`${row.name} ${label} score out of 100`}
                        data-grade-input={`${rowIndex}-${column}`}
                        className="h-11 w-full min-w-0 bg-transparent px-3 text-right tabular-nums outline-none placeholder:text-muted-foreground disabled:opacity-50"
                        onFocus={() =>
                          setActive({ studentId: row.studentId, column })
                        }
                        onChange={(event) =>
                          onFill([row.studentId], key, event.target.value)
                        }
                        onKeyDown={(event) => {
                          let nextRow = rowIndex;
                          if (
                            event.key === "ArrowDown" ||
                            event.key === "Enter"
                          )
                            nextRow +=
                              event.shiftKey && event.key === "Enter" ? -1 : 1;
                          else if (event.key === "ArrowUp") nextRow--;
                          else return;
                          event.preventDefault();
                          nextRow = Math.max(
                            0,
                            Math.min(rows.length - 1, nextRow),
                          );
                          const input =
                            root.current?.querySelector<HTMLInputElement>(
                              `[data-grade-input="${nextRow}-${column}"]`,
                            );
                          input?.focus();
                          input?.select();
                        }}
                      />
                      {isActive && !disabled && (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label={`Drag to copy ${label} score across categories or visible students`}
                          title="Drag in any direction to copy this score across editable cells."
                          className="absolute -right-1 -bottom-1 z-2 flex size-4 touch-none cursor-crosshair items-center justify-center after:size-2 after:border after:border-background after:bg-primary"
                          onPointerDown={(event) => {
                            if (event.button !== 0) return;
                            event.preventDefault();
                            event.currentTarget.setPointerCapture(
                              event.pointerId,
                            );
                            const current = {
                              start: rowIndex,
                              end: rowIndex,
                              column,
                              endColumn: column,
                              value: row[key],
                              studentIds: rows.map(
                                (student) => student.studentId,
                              ),
                            };
                            drag.current = current;
                            setFill(current);
                          }}
                          onPointerMove={(event) => {
                            if (!drag.current) return;
                            const cell = document
                              .elementFromPoint(event.clientX, event.clientY)
                              ?.closest<HTMLElement>(
                                "[data-grade-row][data-grade-column]",
                              );
                            if (!cell || !root.current?.contains(cell)) return;
                            const end = Number(cell.dataset.gradeRow);
                            const endColumn = Math.max(
                              0,
                              Math.min(
                                gradeCategories.length - 1,
                                Number(cell.dataset.gradeColumn),
                              ),
                            );
                            const current = { ...drag.current, end, endColumn };
                            drag.current = current;
                            setFill(current);
                            cell.scrollIntoView({
                              block: "nearest",
                              inline: "nearest",
                            });
                          }}
                          onPointerUp={() => finishFill(true)}
                          onPointerCancel={() => finishFill(false)}
                          onLostPointerCapture={() => finishFill(false)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground p-12 text-center"
                >
                  No students match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground bg-muted/20 px-3 py-2 text-xs">
        Scores are out of 100. Drag the blue cell handle horizontally,
        vertically, or diagonally to copy a score across the highlighted range.
        Use ↑ / ↓ or Enter to move; Tab to move across. Fill affects visible
        students only; final averages stay calculated and read-only.
      </p>
    </div>
  );
}
