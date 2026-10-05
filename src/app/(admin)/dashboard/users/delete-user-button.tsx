"use client";

import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { deleteUserAction } from "@/app/actions/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteUserButton({
  userId,
  compact = false,
}: {
  userId: number;
  compact?: boolean;
}) {
  const actionWithUserId = deleteUserAction.bind(null, userId);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          compact ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs hover:bg-stone-100"
            >
              <HugeiconsIcon icon={Delete01Icon} size={12} strokeWidth={2} />
              Delete
            </button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-500"
            >
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
              Delete
            </Button>
          )
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            The account will be deactivated. This can be undone by creating the
            account again with the same email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form
            action={async (formData) => {
              await actionWithUserId(formData);
            }}
          >
            <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
