"use client";

import {
  Calendar01Icon,
  Cancel01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import LogsFeed, { type LogRow } from "./logs-feed";

type DateFilter = "after" | "before";

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

export default function LogsDataTable({ data }: { data: LogRow[] }) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All actions");
  const [dateFilters, setDateFilters] = useState<DateFilter[]>([]);
  const [loggedAfter, setLoggedAfter] = useState("");
  const [loggedBefore, setLoggedBefore] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [expanded, setExpanded] = useState<string[]>([]);

  const actions = useMemo(
    () => [
      "All actions",
      ...Array.from(new Set(data.map((log) => log.action))),
    ],
    [data],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((log) => {
      if (action !== "All actions" && log.action !== action) {
        return false;
      }
      if (loggedAfter && log.loggedDay < loggedAfter) {
        return false;
      }
      if (loggedBefore && log.loggedDay > loggedBefore) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack =
        `${log.title} ${log.description} ${log.action} ${log.tables} ${log.actorName} ${log.actorEmail}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [data, search, action, loggedAfter, loggedBefore]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset to first page whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, action, loggedAfter, loggedBefore]);

  const availableDateFilters: DateFilter[] = (
    ["after", "before"] as const
  ).filter((filter) => !dateFilters.includes(filter));

  function removeDateFilter(filter: DateFilter) {
    setDateFilters((current) => current.filter((item) => item !== filter));
    if (filter === "after") {
      setLoggedAfter("");
    } else {
      setLoggedBefore("");
    }
  }

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const rangeStart =
    visible.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, visible.length);

  const hasFilters =
    search !== "" || action !== "All actions" || dateFilters.length > 0;

  function clearFilters() {
    setSearch("");
    setAction("All actions");
    setDateFilters([]);
    setLoggedAfter("");
    setLoggedBefore("");
  }

  return (
    <div className="flex flex-col gap-4 text-[13px]">
      <Separator />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm min-w-52">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search action, entity, or actor..."
            aria-label="Search activity logs"
            className="pl-9"
          />
        </div>
        <Select
          value={action}
          onValueChange={(value) => setAction(value ?? "All actions")}
        >
          <SelectTrigger className="w-fit gap-1.5" aria-label="Action">
            <span className="text-muted-foreground">Action:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectGroup>
              {actions.map((option) => (
                <SelectItem key={option} value={option} className="px-3 py-2">
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {availableDateFilters.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="ghost" size="sm">
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Add filter
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-fit">
              {availableDateFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter}
                  className="px-3 py-2"
                  onClick={() =>
                    setDateFilters((current) => [...current, filter])
                  }
                >
                  <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
                  Logged {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button type="button" variant="ghost" size="sm" disabled>
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Add filter
          </Button>
        )}
        {dateFilters.map((filter) => (
          <span
            key={filter}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1 text-xs whitespace-nowrap"
          >
            Logged {filter}
            <input
              type="date"
              aria-label={`Logged ${filter}`}
              value={filter === "after" ? loggedAfter : loggedBefore}
              onChange={(event) =>
                filter === "after"
                  ? setLoggedAfter(event.target.value)
                  : setLoggedBefore(event.target.value)
              }
              className="w-32 bg-transparent text-xs outline-none"
            />
            <button
              type="button"
              aria-label={`Remove logged ${filter} filter`}
              onClick={() => removeDateFilter(filter)}
              className="text-stone-500 hover:text-stone-900"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </button>
          </span>
        ))}
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>

      <LogsFeed
        logs={paged}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />

      <footer className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          Rows per page
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value ?? 5));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-fit" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 15].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>
            {rangeStart}-{rangeEnd} of {visible.length} <strong>rows</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            disabled={currentPage === 1}
            onClick={() => setPage(1)}
          >
            <HugeiconsIcon icon={ChevronsLeftIcon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} />
          </Button>
          {pageItems(currentPage - 1, totalPages).map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                type="button"
                variant={item + 1 === currentPage ? "default" : "outline"}
                size="icon-sm"
                onClick={() => setPage(item + 1)}
              >
                {item + 1}
              </Button>
            ) : (
              <span key={item} className="px-0.5" aria-hidden="true">
                …
              </span>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            disabled={currentPage === totalPages}
            onClick={() => setPage(totalPages)}
          >
            <HugeiconsIcon icon={ChevronsRightIcon} strokeWidth={2} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
