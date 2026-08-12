"use client";

import { useActionState } from "react";
import { AssignTeacherAction } from "@/app/actions/classTeacher";
type TeacherData = {
  id: number;
  name: string | null;
  email: string;
};

type ClassData = {
  id: number;
  code: string;
  imageUrl: string;
  isDeleted: boolean;
  createdAt: string;
  updateAt: string;
};

interface props {
  teacherList: TeacherData[];
  classList: ClassData[];
}

const defaultState = {
  error: "",
};

export default function AssignTeacherForm({ teacherList, classList }: props) {
  const [state, formAction, isPending] = useActionState(
    AssignTeacherAction,
    defaultState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <select name="teacherId" required>
        {teacherList.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </select>

      <select name="classId" required>
        {classList.map((classes) => (
          <option key={classes.id} value={classes.id}>
            {classes.name}
          </option>
        ))}
      </select>

      {state.error && <p>{state.error}</p>}
      <button className="text-white bg-stone-800 " disabled={isPending}>
        {isPending ? "Submitting" : "Submit"}
      </button>
    </form>
  );
}
