"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 w-full max-w-[320px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${
              t.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
              t.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
              "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {t.type === "success" && <CheckCircle size={20} className="shrink-0" />}
            {t.type === "error" && <XCircle size={20} className="shrink-0" />}
            {t.type === "info" && <AlertCircle size={20} className="shrink-0" />}
            
            <p className="text-sm font-medium flex-1">{t.message}</p>
            
            <button onClick={() => removeToast(t.id)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
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
  if (!context) throw new Error("useToast deve ser usado dentro de um ToastProvider");
  return context;
}
