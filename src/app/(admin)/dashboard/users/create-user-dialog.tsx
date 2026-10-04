"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createUserAction } from "@/app/actions/user";
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
import UserFormFields from "./user-form-fields";

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createUserAction, {
    error: "",
  });
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
          <Button type="button" size="sm">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            Create user
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a new account and assign its role.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
        >
          <UserFormFields passwordRequired />
          {state.error && (
            <p className="mt-3 text-sm text-red-500">{state.error}</p>
          )}
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
