"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Sparkles, X } from "lucide-react";
import React from "react";
import { useDemo } from "@/context/DemoContext";

export default function ToastViewport() {
  const { toasts, dismissToast } = useDemo();

  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto bg-[#14171A] text-white border border-white/15 rounded-2xl p-4 shadow-2xl flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#93E937]/15 text-[#93E937] flex items-center justify-center shrink-0 mt-0.5">
              {toast.tone === "info" ? (
                <Info className="w-4 h-4" />
              ) : toast.tone === "warning" ? (
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-outfit font-semibold text-sm text-white">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
