"use client";

import { useActionState } from "react";
import { createClassAction } from "@/app/actions/class";

export default function CreateClassForm() {
  const defaultState = {
    error: "",
  };

  const [state, formAction, isPending] = useActionState(
    createClassAction,
    defaultState,
  );
  return (
    <form action={formAction} className=" p-2 space-x-2  rounded border border-stone-200">
      <p>Fill the field to add a class </p>
      <input
        placeholder="class name"
        name="name"
        className="border border-neutral-200"
      />
      <input
        name="imageUrl"
        plaecholder="image"
        className="border border-neutral-200"
      />
      {state.error && <p>{state.error}</p>}
      <button className="text-white bg-stone-800 " disabled={isPending}>
        {isPending ? "Submitting" : "Submit"}
      </button>
    </form>
  );
}
