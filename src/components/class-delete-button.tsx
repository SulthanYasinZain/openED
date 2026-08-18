"use client";

import { deleteClassAction } from "@/app/actions/class";
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon } from '@hugeicons/core-free-icons';
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
export default function DeleteClassButton({ classId }: { classId: number }) {
  if (!classId) {
    return <p>ClassId is Not entered</p>;
  }
  const actionWithClassId = deleteClassAction.bind(null, classId);

  return (
       <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" className="text-red-500"><HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={2} /></Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
           <form action={actionWithClassId}>
          <AlertDialogAction type="submit" >I Understand</AlertDialogAction>
           </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  );
}
