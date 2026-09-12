"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import compressPdf from "@/lib/compress-pdf";

type CompressionLevel = "off" | "lossless" | "balanced" | "max";

type Status =
  | "idle"
  | "compressing"
  | "uploading"
  | "summarizing"
  | "saving"
  | "done"
  | "error";

type Phase = "uploading" | "summarizing" | "saving";

const PHASE_WAYPOINTS: Record<
  Phase,
  { entry: number; cap: number; everyMs: number }
> = {
  uploading: { entry: 40, cap: 58, everyMs: 400 },
  summarizing: { entry: 60, cap: 78, everyMs: 500 },
  saving: { entry: 80, cap: 94, everyMs: 400 },
};

type State = {
  status: Status;
  progress: number;
  compression: CompressionLevel;
  error: string | null;
};

type Action =
  | { type: "START"; compression: CompressionLevel }
  | { type: "PROGRESS"; progress: number }
  | { type: "PHASE"; status: Phase; progress: number }
  | { type: "CREEP"; cap: number }
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
      return { ...state, progress: Math.min(action.progress, 40) };

    case "PHASE":
      return { ...state, status: action.status, progress: action.progress };

    case "CREEP":
      return { ...state, progress: Math.min(state.progress + 1, action.cap) };

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
    opts?: { compression?: CompressionLevel },
  ) => Promise<Blob | null>;
  setPhase: (phase: Phase) => void;
  succeed: () => void;
  fail: (error: string) => void;
  reset: () => void;
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const creepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCreep = useCallback(() => {
    if (creepRef.current !== null) {
      clearInterval(creepRef.current);
      creepRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (creepRef.current !== null) {
        clearInterval(creepRef.current);
        creepRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    stopCreep();
    dispatch({ type: "RESET" });
  }, [stopCreep]);

  const setPhase = useCallback(
    (phase: Phase) => {
      const { entry, cap, everyMs } = PHASE_WAYPOINTS[phase];
      stopCreep();
      dispatch({ type: "PHASE", status: phase, progress: entry });
      creepRef.current = setInterval(() => {
        dispatch({ type: "CREEP", cap });
      }, everyMs);
    },
    [stopCreep],
  );

  const succeed = useCallback(() => {
    stopCreep();
    dispatch({ type: "SUCCESS" });
  }, [stopCreep]);

  const fail = useCallback(
    (error: string) => {
      stopCreep();
      dispatch({ type: "FAILURE", error });
    },
    [stopCreep],
  );

  const uploadFile = useCallback(
    async (file: File, opts?: { compression?: CompressionLevel }) => {
      const compression = opts?.compression ?? "balanced";

      stopCreep();
      dispatch({ type: "START", compression });

      try {
        if (compression === "off") {
          dispatch({ type: "PROGRESS", progress: 40 });
          return file;
        }

        const blob = await compressPdf(file, {
          preset: compression,
          onProgress: (progress) => {
            dispatch({
              type: "PROGRESS",
              progress: Math.round(progress * 0.4),
            });
          },
        });

        dispatch({ type: "PROGRESS", progress: 40 });
        return blob;
      } catch {
        dispatch({ type: "PROGRESS", progress: 40 });
        return file;
      }
    },
    [stopCreep],
  );

  const value = useMemo<UploadContextType>(
    () => ({ ...state, uploadFile, setPhase, succeed, fail, reset }),
    [state, uploadFile, setPhase, succeed, fail, reset],
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
