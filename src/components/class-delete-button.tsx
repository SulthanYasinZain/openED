"use client";

import { deleteClassAction } from "@/app/actions/class";
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon } from '@hugeicons/core-free-icons'
export default function DeleteClassButton({ classId }: { classId: number }) {
  if (!classId) {
    return <p>ClassId is Not entered</p>;
  }
  const actionWithClassId = deleteClassAction.bind(null, classId);

  return (
    <form action={actionWithClassId}>
      <button type="submit" className="text-red-500 p-1.5 border border-stone-200 rounded hover:bg-stone-100 duration-300 transition-color">
       <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
