"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useDemo } from "@/context/DemoContext";
import {
  ALL_CURRENCY_CODES,
  CURRENCIES,
  type CurrencyCode,
  formatCurrency,
} from "@/lib/currencies";

interface CurrencyPickerButtonProps {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  allowedCodes?: CurrencyCode[];
  variant?: "light" | "dark";
  title?: string;
  showBalanceInModal?: boolean;
}

export default function CurrencyPickerButton({
  value,
  onChange,
  allowedCodes = ALL_CURRENCY_CODES,
  variant = "light",
  title = "Select Currency",
  showBalanceInModal = true,
}: CurrencyPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "fiat" | "stablecoin">("all");
  const { balances, hideBalances } = useDemo();

  const current = CURRENCIES[value];

  const hasBothKinds = useMemo(() => {
    const hasFiat = allowedCodes.some((c) => CURRENCIES[c].kind === "fiat");
    const hasStable = allowedCodes.some(
      (c) => CURRENCIES[c].kind === "stablecoin"
    );
    return hasFiat && hasStable;
  }, [allowedCodes]);

  const filtered = useMemo(() => {
    return allowedCodes.filter((code) => {
      const meta = CURRENCIES[code];
      if (hasBothKinds && tab !== "all" && meta.kind !== tab) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        meta.code.toLowerCase().includes(q) ||
        meta.name.toLowerCase().includes(q) ||
        meta.rail.toLowerCase().includes(q)
      );
    });
  }, [allowedCodes, hasBothKinds, query, tab]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "dark"
            ? "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-outfit font-semibold text-sm transition-all shrink-0 cursor-pointer"
            : "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0F2EA] border border-[#DCE0D4] hover:border-[#0B3B24] text-[#0F141A] font-outfit font-semibold text-sm shadow-xs transition-all shrink-0 cursor-pointer"
        }
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-[#0F141A]/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md bg-white rounded-[24px] border border-[#DCE0D4] shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-[#DCE0D4] flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-lg font-bold text-[#0F141A]">
                    {title}
                  </h3>
                  <p className="text-xs text-[#525B68]">
                    Multi-currency Fiat & Stablecoin Liquidity Rails
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F6F7F2] hover:bg-[#E8EAE0] flex items-center justify-center text-[#525B68] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 bg-[#F6F7F2]/60 border-b border-[#DCE0D4]">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search IDR, SGD, USDC, PayNow, BI-FAST..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DCE0D4] rounded-xl text-sm text-[#0F141A] focus:outline-none focus:border-[#0B3B24]"
                  />
                </div>

                {hasBothKinds && (
                  <div className="flex gap-1.5">
                    {(
                      [
                        { id: "all", label: "All Currencies" },
                        { id: "fiat", label: "Local Fiat" },
                        { id: "stablecoin", label: "Stablecoins" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          tab === item.id
                            ? "bg-[#0B3B24] text-[#93E937]"
                            : "bg-white text-[#525B68] border border-[#DCE0D4] hover:border-[#0B3B24]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-2.5 space-y-1">
                {filtered.map((code) => {
                  const meta = CURRENCIES[code];
                  const selected = code === value;
                  const bal = balances[code] ?? 0;

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        onChange(code);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                        selected
                          ? "bg-[#93E937]/20 border border-[#93E937]"
                          : "hover:bg-[#F6F7F2] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F6F7F2] border border-[#DCE0D4] flex items-center justify-center text-lg shrink-0">
                          {meta.flag}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-outfit font-bold text-[#0F141A]">
                              {meta.code}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                meta.kind === "stablecoin"
                                  ? "bg-[#0B3B24] text-[#93E937]"
                                  : "bg-[#E8EAE0] text-[#525B68]"
                              }`}
                            >
                              {meta.kind === "stablecoin"
                                ? "Stablecoin"
                                : "Fiat"}
                            </span>
                          </div>
                          <p className="text-xs text-[#525B68]">
                            {meta.name} • {meta.rail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-right">
                        {showBalanceInModal && (
                          <div>
                            <p className="font-mono text-xs font-semibold text-[#0F141A]">
                              {hideBalances
                                ? "••••••"
                                : formatCurrency(bal, code, { compact: true })}
                            </p>
                            <p className="text-[10px] text-[#8E98A8]">
                              Available
                            </p>
                          </div>
                        )}
                        {selected && (
                          <div className="w-5 h-5 rounded-full bg-[#0B3B24] text-[#93E937] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-sm text-[#8E98A8]">
                    No matching currency found.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
