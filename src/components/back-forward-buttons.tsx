"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

export default function BackForwardButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-1 text-stone-600 hover:bg-stone-100"
        aria-label="Go back"
        onClick={() => router.back()}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-1 text-stone-600 hover:bg-stone-100"
        aria-label="Go forward"
        onClick={() => router.forward()}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
      </button>
    </div>
  );
}
