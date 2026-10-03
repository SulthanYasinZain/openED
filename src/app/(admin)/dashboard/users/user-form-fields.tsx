"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const USER_ROLES = ["ADMIN", "MENTOR", "STUDENT", "SCHOOL"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export default function UserFormFields({
  defaultName,
  defaultEmail,
  defaultRole,
  passwordRequired,
}: {
  defaultName?: string | null;
  defaultEmail?: string | null;
  defaultRole?: UserRole;
  passwordRequired: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-name">Name</Label>
        <Input
          id="user-name"
          name="name"
          placeholder="Full name"
          defaultValue={defaultName ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          name="email"
          type="email"
          placeholder="user@example.com"
          defaultValue={defaultEmail ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-password">Password</Label>
        <Input
          id="user-password"
          name="password"
          type="password"
          placeholder={
            passwordRequired ? "Min. 8 characters" : "Leave blank to keep"
          }
          required={passwordRequired}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-role">Role</Label>
        <select
          id="user-role"
          name="role"
          defaultValue={defaultRole ?? "STUDENT"}
          className="border-border rounded-lg border bg-transparent px-3 py-2 text-sm"
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
