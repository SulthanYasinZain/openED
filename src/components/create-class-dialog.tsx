"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createClassAction } from "@/app/actions/class";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateClassDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createClassAction, {
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
          <Button type="button">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            Create class
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create class</DialogTitle>
          <DialogDescription>
            A unique join code is generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="class-name">Class name</Label>
              <Input id="class-name" name="name" placeholder="e.g. Math 101" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="class-image">Image URL</Label>
              <Input
                id="class-image"
                name="imageUrl"
                placeholder="https://... (optional)"
              />
            </div>
          </div>
          {state.error && (
            <p className="mt-3 text-sm text-red-500">{state.error}</p>
          )}
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
