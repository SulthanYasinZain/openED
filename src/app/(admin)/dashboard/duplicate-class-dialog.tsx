"use client";

import { useState, useTransition } from "react";
import { duplicateClassAction } from "@/app/actions/class";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DuplicateClassDialog({
  classId,
  className,
  open,
  onOpenChange,
}: {
  classId: number;
  className: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(`${className} copy`);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(value: boolean) {
    onOpenChange(value);
    if (value) {
      setName(`${className} copy`);
      setError("");
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("Class name must be filled");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);

    startTransition(async () => {
      const result = await duplicateClassAction(classId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate class</DialogTitle>
          <DialogDescription>
            Copies the class details, meetings, and materials. Teachers and
            students are not copied.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="duplicate-class-name">Class name</Label>
            <Input
              id="duplicate-class-name"
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Duplicating..." : "Duplicate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
