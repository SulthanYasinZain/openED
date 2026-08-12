"use client";

import { AssignStudentAction } from "@/app/actions/studentPlacement";

export default function JoinClassForm({
  classId,
}: {
  classId: number;
}) {

  if(!classId) {
  return <p>ClassId is Not entered</p>
  }
  const actionWithClassId = AssignStudentAction.bind(null, classId);

  return (
    <form action={actionWithClassId}>
      <button type="submit" className="btn-primary">
        Gabung Kelas
      </button>
    </form>
  );
}