"use client";

import { useActionState } from "react";
import { StudentJoinClassByCodeAction } from "@/app/actions/studentPlacement";

export default function JoinClassByCode() {
  const defaultState = {
    error: "",
  };

  const [state, formAction, isPending] = useActionState(
    StudentJoinClassByCodeAction,
    defaultState,
  );
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        placeholder="class code"
        name="code"
        className="border border-neutral-200"
      />

      {state.error && <p>{state.error}</p>}
      <button className="text-white bg-stone-800 " disabled={isPending}>
        {isPending ? "Submitting" : "Submit"}
      </button>
    </form>
  );
}
