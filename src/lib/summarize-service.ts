export default async function summarizePdf(
  blob: Blob,
  filename: string,
): Promise<string> {
  const formData = new FormData();
  formData.append(
    "file",
    new File([blob], filename, { type: "application/pdf" }),
  );

  const response = await fetch("/api/summarize", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to summarize PDF");
  }

  const data = await response.json();

  if (typeof data.summary !== "string" || !data.summary) {
    throw new Error("Failed to summarize PDF");
  }

  return data.summary;
}
