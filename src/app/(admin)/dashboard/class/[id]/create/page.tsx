"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { createMeetingAction } from "@/app/actions/meeting";
import { useUpload } from "@/context/uploadContext";
import summarizePdf from "@/lib/summarize-service";
import uploadToR2 from "@/lib/upload-to-r2";

export default function CreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classCode } = use(params);
  const router = useRouter();
  const { uploadFile, setPhase, succeed, fail, status, progress, error } =
    useUpload();

  const [description, setDescription] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const file = data.get("pdf");
    const topic = data.get("topic");
    const date = data.get("date");
    const compressionValue = data.get("compression");
    const summarizeChecked = data.get("summarize") === "on";

    if (typeof topic !== "string" || !topic.trim()) {
      setFormError("Topic name must be filled");
      return;
    }

    if (typeof date !== "string" || !date) {
      setFormError("Date must be filled");
      return;
    }

    if (!(file instanceof File) || file.size === 0) {
      setFormError("PDF file is required");
      return;
    }

    const compression =
      compressionValue === "off" ||
      compressionValue === "lossless" ||
      compressionValue === "balanced" ||
      compressionValue === "max"
        ? compressionValue
        : "balanced";

    setFormError(null);

    const blob = await uploadFile(file, { compression });

    if (!blob) return;

    try {
      setPhase("uploading");
      const fileKey = await uploadToR2(blob, file.name);

      let finalDescription = description;

      if (summarizeChecked) {
        setPhase("summarizing");

        const summary = await summarizePdf(blob, file.name).catch(() => null);

        if (summary) {
          finalDescription = summary;
          setDescription(summary);
        }
      }

      setPhase("saving");
      const result = await createMeetingAction({
        classCode,
        topic: topic.trim(),
        description: finalDescription || null,
        scheduledAt: date,
        fileKey,
      });

      if (result.error) {
        fail(result.error);
        setFormError(result.error);
        return;
      }

      succeed();
      router.push(`/dashboard/class/${classCode}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create meeting";
      fail(message);
      setFormError(message);
    }
  }

  const busy = status !== "idle" && status !== "done" && status !== "error";

  return (
    <main className="flex justify-center items-center h-screen">
      <form className="flex flex-col gap-4 max-w-sm" onSubmit={handleSubmit}>
        <label>Topic Name</label>
        <input
          className="rounded border p-1"
          name="topic"
          placeholder="Introduction To Scratch"
        />
        <input
          className="rounded border p-1 disabled:opacity-50"
          placeholder="class Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={aiEnabled}
        />
        <label>Date</label>
        <input className="rounded border p-1" type="date" name="date" />
        <label>File</label>
        <input
          className="rounded border p-1"
          type="file"
          name="pdf"
          accept="application/pdf"
        />
        {status === "compressing" && <p>Compressing PDF... {progress}%</p>}
        {status === "uploading" && <p>Uploading file...</p>}
        {status === "summarizing" && <p>Generating class description...</p>}
        {status === "saving" && <p>Saving meeting...</p>}
        {error && <p>Error: {error}</p>}
        {formError && <p>Error: {formError}</p>}
        <label>Compression</label>
        <select
          className="rounded border p-1"
          name="compression"
          defaultValue="balanced"
        >
          <option value="off">Off</option>
          <option value="lossless">Lossless</option>
          <option value="balanced">Balanced</option>
          <option value="max">Max</option>
        </select>
        <button className="rounded border p-1" type="submit" disabled={busy}>
          Submit
        </button>
        <span>
          <p>use AI to generated class description </p>
          <input
            className="rounded border p-1"
            type="checkbox"
            name="summarize"
            checked={aiEnabled}
            onChange={(event) => {
              const checked = event.target.checked;
              setAiEnabled(checked);
              if (checked) setDescription("");
            }}
          />
        </span>
      </form>
    </main>
  );
}
