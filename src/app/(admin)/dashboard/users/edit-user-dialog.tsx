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

export default function EditUserDialog({ user }: { user: EditableUser }) {
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
          <Button type="button" variant="outline" size="sm" aria-label="Edit">
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
          </Button>
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
