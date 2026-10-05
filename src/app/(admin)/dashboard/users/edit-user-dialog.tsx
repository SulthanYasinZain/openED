"use client";

import { PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { updateUserAction } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserFormFields, { type UserRole } from "./user-form-fields";

export type EditableUser = {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
};

export default function EditUserDialog({
  user,
  compact = false,
}: {
  user: EditableUser;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateUserAction.bind(null, user.id),
    { error: "" },
  );
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !isPending && !state.error) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [isPending, state.error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          compact ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs hover:bg-stone-100"
            >
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                size={12}
                strokeWidth={2}
              />
              Edit
            </button>
          ) : (
            <Button type="button" variant="outline" size="sm">
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              Edit
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>Update the account details.</DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
        >
          <UserFormFields
            defaultName={user.name}
            defaultEmail={user.email}
            defaultRole={user.role}
            passwordRequired={false}
          />
          {state.error && (
            <p className="mt-3 text-sm text-red-500">{state.error}</p>
          )}
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
