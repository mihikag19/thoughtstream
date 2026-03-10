"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

let showToastFn: ((message: string) => void) | null = null;

export function showToast(message: string) {
  showToastFn?.(message);
}

export function ToastProvider() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    showToastFn = (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[998]">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[var(--bg-raised)] border border-[var(--border-mid)] rounded-lg px-16 py-8 font-mono text-[12px] text-[var(--text)] whitespace-nowrap"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
