"use client";

import {
  ArrowDown01Icon,
  Cancel01Icon,
  Csv01Icon,
  Delete01Icon,
  Download01Icon,
  Pdf01Icon,
  Xls01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { deleteUsersAction } from "@/app/actions/user";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportUsersCsv,
  exportUsersPdf,
  exportUsersXlsx,
} from "./export-users";
import type { UserRow } from "./users-table";

export default function BulkActionsBar({
  selected,
  totalVisible,
  onSelectAll,
  onClear,
}: {
  selected: UserRow[];
  totalVisible: number;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (selected.length === 0) {
    return null;
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);
    const result = await deleteUsersAction(selected.map((user) => user.id));
    setDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClear();
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="border-border flex items-center gap-1 rounded-full border bg-white py-1.5 pr-2 pl-1.5 text-sm text-stone-900 shadow-xl">
        <button
          type="button"
          aria-label="Clear selection"
          onClick={onClear}
          className="inline-flex size-7 items-center justify-center rounded-full hover:bg-stone-100"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
        </button>
        <span className="px-1 whitespace-nowrap">
          Users selected{" "}
          <span className="font-semibold">{selected.length}</span>
        </span>
        <span aria-hidden="true" className="text-stone-300">
          •
        </span>
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-full px-2.5 py-1 whitespace-nowrap hover:bg-stone-100"
        >
          Select all {totalVisible}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap hover:bg-stone-100"
              >
                <HugeiconsIcon
                  icon={Download01Icon}
                  size={14}
                  strokeWidth={2}
                />
                Export{" "}
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={12}
                  strokeWidth={2}
                />
              </button>
            }
          />
          <DropdownMenuContent align="center" side="top">
            <DropdownMenuItem
              className="px-3 py-2"
              onClick={() => exportUsersPdf(selected)}
            >
              <HugeiconsIcon icon={Pdf01Icon} strokeWidth={2} />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-3 py-2"
              onClick={() => exportUsersCsv(selected)}
            >
              <HugeiconsIcon icon={Csv01Icon} strokeWidth={2} />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-3 py-2"
              onClick={() => exportUsersXlsx(selected)}
            >
              <HugeiconsIcon icon={Xls01Icon} strokeWidth={2} />
              XLSX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap text-red-500 hover:bg-stone-100"
              >
                <HugeiconsIcon icon={Delete01Icon} size={14} strokeWidth={2} />
                Delete
              </button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {selected.length}{" "}
                {selected.length === 1 ? "user" : "users"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The accounts will be deactivated. This can be undone by creating
                the accounts again with the same email addresses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault();
                  handleDelete();
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
