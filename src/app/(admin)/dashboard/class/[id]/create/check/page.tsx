"use client";

import { useUpload } from "@/context/upload-context";
import Link from "next/link";
export default function CreateAssignment() {
  const { uploadFile } = useUpload();

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    uploadFile(file);
  }

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      
      <Link href={"/dashboard"}>View</Link>
    </div>
  );
}