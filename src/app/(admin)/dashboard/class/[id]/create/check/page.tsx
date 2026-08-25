"use client";

import { useState } from "react";
import { compress } from '@quicktoolsone/pdf-compress';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [objectKey, setObjectKey] = useState<string | null>(null);

 async function handleUpload() {
  if (!file) return;

  setStatus("uploading");

  try {
    const buffer = await file.arrayBuffer();

    const result = await compress(buffer, {
      preset: "balanced",
      onProgress: (event) => {
        console.log(`${event.phase}: ${event.progress}%`);

        if (event.message) {
          console.log(event.message);
        }
      },
    });

    const blob = new Blob([result.pdf], {
      type: "application/pdf",
    });

    const res = await fetch("/api/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: "application/pdf",
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create presigned URL");
    }

    const { url, key } = await res.json();

    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: blob,
    });

    if (!uploadRes.ok) {
      throw new Error("Upload failed");
    }

    setObjectKey(key);
    setStatus("done");
  } catch (error) {
    console.error(error);
    setStatus("error");
  }
}

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Upload to R2</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setStatus("idle");
          setObjectKey(null);
        }}
      />

      <div style={{ marginTop: 16 }}>
        <button onClick={handleUpload} disabled={!file || status === "uploading"}>
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
      </div>

      {status === "done" && (
        <p style={{ color: "green" }}>
          ✅ Uploaded as <code>{objectKey}</code>
        </p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>❌ Upload failed. Check the console.</p>
      )}
    </main>
  );
}
