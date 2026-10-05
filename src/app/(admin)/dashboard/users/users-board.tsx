"use client";

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import DeleteUserButton from "./delete-user-button";
import EditUserDialog from "./edit-user-dialog";
import type { UserRow } from "./users-table";
import {
  avatarColor,
  formatJoinedAt,
  formatRole,
  initials,
} from "./users-table";

export default function UsersBoard({
  users,
  selectedIds,
  onToggle,
}: {
  users: UserRow[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      <section className="w-64 shrink-0 rounded-lg border border-stone-200 bg-stone-50 p-3">
        <div className="flex items-center justify-between px-1 pb-3">
          <h3 className="text-sm font-semibold">Team</h3>
          <span className="text-xs text-stone-500">{users.length} users</span>
        </div>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className={`rounded-lg border bg-white p-3 ${selectedIds.includes(user.id) ? "border-stone-900" : "border-stone-200"}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label={`Select ${user.name ?? user.email}`}
                  checked={selectedIds.includes(user.id)}
                  onChange={() => onToggle(user.id)}
                  className="size-3.5 accent-stone-900"
                />
                <span className={avatarColor(user.email)} aria-hidden="true">
                  {initials(user.name, user.email)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.name ?? "Unnamed"}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    {formatRole(user.role)}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto shrink-0 text-stone-500 hover:text-stone-900"
                  aria-label="More actions"
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    size={14}
                    strokeWidth={2}
                  />
                </button>
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-stone-500">
                <p className="truncate">{user.email}</p>
                <p>{formatJoinedAt(user.joinedAt)}</p>
              </div>
              <div className="mt-2 flex gap-2">
                <EditUserDialog user={user} compact />
                <DeleteUserButton userId={user.id} compact />
              </div>
            </li>
          ))}
          {users.length === 0 && (
            <li className="text-muted-foreground px-1 py-2 text-center text-xs">
              No results.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
