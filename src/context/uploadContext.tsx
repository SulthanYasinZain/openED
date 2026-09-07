import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

type UploadCustomization = {
  compression: "off" | "lossless" | "balanced" | "max";
  summarization: boolean;
};}

type State = {
  status: ...;
  progress: number;
  objectKey: string | null;
  error: string | null;
  customization: UploadCustomization;
};

type Action =
  | { type: "START" }
  | { type: "PROGRESS"; progress: number; status: "compressing" | "uploading" }
  | { type: "SUCCESS"; objectKey: string }
  | { type: "FAILURE"; error: string }
  | { type: "RESET" };

const initialState: State = {
  status: "idle", progress: 0, objectKey: null, error: null,
  customization: { compression: "balanced", summarization: true },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return {
        ...state,
        status:
          state.customization.compression === "off"
            ? "uploading"
            : "compressing",
        progress: 0,
        objectKey: null,
        error: null,
      };

    case "PROGRESS":
      return { ...state, status: action.status, progress: action.progress };

    case "SUCCESS":
      return {
        ...state,
        status: "done",
        progress: 100,
        objectKey: action.objectKey,
        error: null,
      };

    case "FAILURE":
      return { ...state, status: "error", error: action.error };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

type UploadContextType = State & {
  
  uploadFile: (file: File) => Promise<void>;
  cancel: () => void;
  reset: () => void;
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // ... uploadFile (useCallback, dispatch START/PROGRESS/SUCCESS/FAILURE)
  // ... cancel, reset
  // const value = useMemo(() => ({ ...state, uploadFile, cancel, reset }), [...]);
  // return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}