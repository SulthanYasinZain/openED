export default async function uploadToR2(
  blob: Blob,
  filename: string,
): Promise<string> {
  const res = await fetch("/api/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      contentType: "application/pdf",
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to create presigned URL");
  }

  const { url, publicUrl } = await res.json();

  if (typeof url !== "string" || typeof publicUrl !== "string") {
    throw new Error("Failed to create presigned URL");
  }

  const uploadRes = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error("Upload failed");
  }

  return publicUrl;
}
