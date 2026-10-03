"use client";

import DeleteUserButton from "./delete-user-button";
import EditUserDialog from "./edit-user-dialog";
import type { UserRow } from "./users-table";
import { avatarColor, formatJoinedAt, initials } from "./users-table";

export default function UsersList({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <div className="border-border rounded-lg border px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">No results.</p>
      </div>
    );
  }

  return (
    <ul className="border-border divide-y divide-border rounded-lg border">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-3 px-4 py-3">
          <span
            aria-hidden="true"
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(user.email)}`}
          >
            {initials(user.name, user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {user.name ?? "Unnamed"}
            </span>
            <span className="text-muted-foreground block truncate text-xs">
              {user.email}
            </span>
          </span>
          <span className="hidden shrink-0 text-sm sm:block">{user.role}</span>
          <span className="text-muted-foreground hidden shrink-0 text-xs whitespace-nowrap md:block">
            {formatJoinedAt(user.joinedAt)}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <EditUserDialog user={user} />
            <DeleteUserButton userId={user.id} />
          </span>
        </li>
      ))}
    </ul>
  );
}
