"use client";

import {
  Cancel01Icon,
  FilterHorizontalIcon,
  KanbanIcon,
  ListViewIcon,
  PlusSignIcon,
  Search01Icon,
  Table01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateUserDialog from "./create-user-dialog";
import ExportUsersButton from "./export-users-button";
import { USER_ROLES, type UserRole } from "./user-form-fields";
import UsersBoard from "./users-board";
import UsersList from "./users-list";
import type { UserRow } from "./users-table";
import UsersTable from "./users-table";

type View = "table" | "board" | "list";
type DateFilter = "after" | "before";

const VIEWS: { value: View; label: string; icon: typeof Table01Icon }[] = [
  { value: "table", label: "Table", icon: Table01Icon },
  { value: "board", label: "Board", icon: KanbanIcon },
  { value: "list", label: "List", icon: ListViewIcon },
];

function matchesQuery(user: UserRow, query: string) {
  const haystack =
    `${user.name ?? ""} ${user.email} ${user.role}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export default function UsersManager({ data }: { data: UserRow[] }) {
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [dateFilters, setDateFilters] = useState<DateFilter[]>([]);
  const [joinedAfter, setJoinedAfter] = useState("");
  const [joinedBefore, setJoinedBefore] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const visible = useMemo(() => {
    return data.filter((user) => {
      if (role !== "ALL" && user.role !== role) {
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

  function addDateFilter(filter: DateFilter) {
    setDateFilters((current) =>
      current.includes(filter) ? current : [...current, filter],
    );
    setFilterMenuOpen(false);
  }

  function removeDateFilter(filter: DateFilter) {
    setDateFilters((current) => current.filter((item) => item !== filter));
    if (filter === "after") {
      setJoinedAfter("");
    } else {
      setJoinedBefore("");
    }
  }

  const availableDateFilters: DateFilter[] = (
    ["after", "before"] as const
  ).filter((filter) => !dateFilters.includes(filter));

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="border-border flex items-center gap-1 rounded-lg border p-1">
          {VIEWS.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={view === item.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setView(item.value)}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
              {item.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              placeholder="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <ExportUsersButton rows={visible} />
          <CreateUserDialog />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="border-border flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm">
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            strokeWidth={2}
            className="size-4"
          />
          <select
            aria-label="Filter by role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "ALL" | UserRole)
            }
            className="cursor-pointer bg-transparent outline-none"
          >
            <option value="ALL">Role</option>
            {USER_ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </span>
        {dateFilters.map((filter) => (
          <span
            key={filter}
            className="border-border flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
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
              className="bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              aria-label={`Remove joined ${filter} filter`}
              onClick={() => removeDateFilter(filter)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </button>
          </span>
        ))}
        {availableDateFilters.length > 0 && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilterMenuOpen((value) => !value)}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              Add filter
            </Button>
            {filterMenuOpen && (
              <div className="border-border bg-popover absolute left-0 z-10 mt-2 w-44 rounded-lg border p-1 shadow-lg">
                {availableDateFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => addDateFilter(filter)}
                    className="block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    Joined {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {view === "table" && (
        <UsersTable data={visible} query={query} onQueryChange={setQuery} />
      )}
      {view === "board" && <UsersBoard users={visible} />}
      {view === "list" && <UsersList users={visible} />}
    </div>
  );
}
