"use client";

import { Delete01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import {
  deleteClassAction,
  updateClassStatusAction,
} from "@/app/actions/class";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClassStatus } from "@/generated/prisma/client";

const STATUSES: ClassStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

export function formatStatus(status: ClassStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function ClassRowActions({
  classId,
  className,
  status,
}: {
  classId: number;
  className: string;
  status: ClassStatus;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deleteWithClassId = deleteClassAction.bind(null, classId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${className}`}
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-fit">
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={(value) =>
              startTransition(() => {
                void updateClassStatusAction(classId, value as ClassStatus);
              })
            }
          >
            {STATUSES.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                value={option}
                disabled={isPending}
                className="px-3 py-2"
              >
                {formatStatus(option)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-3 py-2"
            onClick={() => setDeleteOpen(true)}
          >
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
            Delete class
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {className}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the class. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form
              action={async (formData) => {
                await deleteWithClassId(formData);
              }}
            >
              <AlertDialogAction type="submit">Delete</AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
