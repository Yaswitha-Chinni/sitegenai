"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="sg-toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="sg-toast" role="alert">
            {t.type === "success" && <CheckCircle2 size={18} className="text-success" />}
            {t.type === "error" && <AlertCircle size={18} className="text-danger" />}
            {t.type === "info" && <Info size={18} className="text-primary" />}
            <span className="flex-grow-1">{t.text}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="btn btn-link text-white p-0"
              style={{ opacity: 0.7 }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: (text: string) => {
        console.log("Toast:", text);
      },
    };
  }
  return context;
}
