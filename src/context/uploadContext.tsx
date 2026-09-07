"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import compressPdf from "@/lib/compress-pdf";

type CompressionLevel = "off" | "lossless" | "balanced" | "max";

type Status = "idle" | "compressing" | "done" | "error";

type State = {
  status: Status;
  progress: number;
  compression: CompressionLevel;
  error: string | null;
};

type Action =
  | { type: "START"; compression: CompressionLevel }
  | { type: "PROGRESS"; progress: number }
  | { type: "SUCCESS" }
  | { type: "FAILURE"; error: string }
  | { type: "RESET" };

const initialState: State = {
  status: "idle",
  progress: 0,
  compression: "balanced",
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return {
        ...initialState,
        status: "compressing",
        compression: action.compression,
      };

    case "PROGRESS":
      return { ...state, progress: action.progress };

    case "SUCCESS":
      return { ...state, status: "done", progress: 100, error: null };

    case "FAILURE":
      return { ...state, status: "error", error: action.error };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

type UploadContextType = State & {
  uploadFile: (
    file: File,
    opts?: { compression?: CompressionLevel }
  ) => Promise<Blob | null>;
  reset: () => void;
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const uploadFile = useCallback(
    async (file: File, opts?: { compression?: CompressionLevel }) => {
      const compression = opts?.compression ?? "balanced";

      dispatch({ type: "START", compression });

      try {
        if (compression === "off") {
          dispatch({ type: "SUCCESS" });
          return file;
        }

        const blob = await compressPdf(file, {
          preset: compression,
          onProgress: (progress) => {
            dispatch({ type: "PROGRESS", progress });
          },
        });

        dispatch({ type: "SUCCESS" });
        return blob;
      } catch (error) {
        // Compression is best-effort: on failure fall back to the
        // original file so the flow can continue uninterrupted.
        console.warn("PDF compression failed, using original file:", error);
        dispatch({ type: "SUCCESS" });
        return file;
      }
    },
    []
  );

  const value = useMemo<UploadContextType>(
    () => ({ ...state, uploadFile, reset }),
    [state, uploadFile, reset]
  );

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUpload must be used inside UploadProvider");
  }

  return context;
}
