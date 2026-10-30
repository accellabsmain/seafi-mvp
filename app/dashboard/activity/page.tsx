"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  Search,
  ShieldCheck,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { type TransactionType, useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/currencies";

export default function ActivityHistoryPage() {
  const { transactions, setActiveReceiptTx } = useDemo();
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.sourceCurrency.toLowerCase().includes(q) ||
        tx.targetCurrency.toLowerCase().includes(q)
      );
    });
  }, [transactions, filter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B24]">
            CANB Verified Ledger & Digital Kwitansi
          </span>
          <h1 className="font-outfit text-3xl font-bold text-[#0F141A] mt-1">
            Transaction Activity
          </h1>
          <p className="text-sm text-[#525B68] mt-1">
            Every Transfer, Receive, On-Ramp, and Off-Ramp includes a
            cryptographic receipt.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#DCE0D4] text-xs font-semibold text-[#0B3B24] w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>{transactions.length} Verified Records</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[24px] p-4 border border-[#DCE0D4] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "all", label: "All" },
              { id: "transfer", label: "Transfers" },
              { id: "receive", label: "Received" },
              { id: "onramp", label: "On-Ramp" },
              { id: "offramp", label: "Off-Ramp" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-outfit font-bold transition-all cursor-pointer ${
                filter === item.id
                  ? "bg-[#0B3B24] text-[#93E937]"
                  : "bg-[#F6F7F2] text-[#525B68] hover:text-[#0F141A]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ref, client, currency..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F6F7F2] border border-[#DCE0D4] focus:bg-white focus:border-[#0B3B24] text-xs outline-none"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-[24px] p-4 sm:p-6 border border-[#DCE0D4] divide-y divide-[#F0F2EA]">
        {filtered.map((tx) => {
          const isInbound = tx.type === "receive" || tx.type === "onramp";
          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => setActiveReceiptTx(tx)}
              className="w-full py-4 px-3 -mx-3 hover:bg-[#F6F7F2] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isInbound
                      ? "bg-[#93E937]/30 text-[#0B3B24]"
                      : "bg-[#0B3B24] text-[#93E937]"
                  }`}
                >
                  {isInbound ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-outfit font-bold text-sm text-[#0F141A]">
                      {tx.title}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F6F7F2] border border-[#DCE0D4] text-[#525B68]">
                      {tx.reference}
                    </span>
                  </div>
                  <p className="text-xs text-[#525B68] mt-0.5">
                    {tx.subtitle} • {tx.rail} • {tx.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                <p
                  className={`font-mono text-sm font-bold ${
                    isInbound ? "text-[#0B3B24]" : "text-[#0F141A]"
                  }`}
                >
                  {isInbound ? "+" : "-"}
                  {formatCurrency(
                    isInbound ? tx.targetAmount : tx.sourceAmount,
                    isInbound ? tx.targetCurrency : tx.sourceCurrency
                  )}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B3B24] bg-[#93E937]/25 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {tx.status} • View Kwitansi
                  <FileCheck2 className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-[#8E98A8]">
            No transactions match your filter.
          </p>
        )}
      </div>
    </div>
  );
}
