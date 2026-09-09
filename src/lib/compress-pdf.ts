import type { CompressionPreset } from "@quicktoolsone/pdf-compress";

export default async function compressPdf(
  file: File,
  opts?: {
    preset?: CompressionPreset;
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
  },
): Promise<Blob> {
  try {
    const { compress } = await import("@quicktoolsone/pdf-compress");

    if (opts?.signal?.aborted) {
      throw new DOMException("Compression aborted", "AbortError");
    }

    const buffer = await file.arrayBuffer();

    const result = await compress(buffer, {
      preset: opts?.preset ?? "balanced",
      onProgress: (event) => {
        opts?.onProgress?.(event.progress);
      },
    });

    return new Blob([result.pdf], { type: "application/pdf" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    console.warn("PDF compression failed:", error);

    throw new Error(
      error instanceof Error ? error.message : "PDF compression failed",
      { cause: error },
    );
  }
}
