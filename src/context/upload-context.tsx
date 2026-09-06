"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type UploadStatus =
  | "idle"
  | "compressing"
  | "uploading"
  | "done"
  | "error";

type UploadResult = {
  key: string;
  file: Blob;
};

type UploadContextType = {
  status: UploadStatus;
  progress: number;
  objectKey: string | null;
  error: string | null;
  uploadFile: (file: File) => Promise<UploadResult | null>;
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const [progress, setProgress] = useState(0);

  const [objectKey, setObjectKey] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function uploadFile(file: File) {
    try {
      setStatus("compressing");
      setProgress(0);
      setObjectKey(null);
      setError(null);

      const { compress } =
        await import("@quicktoolsone/pdf-compress");

      const buffer = await file.arrayBuffer();

      const result = await compress(buffer, {
        preset: "balanced",

        onProgress: (event) => {
          setProgress(event.progress);

          console.log(
            `${event.phase}: ${event.progress}%`
          );

          if (event.message) {
            console.log(event.message);
          }
        },
      });

      // This is the compressed PDF
      const blob = new Blob([result.pdf], {
        type: "application/pdf",
      });

      setStatus("uploading");

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
        throw new Error(
          "Failed to create presigned URL"
        );
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
      setProgress(100);

      // Return BOTH the R2 key and compressed PDF
      return {
        key,
        file: blob,
      };
    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );

      setStatus("error");

      return null;
    }
  }

  return (
    <UploadContext.Provider
      value={{
        status,
        progress,
        objectKey,
        error,
        uploadFile,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error(
      "useUpload must be used inside UploadProvider"
    );
  }

  return context;
}