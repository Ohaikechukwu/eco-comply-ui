"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast("success", msg),
    error:   (msg) => addToast("error", msg),
    info:    (msg) => addToast("info", msg),
  };

  const icons  = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: "bg-[var(--badge-green-bg)] border-[var(--badge-green-fg)]/30 text-[var(--badge-green-fg)]",
    error:   "bg-[var(--badge-red-bg)] border-[var(--badge-red-fg)]/30 text-[var(--badge-red-fg)]",
    info:    "bg-[var(--badge-blue-bg)] border-[var(--badge-blue-fg)]/30 text-[var(--badge-blue-fg)]",
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm shadow-md min-w-72 bg-[var(--surface)] ${colors[t.type]}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{t.message}</span>
                <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
                  <X className="w-4 h-4 opacity-60 hover:opacity-100" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
