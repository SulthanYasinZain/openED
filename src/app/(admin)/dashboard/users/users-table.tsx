"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { appFeatures } from "@/components/data-table";
import DataTable, { SortButton } from "@/components/data-table";
import DeleteUserButton from "./delete-user-button";
import EditUserDialog from "./edit-user-dialog";
import type { UserRole } from "./user-form-fields";

export type UserRow = {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
  joinedAt: string;
};

const AVATAR_COLORS = [
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-amber-100 text-amber-700",
  "bg-green-100 text-green-700",
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
] as const;

export function avatarColor(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 997;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? (parts[1]?.[0] ?? "") : "";
  return `${first}${second}`.toUpperCase();
}

export function formatJoinedAt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

const helper = createColumnHelper<typeof appFeatures, UserRow>();

const columns = helper.columns([
  helper.accessor("name", {
    header: (context) => (
      <SortButton
        label="Full name"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => {
      const user = context.row.original;
      return (
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(user.email)}`}
          >
            {initials(user.name, user.email)}
          </span>
          <span className="font-medium">{user.name ?? "Unnamed"}</span>
        </span>
      );
    },
  }),
  helper.accessor("email", {
    header: (context) => (
      <SortButton
        label="Email"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => (
      <span className="text-muted-foreground">
        {context.row.original.email}
      </span>
    ),
  }),
  helper.accessor("role", {
    header: (context) => (
      <SortButton
        label="Role"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => <span>{formatRole(context.row.original.role)}</span>,
  }),
  helper.accessor("joinedAt", {
    header: (context) => (
      <SortButton
        label="Joined date"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatJoinedAt(context.row.original.joinedAt)}
      </span>
    ),
  }),
  helper.display({
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    enableHiding: false,
    cell: (context) => (
      <div className="flex items-center justify-end gap-2">
        <EditUserDialog user={context.row.original} />
        <DeleteUserButton userId={context.row.original.id} />
      </div>
    ),
  }),
]);

export default function UsersTable({
  data,
  query,
  onQueryChange,
}: {
  data: UserRow[];
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKeys={["name", "email", "role"]}
      searchPlaceholder="Search"
      externalSearch={{ value: query, onChange: onQueryChange }}
      showColumnToggle
      columnLabels={{
        name: "Full name",
        email: "Email",
        role: "Role",
        joinedAt: "Joined date",
      }}
    />
  );
}
