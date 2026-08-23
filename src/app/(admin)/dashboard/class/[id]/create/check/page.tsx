"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [objectKey, setObjectKey] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");

    try {
      // 1. ask our server for a presigned PUT URL
      const res = await fetch("/api/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { url, key } = await res.json();

      // 2. upload the file directly to R2 — credentials never touch the browser
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setObjectKey(key);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Upload to R2</h1>

      <input
        type="file"
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
