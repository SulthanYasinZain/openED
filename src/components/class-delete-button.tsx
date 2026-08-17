"use client";

import { deleteClassAction } from "@/app/actions/class";

export default function DeleteClassButton({ classId }: { classId: number }) {
  if (!classId) {
    return <p>ClassId is Not entered</p>;
  }
  const actionWithClassId = deleteClassAction.bind(null, classId);

  return (
    <form action={actionWithClassId}>
      <button type="submit" className="bg-black text-white">
        Delete
      </button>
    </form>
  );
}
