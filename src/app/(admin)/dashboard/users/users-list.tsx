"use client";

import DeleteUserButton from "./delete-user-button";
import EditUserDialog from "./edit-user-dialog";
import type { UserRow } from "./users-table";
import {
  avatarColor,
  formatJoinedAt,
  formatRole,
  initials,
} from "./users-table";

export default function UsersList({
  users,
  selectedIds,
  onToggle,
}: {
  users: UserRow[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <ul className="divide-y divide-stone-100">
        {users.map((user) => (
          <li
            key={user.id}
            className={`flex items-center gap-2.5 px-4 py-3 ${selectedIds.includes(user.id) ? "bg-stone-100" : ""}`}
          >
            <input
              type="checkbox"
              aria-label={`Select ${user.name ?? user.email}`}
              checked={selectedIds.includes(user.id)}
              onChange={() => onToggle(user.id)}
              className="size-3.5 shrink-0 accent-stone-900"
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
            <p className="ml-8 hidden shrink-0 text-sm sm:block">
              {formatRole(user.role)}
            </p>
            <p className="text-muted-foreground hidden shrink-0 text-xs whitespace-nowrap md:block">
              {formatJoinedAt(user.joinedAt)}
            </p>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <EditUserDialog user={user} compact />
              <DeleteUserButton userId={user.id} compact />
            </div>
          </li>
        ))}
        {users.length === 0 && (
          <li className="text-muted-foreground px-4 py-8 text-center text-sm">
            No results.
          </li>
        )}
      </ul>
    </div>
  );
}
