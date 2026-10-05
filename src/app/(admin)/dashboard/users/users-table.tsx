"use client";

import {
  Briefcase01Icon,
  Calendar01Icon,
  Mail01Icon,
  Settings02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return `inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color}`;
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

export default function UsersTable({
  users,
  selectedIds,
  onToggle,
  onToggleAll,
  hiddenColumns,
}: {
  users: UserRow[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  hiddenColumns: string[];
}) {
  const allSelected =
    users.length > 0 && users.every((user) => selectedIds.includes(user.id));
  const someSelected = users.some((user) => selectedIds.includes(user.id));

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onCheckedChange={(value) => onToggleAll(value === true)}
              />
            </TableHead>
            <TableHead>
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} />
                Full name
              </span>
            </TableHead>
            {!hiddenColumns.includes("Email") && (
              <TableHead>
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={2} />
                  Email
                </span>
              </TableHead>
            )}
            {!hiddenColumns.includes("Role") && (
              <TableHead>
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    size={14}
                    strokeWidth={2}
                  />
                  Role
                </span>
              </TableHead>
            )}
            {!hiddenColumns.includes("Joined date") && (
              <TableHead>
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    size={14}
                    strokeWidth={2}
                  />
                  Joined date
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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  aria-label={`Select ${user.name ?? user.email}`}
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={() => onToggle(user.id)}
                />
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2.5">
                  <span className={avatarColor(user.email)} aria-hidden="true">
                    {initials(user.name, user.email)}
                  </span>
                  <span className="font-medium">{user.name ?? "Unnamed"}</span>
                </span>
              </TableCell>
              {!hiddenColumns.includes("Email") && (
                <TableCell>
                  <a
                    href={`mailto:${user.email}`}
                    className="text-muted-foreground"
                  >
                    {user.email}
                  </a>
                </TableCell>
              )}
              {!hiddenColumns.includes("Role") && (
                <TableCell>{formatRole(user.role)}</TableCell>
              )}
              {!hiddenColumns.includes("Joined date") && (
                <TableCell className="whitespace-nowrap">
                  {formatJoinedAt(user.joinedAt)}
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditUserDialog user={user} />
                  <DeleteUserButton userId={user.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground h-24 text-center text-sm"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
