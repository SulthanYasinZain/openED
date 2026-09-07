"use client";

import { useUpload } from "@/context/uploadContext";

export default function UploadDialog() {
  const { status, progress, error } = useUpload();

  if (status === "idle") return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 rounded-lg border bg-background p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">File Upload</h3>

        {status === "done" && (
          <span className="text-sm text-green-600">Done</span>
        )}
      </div>

      {status === "compressing" && (
        <>
          <p className="text-sm text-muted-foreground">Compressing PDF...</p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-1 text-right text-xs text-muted-foreground">
            {progress}%
          </p>
        </>
      )}

      {status === "done" && (
        <p className="text-sm text-muted-foreground">
          PDF compressed successfully.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
