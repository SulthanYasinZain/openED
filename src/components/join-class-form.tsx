"use client";

import { StudentJoinClassAction } from "@/app/actions/studentPlacement";

export default function JoinClassForm({
  classId,
}: {
  classId: number;
}) {

  if(!classId) {
  return <p>ClassId is Not entered</p>
  }
  const actionWithClassId = StudentJoinClassAction.bind(null, classId);

  return (
    <form action={actionWithClassId}>
      <button type="submit" className="bg-black text-white">
        Gabung Kelas
      </button>
    </form>
  );
}