"use client";

import { useState } from "react";
import { useUpload } from "@/context/uploadContext";
import Link from "next/link";

export default function CreateAssignment() {
  const { uploadFile, status, progress, error } = useUpload();

  const [summary, setSummary] = useState<string | null>(null);

  const [summarizing, setSummarizing] = useState(false);

  const [summaryError, setSummaryError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSummary(null);
    setSummaryError(null);

    // 1. Compress PDF
    const blob = await uploadFile(file);

    if (!blob) return;

    // 3. Send COMPRESSED PDF to Gemini
    try {
      setSummarizing(true);

      const formData = new FormData();

      formData.append(
        "file",
        new File([blob], file.name, {
          type: "application/pdf",
        }),
      );

      const response = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error || "Failed to summarize PDF");
      }

      const data = await response.json();

      setSummary(data.summary);
    } catch (err) {
      setSummaryError(
        err instanceof Error ? err.message : "Failed to summarize PDF",
      );
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div>
      <h1>Create Assignment</h1>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {status === "compressing" && <p>Compressing PDF... {progress}%</p>}

      {error && <p>Error: {error}</p>}

      {summarizing && <p>Gemini sedang membuat rangkuman...</p>}

      {summaryError && <p>Summary error: {summaryError}</p>}

      {summary && (
        <div>
          <h2>PDF Summary</h2>

          <div>{summary}</div>
        </div>
      )}

      <Link href="/dashboard">View</Link>
    </div>
  );
}
