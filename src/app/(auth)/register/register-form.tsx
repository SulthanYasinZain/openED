"use client";
import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";

export default function RegisterForm() {
  const defaultState = {
    error: "",
  };

  const [state, formAction, isPending] = useActionState(
    registerAction,
    defaultState,
  );

  return (
    <main className="flex justify-center items-center h-screen">
      <form action={formAction} className="flex flex-col gap-4">
        <input
          placeholder="email"
          name="email"
          type="email"
          className="border border-neutral-200"
        />
        <input
          type="password"
          name="password"
          className="border border-neutral-200"
        />
        {state.error && <p>{state.error}</p>}
        <button
          type="submit"
          className="text-white bg-stone-800 "
          disabled={isPending}
        >
          {isPending ? "Submitting" : "Submit"}
        </button>
      </form>
    </main>
  );
}
