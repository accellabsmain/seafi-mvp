"use client";

import React from "react";
import ToastViewport from "@/components/ToastViewport";
import TransactionReceiptModal from "@/components/TransactionReceiptModal";
import { DemoProvider } from "@/context/DemoContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      {children}
      <TransactionReceiptModal />
      <ToastViewport />
    </DemoProvider>
  );
}
