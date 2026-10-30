"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDemo } from "@/context/DemoContext";
import {
  ALL_CURRENCY_CODES,
  convertCurrency,
  CURRENCIES,
  type CurrencyCode,
  FIAT_CODES,
  formatCurrency,
  STABLECOIN_CODES,
} from "@/lib/currencies";

const DISPLAY_OPTIONS: CurrencyCode[] = [
  "USD",
  "IDR",
  "SGD",
  "MYR",
  "PHP",
  "THB",
  "EUR",
];

export default function DashboardOverviewPage() {
  const {
    user,
    balances,
    displayCurrency,
    setDisplayCurrency,
    hideBalances,
    toggleHideBalances,
    totalPortfolioInDisplayCurrency,
    transactions,
    paymentRequests,
    simulatePayRequest,
    setActiveReceiptTx,
  } = useDemo();

  const [walletFilter, setWalletFilter] = useState<
    "all" | "stablecoin" | "fiat"
  >("all");
  const [yieldAccruedUsd, setYieldAccruedUsd] = useState(14.8241);

  // Subtle per-second Aave V3 float yield ticker
  useEffect(() => {
    const timer = window.setInterval(() => {
      setYieldAccruedUsd((prev) => prev + 0.0004);
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  const visibleWallets =
    walletFilter === "stablecoin"
      ? STABLECOIN_CODES
      : walletFilter === "fiat"
        ? FIAT_CODES
        : ALL_CURRENCY_CODES;

  const pendingRequests = paymentRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-8">
      {/* Greeting & Persona Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B24]">
            {user.persona === "enterprise"
              ? "Enterprise Multi-Entity Treasury"
              : "Personal & Freelancer Global Account"}
          </span>
          <h1 className="font-outfit text-3xl sm:text-4xl font-bold text-[#0F141A] mt-1">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#525B68]">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#DCE0D4] font-mono">
            Auth: {user.authMethod}
          </span>
        </div>
      </div>

      {/* Hero Consolidated Balance Card */}
      <div className="card-balance-dark p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#93E937]/12 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/65">
                  Total Consolidated Portfolio
                </span>
                <button
                  type="button"
                  onClick={toggleHideBalances}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
                  aria-label="Toggle balance visibility"
                >
                  {hideBalances ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <h2 className="font-outfit text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {hideBalances
                    ? "••••••••••"
                    : formatCurrency(
                        totalPortfolioInDisplayCurrency,
                        displayCurrency
                      )}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#93E937]/15 border border-[#93E937]/30 text-[#93E937] font-mono text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Aave Float +4.82% APY (${yieldAccruedUsd.toFixed(4)})
                </span>
              </div>
            </div>

            {/* Display Currency Switcher */}
            <div className="flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 w-fit">
              {DISPLAY_OPTIONS.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setDisplayCurrency(code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    displayCurrency === code
                      ? "bg-[#93E937] text-[#0B3B24]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Primary 4 Demo Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Link
              href="/dashboard/transfer"
              className="py-3.5 px-4 rounded-2xl bg-[#93E937] hover:bg-[#a3f24d] text-[#0B3B24] font-outfit font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(147,233,55,0.28)] transition-all"
            >
              <Send className="w-4 h-4" />
              Transfer
            </Link>
            <Link
              href="/dashboard/receive"
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-outfit font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 text-[#93E937]" />
              Receive / QR
            </Link>
            <Link
              href="/dashboard/ramp?mode=onramp"
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-outfit font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-[#93E937]" />
              On-Ramp (Buy)
            </Link>
            <Link
              href="/dashboard/ramp?mode=offramp"
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-outfit font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#93E937]" />
              Off-Ramp (Bank)
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Payment Requests Live Strip */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-[24px] p-5 border border-[#DCE0D4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-bold text-base text-[#0F141A]">
                  Pending Client Request: {pendingRequests[0].payerName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] font-mono text-[10px] font-bold">
                  {pendingRequests[0].reference}
                </span>
              </div>
              <p className="text-xs text-[#525B68] mt-0.5">
                Billed{" "}
                <strong>
                  {formatCurrency(
                    pendingRequests[0].requestAmount,
                    pendingRequests[0].requestCurrency
                  )}
                </strong>{" "}
                ➔ Auto-settles as{" "}
                <strong>
                  {formatCurrency(
                    pendingRequests[0].settledAmount,
                    pendingRequests[0].settleCurrency
                  )}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/pay/${pendingRequests[0].id}`}
              className="px-4 py-2 rounded-full border border-[#DCE0D4] hover:border-[#0B3B24] text-xs font-outfit font-semibold text-[#0F141A] transition-colors"
            >
              Open Checkout View
            </Link>
            <button
              type="button"
              onClick={() => {
                const tx = simulatePayRequest(
                  pendingRequests[0].id,
                  "Simulated Instant Client Pay-In"
                );
                if (tx) setActiveReceiptTx(tx);
              }}
              className="px-4 py-2 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] text-xs font-outfit font-bold transition-colors cursor-pointer"
            >
              Simulate Client Paying
            </button>
          </div>
        </div>
      )}

      {/* Multi-Currency Wallets Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-outfit text-2xl font-bold text-[#0F141A]">
              Multi-Currency Wallets & Vaults
            </h2>
            <p className="text-xs text-[#525B68]">
              Click any currency action to transfer, receive, or ramp directly
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white border border-[#DCE0D4] w-fit">
            {(
              [
                { id: "all", label: "All (10)" },
                { id: "stablecoin", label: "Stablecoins (3)" },
                { id: "fiat", label: "Local Fiat (7)" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setWalletFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  walletFilter === f.id
                    ? "bg-[#0B3B24] text-[#93E937]"
                    : "text-[#525B68] hover:text-[#0F141A]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWallets.map((code) => {
            const meta = CURRENCIES[code];
            const bal = balances[code] ?? 0;
            const usdEq = convertCurrency(bal, code, "USD");

            return (
              <motion.div
                key={code}
                whileHover={{ y: -2 }}
                className="bg-white rounded-[22px] p-5 border border-[#DCE0D4] hover:border-[#0B3B24] transition-all shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] flex items-center justify-center text-xl">
                      {meta.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-outfit font-bold text-base text-[#0F141A]">
                          {meta.code}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            meta.kind === "stablecoin"
                              ? "bg-[#0B3B24] text-[#93E937]"
                              : "bg-[#F6F7F2] text-[#525B68]"
                          }`}
                        >
                          {meta.kind === "stablecoin" ? "Stablecoin" : "Fiat"}
                        </span>
                      </div>
                      <p className="text-xs text-[#525B68]">{meta.name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-outfit text-2xl font-bold text-[#0F141A]">
                    {hideBalances ? "••••••" : formatCurrency(bal, code)}
                  </p>
                  <p className="font-mono text-xs text-[#8E98A8] mt-0.5">
                    {hideBalances
                      ? "•••• USD"
                      : `≈ ${formatCurrency(usdEq, "USD")} • ${meta.rail}`}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#F0F2EA]">
                  <Link
                    href={`/dashboard/transfer?from=${code}`}
                    className="py-1.5 rounded-xl bg-[#F6F7F2] hover:bg-[#0B3B24] text-[#0F141A] hover:text-[#93E937] text-xs font-outfit font-semibold text-center transition-colors"
                  >
                    Send
                  </Link>
                  <Link
                    href={`/dashboard/receive?currency=${code}`}
                    className="py-1.5 rounded-xl bg-[#F6F7F2] hover:bg-[#0B3B24] text-[#0F141A] hover:text-[#93E937] text-xs font-outfit font-semibold text-center transition-colors"
                  >
                    Receive
                  </Link>
                  <Link
                    href={
                      meta.kind === "stablecoin"
                        ? `/dashboard/ramp?mode=offramp&crypto=${code}`
                        : `/dashboard/ramp?mode=onramp&fiat=${code}`
                    }
                    className="py-1.5 rounded-xl bg-[#93E937]/25 hover:bg-[#93E937] text-[#0B3B24] text-xs font-outfit font-bold text-center transition-colors"
                  >
                    {meta.kind === "stablecoin" ? "Off-Ramp" : "On-Ramp"}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Recent Activity & Official Digital Receipts */}
      <section className="bg-white rounded-[24px] p-6 border border-[#DCE0D4] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-outfit text-xl font-bold text-[#0F141A]">
              Recent Activity & Official Receipts
            </h2>
            <p className="text-xs text-[#525B68]">
              Click any transaction to view its Official Kwitansi & CANB Proof
            </p>
          </div>
          <Link
            href="/dashboard/activity"
            className="inline-flex items-center gap-1 text-xs font-outfit font-bold text-[#0B3B24] hover:underline"
          >
            View All ({transactions.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#F0F2EA]">
          {transactions.slice(0, 5).map((tx) => {
            const isInbound = tx.type === "receive" || tx.type === "onramp";
            return (
              <button
                key={tx.id}
                type="button"
                onClick={() => setActiveReceiptTx(tx)}
                className="w-full py-3.5 px-3 -mx-3 hover:bg-[#F6F7F2] rounded-2xl flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
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
                  <div className="min-w-0">
                    <p className="font-outfit font-semibold text-sm text-[#0F141A] truncate">
                      {tx.title}
                    </p>
                    <p className="text-xs text-[#525B68] truncate">
                      {tx.subtitle} • {tx.createdAt}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
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
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0B3B24] bg-[#93E937]/25 px-2 py-0.5 rounded-full mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {tx.status} • Kwitansi
                    <FileCheck2 className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
