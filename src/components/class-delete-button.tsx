"use client";

import { useState } from "react";
import { deleteClassAction } from "@/app/actions/class";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";

export default function DeleteClassButton({ classId }: { classId: number }) {
  const [open, setOpen] = useState(false);

  if (!classId) {
    return <p>ClassId is Not entered</p>;
  }
  const actionWithClassId = deleteClassAction.bind(null, classId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-500/10"
        aria-label="Delete class"
      >
        <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={2} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-class-title"
            aria-describedby="delete-class-description"
          >
            <h2 id="delete-class-title" className="text-lg font-semibold">
              Are you absolutely sure?
            </h2>
            <p
              id="delete-class-description"
              className="mt-2 text-sm text-gray-500"
            >
              This action cannot be undone. This will permanently delete your
              account from our servers.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <form action={actionWithClassId}>
                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  I Understand
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
