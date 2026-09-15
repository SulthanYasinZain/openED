"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MentorIcon } from "@hugeicons/core-free-icons";

type TeacherData = {
  id: number;
  name: string | null;
  email: string;
};

export default function AssignTeacherButton({
  teacherList,
}: {
  teacherList: TeacherData[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
      >
        <HugeiconsIcon icon={MentorIcon} strokeWidth={2} /> Add Teacher
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-teacher-title"
          >
            <h2 id="assign-teacher-title" className="text-lg font-semibold">
              Add Teacher To Class
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add Teacher Here. Click save when you&apos;re done.
            </p>
            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              <label
                htmlFor="teacher"
                className="mb-1 block text-sm font-medium"
              >
                Teacher
              </label>
              <select
                id="teacher"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select teachers</option>
                {teacherList.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id.toString()}
                  >
                    {teacher.name ?? teacher.email}
                  </option>
                ))}
              </select>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
