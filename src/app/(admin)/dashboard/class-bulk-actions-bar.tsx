"use client";

import {
  ArrowDown01Icon,
  Cancel01Icon,
  Delete01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  bulkDeleteClassesAction,
  bulkUpdateClassStatusAction,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClassStatus } from "@/generated/prisma/client";
import { formatStatus } from "./class-row-actions";
import type { ClassRow } from "./classes-data-table";

const STATUSES: ClassStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

export default function ClassBulkActionsBar({
  selected,
  totalVisible,
  onSelectAll,
  onClear,
}: {
  selected: ClassRow[];
  totalVisible: number;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  if (selected.length === 0) {
    return null;
  }

  async function handleStatus(status: ClassStatus) {
    setError("");
    setWorking(true);
    const result = await bulkUpdateClassStatusAction(
      selected.map((classItem) => classItem.id),
      status,
    );
    setWorking(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClear();
  }

  async function handleDelete() {
    setError("");
    setWorking(true);
    const result = await bulkDeleteClassesAction(
      selected.map((classItem) => classItem.id),
    );
    setWorking(false);

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
          Classes selected{" "}
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
                disabled={working}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap hover:bg-stone-100 disabled:opacity-50"
              >
                <HugeiconsIcon icon={Tag01Icon} size={14} strokeWidth={2} />
                Status{" "}
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={12}
                  strokeWidth={2}
                />
              </button>
            }
          />
          <DropdownMenuContent align="center" side="top">
            {STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                className="px-3 py-2"
                onClick={() => handleStatus(status)}
              >
                Set {formatStatus(status).toLowerCase()}
              </DropdownMenuItem>
            ))}
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
                {selected.length === 1 ? "class" : "classes"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The classes will be deactivated along with their schedules.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={working}
                onClick={(event) => {
                  event.preventDefault();
                  handleDelete();
                }}
              >
                {working ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
