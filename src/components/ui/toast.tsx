"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration ?? 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
  success: {
    bg: "bg-success/10",
    border: "border-success/20",
    icon: <CheckCircle className="w-5 h-5 text-success" />,
    text: "text-success",
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: <AlertCircle className="w-5 h-5 text-destructive" />,
    text: "text-destructive",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    text: "text-warning",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    icon: <Info className="w-5 h-5 text-primary" />,
    text: "text-primary",
  },
};

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const styles = typeStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "rounded-xl border p-4 shadow-finn-floating animate-in slide-in-from-right-2 fade-in-0",
              styles.bg,
              styles.border
            )}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium", styles.text)}>{toast.title}</p>
                {toast.description && (
                  <p className={cn("mt-1 text-sm text-muted-foreground", styles.text)}>{toast.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onRemove(toast.id)}
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}