"use client";

import { Alert, Snackbar } from "@mui/material";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastMessage = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback(
    (message: string) => show(message, "success"),
    [show],
  );
  const error = useCallback(
    (message: string) => show(message, "error"),
    [show],
  );
  const info = useCallback((message: string) => show(message, "info"), [show]);
  const warning = useCallback(
    (message: string) => show(message, "warning"),
    [show],
  );

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning }}>
      {children}

      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={4000}
          onClose={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ top: `${20 + index * 80}px` }}
        >
          <Alert
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            severity={toast.type}
            sx={{ width: "100%", minWidth: 320 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
