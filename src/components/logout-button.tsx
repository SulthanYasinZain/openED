// app/components/LogoutButton.tsx
"use client";

import { useActionState } from "react";
import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  const [state, action] = useActionState(logoutAction, null);

  return (
    <form action={logoutAction}>
      <button className="bg-black text-white p-2" type="submit">
        Logout
      </button>
    </form>
  );
}
