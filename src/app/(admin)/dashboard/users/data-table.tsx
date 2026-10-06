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
import { useEffect, useMemo, useState } from "react";
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
import BulkActionsBar from "./bulk-actions-bar";
import CreateUserDialog from "./create-user-dialog";
import ExportUsersButton from "./export-users-button";
import { USER_ROLES } from "./user-form-fields";
import UsersBoard from "./users-board";
import UsersList from "./users-list";
import type { UserRow } from "./users-table";
import UsersTable, { formatRole } from "./users-table";

type View = "table" | "board" | "list";
type DateFilter = "after" | "before";

const PAGE_SIZE = 15;

const HIDEABLE_COLUMNS = [
  { label: "Email", icon: Mail01Icon },
  { label: "Role", icon: Briefcase01Icon },
  { label: "Joined date", icon: Calendar01Icon },
] as const;

function matchesQuery(user: UserRow, query: string) {
  const haystack =
    `${user.name ?? ""} ${user.email} ${user.role}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

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

export default function UsersDataTable({ data }: { data: UserRow[] }) {
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );
  const [dateFilters, setDateFilters] = useState<DateFilter[]>([]);
  const [joinedAfter, setJoinedAfter] = useState("");
  const [joinedBefore, setJoinedBefore] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const visible = useMemo(() => {
    return data.filter((user) => {
      if (role && role !== "All roles" && user.role !== role) {
        return false;
      }
      if (query.trim() && !matchesQuery(user, query)) {
        return false;
      }
      const joinedDay = user.joinedAt.slice(0, 10);
      if (joinedAfter && joinedDay < joinedAfter) {
        return false;
      }
      if (joinedBefore && joinedDay > joinedBefore) {
        return false;
      }
      return true;
    });
  }, [data, role, query, joinedAfter, joinedBefore]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset to first page whenever filters change
  useEffect(() => {
    setPage(1);
  }, [query, role, joinedAfter, joinedBefore]);

  function removeDateFilter(filter: DateFilter) {
    setDateFilters((current) => current.filter((item) => item !== filter));
    if (filter === "after") {
      setJoinedAfter("");
    } else {
      setJoinedBefore("");
    }
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

  const availableDateFilters: DateFilter[] = (
    ["after", "before"] as const
  ).filter((filter) => !dateFilters.includes(filter));

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedUsers = visible.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const rangeStart = visible.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(rangeStart + PAGE_SIZE - 1, visible.length);

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
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-8 w-56"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close search"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
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
            <ExportUsersButton rows={visible} />
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
          <Select value={role} onValueChange={setRole}>
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
                  Joined {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {dateFilters.map((filter) => (
            <span
              key={filter}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1 text-xs"
            >
              Joined {filter}
              <input
                type="date"
                aria-label={`Joined ${filter}`}
                value={filter === "after" ? joinedAfter : joinedBefore}
                onChange={(event) =>
                  filter === "after"
                    ? setJoinedAfter(event.target.value)
                    : setJoinedBefore(event.target.value)
                }
                className="bg-transparent text-xs outline-none"
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
              users={pagedUsers}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
              onToggleAll={(checked) =>
                toggleAll(
                  pagedUsers.map((user) => user.id),
                  checked,
                )
              }
              hiddenColumns={hiddenColumns}
            />
          )}
          {view === "board" && (
            <UsersBoard
              users={visible}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
            />
          )}
          {view === "list" && (
            <UsersList
              users={visible}
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
            15{" "}
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2} />
          </button>
          <span className="ml-2">
            {rangeStart}-{rangeEnd} of {visible.length} rows
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
          {pageItems(safePage - 1, pageCount).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item + 1)}
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md ${item + 1 === safePage ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
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
            disabled={safePage === pageCount}
            onClick={() => setPage(safePage + 1)}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={safePage === pageCount}
            onClick={() => setPage(pageCount)}
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
        selected={data.filter((user) => selectedIds.includes(user.id))}
        totalVisible={visible.length}
        onSelectAll={() => setSelectedIds(visible.map((user) => user.id))}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
