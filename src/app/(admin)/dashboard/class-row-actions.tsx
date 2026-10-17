"use client";

import {
  Copy01Icon,
  Csv01Icon,
  Delete01Icon,
  Download01Icon,
  MoreHorizontalIcon,
  Pdf01Icon,
  PencilEdit01Icon,
  Share01Icon,
  Tag01Icon,
  Xls01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import {
  deleteClassAction,
  updateClassStatusAction,
} from "@/app/actions/class";
import type { SchoolOption } from "@/components/create-class-dialog";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClassStatus } from "@/generated/prisma/client";
import type { Member } from "./class-member-cell";
import type { ClassRow } from "./classes-data-table";
import DuplicateClassDialog from "./duplicate-class-dialog";
import EditClassDialog from "./edit-class-dialog";
import {
  exportClassCsv,
  exportClassPdf,
  exportClassXlsx,
} from "./export-class";
import ShareClassDialog from "./share-class-dialog";

const STATUSES: ClassStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

export function formatStatus(status: ClassStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function ClassRowActions({
  classItem,
  schools,
  teachers,
  students,
}: {
  classItem: ClassRow;
  schools: SchoolOption[];
  teachers: Member[];
  students: Member[];
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deleteWithClassId = deleteClassAction.bind(null, classItem.id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${classItem.name}`}
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-fit">
          <DropdownMenuItem
            className="px-3 py-2"
            onClick={() => setEditOpen(true)}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
            Edit class
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-3 py-2">
              <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
              Status: {formatStatus(classItem.status)}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={classItem.status}
                onValueChange={(value) =>
                  startTransition(() => {
                    void updateClassStatusAction(
                      classItem.id,
                      value as ClassStatus,
                    );
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
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-3 py-2">
              <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
              Export as
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="px-3 py-2"
                onClick={() => exportClassPdf(classItem)}
              >
                <HugeiconsIcon icon={Pdf01Icon} strokeWidth={2} />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="px-3 py-2"
                onClick={() => exportClassCsv(classItem)}
              >
                <HugeiconsIcon icon={Csv01Icon} strokeWidth={2} />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="px-3 py-2"
                onClick={() => exportClassXlsx(classItem)}
              >
                <HugeiconsIcon icon={Xls01Icon} strokeWidth={2} />
                XLSX
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            className="px-3 py-2"
            onClick={() => setDuplicateOpen(true)}
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="px-3 py-2"
            onClick={() => setShareOpen(true)}
          >
            <HugeiconsIcon icon={Share01Icon} strokeWidth={2} />
            Share class
          </DropdownMenuItem>
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
      <ShareClassDialog
        className={classItem.name}
        code={classItem.code}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
      <DuplicateClassDialog
        classId={classItem.id}
        className={classItem.name}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
      <EditClassDialog
        classItem={classItem}
        schools={schools}
        teachers={teachers}
        students={students}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {classItem.name}?</AlertDialogTitle>
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
