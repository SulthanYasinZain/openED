"use client";

import { useUpload } from "@/context/uploadContext";

export default function CreatePage() {
  const { uploadFile, status, progress, error } = useUpload();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const file = data.get("pdf");

    if (!(file instanceof File) || file.size === 0) return;

    await uploadFile(file);
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <form className="flex flex-col gap-4 max-w-sm" onSubmit={handleSubmit}>
        <label>Topic Name</label>
        <input
          className="rounded border p-1"
          placeholder="Introduction To Scratch"
        />
        <input className="rounded border p-1" placeholder="class Description" />
        <label>Date</label>
        <input className="rounded border p-1" type="date" />
        <label>File</label>
        <input
          className="rounded border p-1"
          type="file"
          name="pdf"
          accept="application/pdf"
        />
        {status === "compressing" && <p>Compressing PDF... {progress}%</p>}
        {error && <p>Error: {error}</p>}
        <button className="rounded border p-1" type="submit">
          Submit
        </button>
        <span>
          <p>use AI to generated class description </p>
          <input className="rounded border p-1" type="checkbox" />
        </span>
      </form>
    </main>
  );
}
