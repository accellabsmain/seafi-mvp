"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/currencies";

export default function TransactionReceiptModal() {
  const { activeReceiptTx, setActiveReceiptTx, pushToast } = useDemo();
  const [showAudit, setShowAudit] = useState(false);

  if (!activeReceiptTx) return null;

  const tx = activeReceiptTx;

  const copyText = (label: string, val: string) => {
    navigator.clipboard?.writeText(val);
    pushToast(`${label} copied`, val, "info");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveReceiptTx(null)}
          className="fixed inset-0 bg-[#0F141A]/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-[24px] border border-[#DCE0D4] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Receipt Banner */}
          <div className="bg-[#0B3B24] text-white p-6 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#93E937]/15 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#93E937] text-[#0B3B24] flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="font-outfit font-bold text-base leading-tight">
                    SEAFI Official Digital Receipt
                  </p>
                  <p className="font-mono text-[11px] text-[#93E937]">
                    {tx.reference} • Kwitansi Terverifikasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptTx(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#93E937]/20 border border-[#93E937]/40 text-[#93E937] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {tx.status} • {tx.canbProof.settlementMs}ms Instant Finality
              </span>
              <h3 className="font-outfit text-3xl font-bold mt-3">
                {formatCurrency(tx.targetAmount, tx.targetCurrency)}
              </h3>
              {tx.sourceCurrency !== tx.targetCurrency && (
                <p className="text-xs text-white/75 mt-1 font-mono">
                  Converted from{" "}
                  {formatCurrency(tx.sourceAmount, tx.sourceCurrency)}
                </p>
              )}
            </div>
          </div>

          {/* Body Details */}
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="bg-[#F6F7F2] rounded-2xl p-4 space-y-3 border border-[#DCE0D4]">
              <div className="flex justify-between text-sm">
                <span className="text-[#525B68]">Transaction Type</span>
                <span className="font-semibold text-[#0F141A] uppercase text-xs px-2.5 py-0.5 rounded-full bg-white border border-[#DCE0D4]">
                  {tx.type}
                </span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-[#525B68] shrink-0">Counterparty</span>
                <span className="font-semibold text-[#0F141A] text-right">
                  {tx.counterparty}
                </span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-[#525B68] shrink-0">Settlement Rail</span>
                <span className="font-medium text-[#0B3B24] text-right">
                  {tx.rail}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#525B68]">Platform / Network Fee</span>
                <span className="font-mono text-xs font-semibold text-[#0F141A]">
                  {tx.feeAmount === 0
                    ? "Sponsored ($0.00)"
                    : formatCurrency(tx.feeAmount, tx.feeCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#525B68]">Timestamp</span>
                <span className="text-[#0F141A] font-medium">
                  {tx.createdAt}
                </span>
              </div>
              {tx.note && (
                <div className="pt-2 border-t border-[#DCE0D4] flex justify-between text-sm gap-4">
                  <span className="text-[#525B68] shrink-0">Memo / Note</span>
                  <span className="text-[#0F141A] text-right">{tx.note}</span>
                </div>
              )}
            </div>

            {/* Progressive Disclosure: CANB Technical Audit Trail */}
            <div className="border border-[#DCE0D4] rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAudit(!showAudit)}
                className="w-full px-4 py-3.5 bg-white hover:bg-[#F6F7F2] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0B3B24]" />
                  <span className="text-xs font-bold text-[#0F141A] uppercase tracking-wider">
                    CANB 4-Layer Cryptographic Audit Trail
                  </span>
                </div>
                {showAudit ? (
                  <ChevronUp className="w-4 h-4 text-[#525B68]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#525B68]" />
                )}
              </button>

              {showAudit && (
                <div className="p-4 bg-[#14171A] text-white space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Nonce Binding ID</span>
                    <span className="text-[#93E937]">
                      {tx.canbProof.nonceBindingId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">EIP-712 Domain</span>
                    <span>{tx.canbProof.domainHash}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Execution Network</span>
                    <span>{tx.canbProof.network}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Settlement Hash</span>
                    <button
                      type="button"
                      onClick={() => copyText("Tx Hash", tx.canbProof.txHash)}
                      className="inline-flex items-center gap-1.5 text-[#93E937] hover:underline cursor-pointer"
                    >
                      {tx.canbProof.txHash}
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => copyText("Receipt Reference", tx.reference)}
                className="flex-1 py-3 px-4 rounded-full border border-[#DCE0D4] hover:border-[#0B3B24] text-sm font-outfit font-semibold text-[#0F141A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Ref
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] text-sm font-outfit font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Kwitansi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
