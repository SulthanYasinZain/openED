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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "./constants";
import LogsFeed, { type LogRow } from "./logs-feed";

type DateFilter = "after" | "before";

type Filters = {
  q: string;
  action: string;
  after: string;
  before: string;
  page: number;
  size: number;
};

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

export default function LogsDataTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  initialSearch,
  currentAction,
  actions,
  after,
  before,
}: {
  data: LogRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  initialSearch: string;
  currentAction: string;
  actions: string[];
  after: string;
  before: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [pendingFilters, setPendingFilters] = useState<DateFilter[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync input on back/forward navigation and clear
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  function navigate(values: Filters) {
    const params = new URLSearchParams();
    if (values.q.trim()) params.set("q", values.q.trim());
    if (values.action !== "All actions") params.set("action", values.action);
    if (values.after) params.set("after", values.after);
    if (values.before) params.set("before", values.before);
    if (values.page > 1) params.set("page", String(values.page));
    if (values.size !== DEFAULT_PAGE_SIZE)
      params.set("size", String(values.size));
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }

  function currentFilters(overrides: Partial<Filters> = {}): Filters {
    return {
      q: search,
      action: currentAction,
      after,
      before,
      page,
      size: pageSize,
      ...overrides,
    };
  }

  // Debounced server search.
  // biome-ignore lint/correctness/useExhaustiveDependencies: navigation intentionally follows only the input value
  useEffect(() => {
    if (search === initialSearch) return;
    const timer = setTimeout(() => {
      navigate(currentFilters({ page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const activeFilters = [
    after ? ("after" as const) : null,
    before ? ("before" as const) : null,
  ].filter((filter): filter is DateFilter => filter !== null);
  const dateFilters = [
    ...activeFilters,
    ...pendingFilters.filter((filter) => !activeFilters.includes(filter)),
  ];
  const availableDateFilters: DateFilter[] = (
    ["after", "before"] as const
  ).filter(
    (filter) =>
      (filter === "after" ? after : before) === "" &&
      !dateFilters.includes(filter),
  );

  const hasFilters =
    search !== "" ||
    currentAction !== "All actions" ||
    after !== "" ||
    before !== "";

  function clearFilters() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="mt-8 flex flex-col gap-4 text-[13px]">
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
          value={currentAction}
          onValueChange={(value) =>
            navigate(
              currentFilters({ action: value ?? "All actions", page: 1 }),
            )
          }
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
                    setPendingFilters((current) =>
                      current.includes(filter) ? current : [...current, filter],
                    )
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
              value={filter === "after" ? after : before}
              onChange={(event) =>
                navigate(
                  currentFilters({ [filter]: event.target.value, page: 1 }),
                )
              }
              className="w-32 bg-transparent text-xs outline-none"
            />
            <button
              type="button"
              aria-label={`Remove logged ${filter} filter`}
              onClick={() => {
                setPendingFilters((current) =>
                  current.filter((item) => item !== filter),
                );
                navigate(currentFilters({ [filter]: "", page: 1 }));
              }}
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
        logs={data}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />

      <footer className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          Rows per page
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              navigate(
                currentFilters({
                  size: Number(value ?? DEFAULT_PAGE_SIZE),
                  page: 1,
                }),
              )
            }
          >
            <SelectTrigger className="w-fit" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>
            {rangeStart}-{rangeEnd} of {total} <strong>rows</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            disabled={page === 1}
            onClick={() => navigate(currentFilters({ page: 1 }))}
          >
            <HugeiconsIcon icon={ChevronsLeftIcon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => navigate(currentFilters({ page: page - 1 }))}
          >
            <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} />
          </Button>
          {pageItems(page - 1, totalPages).map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                type="button"
                variant={item + 1 === page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => navigate(currentFilters({ page: item + 1 }))}
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
            disabled={page === totalPages}
            onClick={() => navigate(currentFilters({ page: page + 1 }))}
          >
            <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            disabled={page === totalPages}
            onClick={() => navigate(currentFilters({ page: totalPages }))}
          >
            <HugeiconsIcon icon={ChevronsRightIcon} strokeWidth={2} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
