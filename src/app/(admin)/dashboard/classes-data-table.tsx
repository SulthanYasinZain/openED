"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  Book01Icon,
  Briefcase01Icon,
  Building02Icon,
  Calendar01Icon,
  Cancel01Icon,
  Search01Icon,
  Settings02Icon,
  SlidersHorizontalIcon,
  Tag01Icon,
  UserGroupIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CreateClassDialog, {
  type SchoolOption,
} from "@/components/create-class-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import type { ClassStatus } from "@/generated/prisma/client";
import ClassBulkActionsBar from "./class-bulk-actions-bar";
import ClassMemberCell, { type Member } from "./class-member-cell";
import ClassRowActions, { formatStatus } from "./class-row-actions";

export type ClassRow = {
  id: number;
  name: string;
  code: string;
  schoolId: number;
  schoolName: string;
  status: ClassStatus;
  teachers: Member[];
  students: Member[];
  meetingCount: number;
};

export type TeacherOption = Member;

const PAGE_SIZE = 10;

const WEEKDAYS = [
  { short: "Mon", letter: "M" },
  { short: "Tue", letter: "T" },
  { short: "Wed", letter: "W" },
  { short: "Thu", letter: "T" },
  { short: "Fri", letter: "F" },
  { short: "Sat", letter: "S" },
  { short: "Sun", letter: "S" },
];

const STATUS_BADGE: Record<ClassStatus, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  ARCHIVED: "outline",
};

const HIDEABLE_COLUMNS = [
  { label: "School", icon: Building02Icon },
  { label: "Teachers", icon: Briefcase01Icon },
  { label: "Students", icon: UserGroupIcon },
  { label: "Status", icon: Tag01Icon },
  { label: "Meetings", icon: Video01Icon },
  { label: "Week", icon: Calendar01Icon },
] as const;

// Columns that are hidden by default on narrow screens (below the xl breakpoint).
const RESPONSIVE_COLUMNS = ["Meetings", "Week"] as const;

function pageItems(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const wanted = new Set(
    [0, total - 1, current - 1, current, current + 1].filter(
      (page) => page >= 0 && page < total,
    ),
  );
  const sorted = [...wanted].sort((a, b) => a - b);
  const items: (number | string)[] = [];
  let previous = -2;

  for (const page of sorted) {
    if (page - previous > 1) {
      items.push(`ellipsis-${page}`);
    }
    items.push(page);
    previous = page;
  }

  return items;
}

