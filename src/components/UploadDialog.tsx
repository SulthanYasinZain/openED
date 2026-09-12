"use client";

import { useUpload } from "@/context/uploadContext";

const PHASE_LABELS = {
  compressing: "Compressing PDF...",
  uploading: "Uploading file...",
  summarizing: "Generating class description...",
  saving: "Saving meeting...",
} as const;

export default function UploadDialog() {
  const { status, progress, error, reset } = useUpload();

  if (status === "idle") return null;

  const isActive =
    status === "compressing" ||
    status === "uploading" ||
    status === "summarizing" ||
    status === "saving";

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 rounded-lg border bg-background p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">File Upload</h3>

        {status === "done" && (
          <span className="text-sm text-green-600">Done</span>
        )}
      </div>

      {isActive && (
        <>
          <p className="text-sm text-muted-foreground">
            {PHASE_LABELS[status]}
          </p>

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
        <>
          <p className="text-sm text-muted-foreground">
            Meeting created successfully.
          </p>

          <button
            className="mt-3 rounded border px-3 py-1 text-sm"
            type="button"
            onClick={reset}
          >
            Close
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-sm text-destructive">{error}</p>

          <button
            className="mt-3 rounded border px-3 py-1 text-sm"
            type="button"
            onClick={reset}
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}
