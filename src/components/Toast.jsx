import React, { useState, createContext, useContext } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning')
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50/95 border-emerald-200 text-emerald-900',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-rose-50/95 border-rose-200 text-rose-900',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/95 border-amber-200 text-amber-900',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        };
      default:
        return {
          bg: 'bg-blue-50/95 border-blue-200 text-blue-900',
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = getToastStyle(t.type);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg font-medium text-sm ${style.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  {style.icon}
                  <span className="leading-snug">{t.message}</span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