export default function ClassesDataTable({
  classes,
  teachers,
  students,
  schools,
  weekActivity,
}: {
  classes: ClassRow[];
  teachers: TeacherOption[];
  students: Member[];
  schools: SchoolOption[];
  weekActivity: Record<number, number[]>;
}) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  // Columns the user toggled explicitly, so responsive defaults don't override them.
  const [touchedColumns, setTouchedColumns] = useState<string[]>([]);
  const [isXl, setIsXl] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsXl(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setHiddenColumns((items) => {
      let next = items;
      for (const label of RESPONSIVE_COLUMNS) {
        if (touchedColumns.includes(label)) {
          continue;
        }
        const currentlyHidden = next.includes(label);
        if (isXl && currentlyHidden) {
          next = next.filter((item) => item !== label);
        } else if (!isXl && !currentlyHidden) {
          next = [...next, label];
        }
      }
      return next;
    });
  }, [isXl, touchedColumns]);

  const isHidden = (label: string) => hiddenColumns.includes(label);
  const toggleColumn = (label: string, hidden: boolean) => {
    setTouchedColumns((items) =>
      items.includes(label) ? items : [...items, label],
    );
    setHiddenColumns((items) =>
      hidden ? [...items, label] : items.filter((item) => item !== label),
    );
  };
  const columnCount =
    3 +
    HIDEABLE_COLUMNS.filter((column) => !hiddenColumns.includes(column.label))
      .length;

  const query = search.trim().toLowerCase();
  const filtered = query
    ? classes.filter((classItem) =>
        [
          classItem.name,
          classItem.schoolName,
          ...classItem.teachers.map((teacher) => teacher.name ?? ""),
          ...classItem.students.map((student) => student.name ?? ""),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : classes;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function toggleSelected(id: number) {
    setSelectedIds((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }

  function toggleAll(ids: number[], checked: boolean) {
    setSelectedIds((items) =>
      checked
        ? [...new Set([...items, ...ids])]
        : items.filter((item) => !ids.includes(item)),
    );
  }

  return (
    <div className="mt-8">
      <div className="border-border flex flex-wrap items-center gap-1 border-t pt-2.5">
        <div className="ml-auto flex flex-wrap items-center gap-0.5">
          {searchOpen ? (
            <>
              <Input
                autoFocus
                placeholder="Search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="h-8 w-56"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  handleSearch("");
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
            >
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Search
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="ghost" size="sm">
                  <HugeiconsIcon
                    icon={SlidersHorizontalIcon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Hide
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-fit">
              {HIDEABLE_COLUMNS.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.label}
                  className="px-3 py-2"
                  checked={hiddenColumns.includes(column.label)}
                  onCheckedChange={(value) => toggleColumn(column.label, value)}
                >
                  <HugeiconsIcon icon={column.icon} strokeWidth={2} />
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateClassDialog schools={schools} />
        </div>
      </div>

      <div className="border-border mt-3 overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all"
                  checked={
                    rows.length > 0 &&
                    rows.every((classItem) =>
                      selectedIds.includes(classItem.id),
                    )
                  }
                  indeterminate={
                    rows.some((classItem) =>
                      selectedIds.includes(classItem.id),
                    ) &&
                    !rows.every((classItem) =>
                      selectedIds.includes(classItem.id),
                    )
                  }
                  onCheckedChange={(value) =>
                    toggleAll(
                      rows.map((classItem) => classItem.id),
                      value === true,
                    )
                  }
                />
              </TableHead>
              <TableHead className="w-full">
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon icon={Book01Icon} size={14} strokeWidth={2} />
                  Class
                </span>
              </TableHead>
              {!isHidden("School") && (
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={Building02Icon}
                      size={14}
                      strokeWidth={2}
                    />
                    School
                  </span>
                </TableHead>
              )}
              {!isHidden("Teachers") && (
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={Briefcase01Icon}
                      size={14}
                      strokeWidth={2}
                    />
                    Teachers
                  </span>
                </TableHead>
              )}
              {!isHidden("Students") && (
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      size={14}
                      strokeWidth={2}
                    />
                    Students
                  </span>
                </TableHead>
              )}
              {!isHidden("Status") && (
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon icon={Tag01Icon} size={14} strokeWidth={2} />
                    Status
                  </span>
                </TableHead>
              )}
              {!isHidden("Meetings") && (
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={Video01Icon}
                      size={14}
                      strokeWidth={2}
                    />
                    Meetings
                  </span>
                </TableHead>
              )}
              {!isHidden("Week") && (
                <TableHead>
                  <span
                    className="inline-flex items-center gap-1"
                    title="Weekdays this class meets"
                  >
                    {WEEKDAYS.map((day) => (
                      <span
                        key={day.short}
                        className="w-3 text-center text-[10px] font-semibold"
                      >
                        {day.letter}
                      </span>
                    ))}
                  </span>
                </TableHead>
              )}
              <TableHead className="text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <HugeiconsIcon
                    icon={Settings02Icon}
                    size={14}
                    strokeWidth={2}
                  />
                  Actions
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${classItem.name}`}
                    checked={selectedIds.includes(classItem.id)}
                    onCheckedChange={() => toggleSelected(classItem.id)}
                  />
                </TableCell>
                <TableCell className="w-full max-w-0">
                  <span
                    className="block truncate font-medium"
                    title={classItem.name}
                  >
                    {classItem.name}
                  </span>
                </TableCell>
                {!isHidden("School") && (
                  <TableCell>{classItem.schoolName}</TableCell>
                )}
                {!isHidden("Teachers") && (
                  <TableCell>
                    <ClassMemberCell
                      classId={classItem.id}
                      className={classItem.name}
                      kind="teacher"
                      members={classItem.teachers}
                      options={teachers}
                    />
                  </TableCell>
                )}
                {!isHidden("Students") && (
                  <TableCell>
                    <ClassMemberCell
                      classId={classItem.id}
                      className={classItem.name}
                      kind="student"
                      members={classItem.students}
                      options={students}
                    />
                  </TableCell>
                )}
                {!isHidden("Status") && (
                  <TableCell>
                    <Badge variant={STATUS_BADGE[classItem.status]}>
                      {formatStatus(classItem.status)}
                    </Badge>
                  </TableCell>
                )}
                {!isHidden("Meetings") && (
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon
                        icon={Calendar01Icon}
                        size={14}
                        strokeWidth={2}
                      />
                      {classItem.meetingCount}{" "}
                      {classItem.meetingCount === 1 ? "meeting" : "meetings"}
                    </span>
                  </TableCell>
                )}
                {!isHidden("Week") && (
                  <TableCell>
                    <span
                      className="inline-flex items-center gap-1"
                      title={
                        (weekActivity[classItem.id] ?? []).length > 0
                          ? `Meets ${WEEKDAYS.filter((_, index) =>
                              (weekActivity[classItem.id] ?? []).includes(
                                index,
                              ),
                            )
                              .map((day) => day.short)
                              .join(", ")}`
                          : "No recurring weekdays"
                      }
                    >
                      {WEEKDAYS.map((day, index) => (
                        <span
                          key={day.short}
                          aria-hidden="true"
                          className="flex w-3 justify-center"
                        >
                          <span
                            className={`size-1.5 rounded-full ${(weekActivity[classItem.id] ?? []).includes(index) ? "bg-primary" : "bg-border"}`}
                          />
                        </span>
                      ))}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/class/${classItem.code}`} />
                      }
                    >
                      View
                    </Button>
                    <ClassRowActions
                      classItem={classItem}
                      schools={schools}
                      teachers={teachers}
                      students={students}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-muted-foreground h-24 text-center text-sm"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <footer className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
        <div>
          Rows per page{" "}
          <button
            type="button"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-0.5"
          >
            {PAGE_SIZE}{" "}
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2} />
          </button>
          <span className="ml-2">
            {rangeStart}-{rangeEnd} of {total} rows
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="First page"
            disabled={safePage === 1}
            onClick={() => setPage(1)}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon
              icon={ArrowLeftDoubleIcon}
              size={13}
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
          </button>
          {pageItems(safePage - 1, totalPages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item + 1)}
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md ${item + 1 === safePage ? "bg-primary text-primary-foreground" : "text-stone-600 hover:bg-stone-100"}`}
              >
                {item + 1}
              </button>
            ) : (
              <span key={item} className="px-0.5" aria-hidden="true">
                …
              </span>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={safePage === totalPages}
            onClick={() => setPage(safePage + 1)}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={safePage === totalPages}
            onClick={() => setPage(totalPages)}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon
              icon={ArrowRightDoubleIcon}
              size={13}
              strokeWidth={2}
            />
          </button>
        </div>
      </footer>
      <ClassBulkActionsBar
        selected={filtered.filter((classItem) =>
          selectedIds.includes(classItem.id),
        )}
        totalVisible={total}
        onSelectAll={() =>
          setSelectedIds(filtered.map((classItem) => classItem.id))
        }
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
