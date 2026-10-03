"use client";

import { USER_ROLES } from "./user-form-fields";
import type { UserRow } from "./users-table";
import { avatarColor, formatJoinedAt, initials } from "./users-table";

export default function UsersBoard({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <div className="border-border rounded-lg border px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">No results.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {USER_ROLES.map((role) => {
        const members = users.filter((user) => user.role === role);

        return (
          <section
            key={role}
            className="border-border w-64 shrink-0 rounded-lg border p-3"
          >
            <header className="flex items-center justify-between px-1 pb-3">
              <h2 className="text-sm font-medium">{role}</h2>
              <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                {members.length}
              </span>
            </header>
            <ul className="space-y-2">
              {members.map((user) => (
                <li
                  key={user.id}
                  className="border-border rounded-lg border px-3 py-2.5"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(user.email)}`}
                    >
                      {initials(user.name, user.email)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {user.name ?? "Unnamed"}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {user.email}
                      </span>
                    </span>
                  </span>
                  <span className="text-muted-foreground mt-1.5 block text-xs">
                    Joined {formatJoinedAt(user.joinedAt)}
                  </span>
                </li>
              ))}
              {members.length === 0 && (
                <li className="text-muted-foreground px-1 py-2 text-xs">
                  No members.
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
