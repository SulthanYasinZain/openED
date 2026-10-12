"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  Briefcase01Icon,
  Calendar01Icon,
  Cancel01Icon,
  Download01Icon,
  KanbanIcon,
  ListViewIcon,
  Mail01Icon,
  PlusSignIcon,
  Search01Icon,
  Settings02Icon,
  Shield01Icon,
  SlidersHorizontalIcon,
  Table01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Role } from "@/generated/prisma/client";
import BulkActionsBar from "./bulk-actions-bar";
import { PAGE_SIZE } from "./constants";
import CreateUserDialog from "./create-user-dialog";
import ExportUsersButton from "./export-users-button";
import { USER_ROLES } from "./user-form-fields";
import UsersBoard from "./users-board";
import UsersList from "./users-list";
import type { UserRow } from "./users-table";
import UsersTable, { formatRole } from "./users-table";

type View = "table" | "board" | "list";
type DateFilter = "after" | "before";

type Filters = {
  q: string;
  role: Role | null;
  after: string;
  before: string;
  page: number;
};

const HIDEABLE_COLUMNS = [
  { label: "Email", icon: Mail01Icon },
  { label: "Role", icon: Briefcase01Icon },
  { label: "Joined date", icon: Calendar01Icon },
] as const;

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

export default function UsersDataTable({
  rows,
  allRows,
  total,
  page,
  totalPages,
  initialSearch,
  currentRole,
  after,
  before,
}: {
  rows: UserRow[];
  allRows: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  initialSearch: string;
  currentRole: Role | null;
  after: string;
  before: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<View>("table");
  const [search, setSearch] = useState(initialSearch);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );
  const [pendingFilters, setPendingFilters] = useState<DateFilter[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  function navigate(values: Filters) {
    const params = new URLSearchParams();
    if (values.q.trim()) params.set("q", values.q.trim());
    if (values.role) params.set("role", values.role);
    if (values.after) params.set("after", values.after);
    if (values.before) params.set("before", values.before);
    if (values.page > 1) params.set("page", String(values.page));
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }

  function currentFilters(overrides: Partial<Filters> = {}): Filters {
    return {
      q: search,
      role: currentRole,
      after,
      before,
      page,
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

  const activeFilters = [
    after ? ("after" as const) : null,
    before ? ("before" as const) : null,
  ].filter((filter): filter is DateFilter => filter !== null);
  const shownFilters = [
    ...activeFilters,
    ...pendingFilters.filter((filter) => !activeFilters.includes(filter)),
  ];
  const availableDateFilters: DateFilter[] = (
    ["after", "before"] as const
  ).filter(
    (filter) =>
      (filter === "after" ? after : before) === "" &&
      !shownFilters.includes(filter),
  );

  function removeDateFilter(filter: DateFilter) {
    setPendingFilters((current) => current.filter((item) => item !== filter));
    navigate(currentFilters({ [filter]: "", page: 1 }));
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mt-8">
      <Tabs value={view} onValueChange={(value) => setView(value as View)}>
        <div className="border-border flex flex-wrap items-center gap-1 border-t pt-2.5">
          <TabsList variant="line">
            <TabsTrigger value="table">
              <HugeiconsIcon
                icon={Table01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Table
            </TabsTrigger>
            <TabsTrigger value="board">
              <HugeiconsIcon
                icon={KanbanIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <HugeiconsIcon
                icon={ListViewIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              List
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex flex-wrap items-center gap-0.5">
            {searchOpen ? (
              <>
                <Input
                  autoFocus
                  placeholder="Search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-8 w-56"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close search"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearch("");
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
                    onCheckedChange={(value) =>
                      setHiddenColumns((items) =>
                        value
                          ? [...items, column.label]
                          : items.filter((item) => item !== column.label),
                      )
                    }
                  >
                    <HugeiconsIcon icon={column.icon} strokeWidth={2} />
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="ghost" size="sm">
                    <HugeiconsIcon
                      icon={Settings02Icon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Customize
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-fit">
                <DropdownMenuRadioGroup
                  value={density}
                  onValueChange={(value) =>
                    setDensity(value as "compact" | "comfortable")
                  }
                >
                  <DropdownMenuRadioItem value="compact" className="px-3 py-2">
                    <HugeiconsIcon icon={ListViewIcon} strokeWidth={2} />
                    Compact density
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="comfortable"
                    className="px-3 py-2"
                  >
                    <HugeiconsIcon icon={Table01Icon} strokeWidth={2} />
                    Comfortable density
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ExportUsersButton rows={allRows} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="default" size="sm">
                    Add User{" "}
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      strokeWidth={2}
                      data-icon="inline-end"
                    />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-fit">
                <DropdownMenuItem className="px-3 py-2">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
                  Invite by email
                </DropdownMenuItem>
                <DropdownMenuItem className="px-3 py-2">
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
                  Import users
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-3 py-2"
                  onClick={() => setCreateOpen(true)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  Create manually
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select
            value={currentRole ?? "All roles"}
            onValueChange={(value) =>
              navigate({
                ...currentFilters({ page: 1 }),
                role: !value || value === "All roles" ? null : (value as Role),
              })
            }
          >
            <SelectTrigger size="sm" className="rounded-full!">
              <HugeiconsIcon
                icon={Shield01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {["All roles", ...USER_ROLES].map((option) => (
                <SelectItem key={option} value={option} className="px-3 py-2">
                  <HugeiconsIcon
                    icon={
                      option === "All roles" ? UserGroupIcon : Briefcase01Icon
                    }
                    strokeWidth={2}
                  />
                  {option === "All roles" ? option : formatRole(option)}
                </SelectItem>
              ))}
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
                        current.includes(filter)
                          ? current
                          : [...current, filter],
                      )
                    }
                  >
                    <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
                    Joined {filter}
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
          {shownFilters.map((filter) => (
            <span
              key={filter}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1 text-xs whitespace-nowrap"
            >
              Joined {filter}
              <input
                type="date"
                aria-label={`Joined ${filter}`}
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
                aria-label={`Remove joined ${filter} filter`}
                onClick={() => removeDateFilter(filter)}
                className="text-stone-500 hover:text-stone-900"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3">
          {view === "table" && (
            <UsersTable
              users={rows}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
              onToggleAll={(checked) =>
                toggleAll(
                  rows.map((user) => user.id),
                  checked,
                )
              }
              hiddenColumns={hiddenColumns}
            />
          )}
          {view === "board" && (
            <UsersBoard
              users={rows}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
            />
          )}
          {view === "list" && (
            <UsersList
              users={rows}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
            />
          )}
        </div>
      </Tabs>
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
            disabled={page === 1}
            onClick={() => navigate(currentFilters({ page: 1 }))}
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
            disabled={page === 1}
            onClick={() => navigate(currentFilters({ page: page - 1 }))}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
          </button>
          {pageItems(page - 1, totalPages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => navigate(currentFilters({ page: item + 1 }))}
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md ${item + 1 === page ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
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
            disabled={page === totalPages}
            onClick={() => navigate(currentFilters({ page: page + 1 }))}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={page === totalPages}
            onClick={() => navigate(currentFilters({ page: totalPages }))}
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
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <BulkActionsBar
        selected={allRows.filter((user) => selectedIds.includes(user.id))}
        totalVisible={total}
        onSelectAll={() => setSelectedIds(allRows.map((user) => user.id))}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
