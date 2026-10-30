"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Fingerprint,
  Globe2,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import CurrencyPickerButton from "@/components/CurrencySelectModal";
import { useDemo } from "@/context/DemoContext";
import {
  convertCurrency,
  type CurrencyCode,
  formatCurrency,
  formatRatePair,
} from "@/lib/currencies";

export default function LandingMvpPage() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useDemo();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USDC");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("IDR");
  const [amount, setAmount] = useState<number>(1000);

  const fee = amount * 0.003;
  const netConverted = convertCurrency(
    Math.max(0, amount - fee),
    fromCurrency,
    toCurrency
  );

  const handleLaunchWithQuote = () => {
    const dest = `/dashboard/transfer?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`;
    if (isAuthenticated) {
      router.push(dest);
    } else {
      router.push(`/login?next=${encodeURIComponent(dest)}`);
    }
  };

  const handleQuickDemoEnter = () => {
    if (!isAuthenticated) {
      signIn({ persona: "personal" });
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F6F7F2] text-[#0F141A] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#DCE0D4] bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B3B24] flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-[#93E937] fill-[#93E937]" />
            </div>
            <div className="leading-none">
              <span className="font-outfit text-xl font-extrabold tracking-tight">
                SEA<span className="text-[#0B3B24]">FI</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#93E937]/30 border border-[#93E937] text-[#0B3B24] font-mono text-[10px] font-bold">
                INTERACTIVE MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-[#0B3B24] text-[#93E937] font-outfit font-bold text-sm hover:opacity-95 transition-all flex items-center gap-2"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full border border-[#DCE0D4] bg-white hover:border-[#0B3B24] font-outfit font-semibold text-sm text-[#0F141A] transition-all"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleQuickDemoEnter}
                  className="px-5 py-2.5 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] font-outfit font-bold text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  1-Click Demo
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE0D4] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#93E937] animate-pulse" />
              <span className="text-xs font-semibold text-[#0B3B24]">
                Invisible Web2.5 Payment OS • CANB Security Engine
              </span>
            </div>

            <h1 className="font-outfit text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0F141A]">
              Borderless{" "}
              <span className="text-[#0B3B24] underline decoration-[#93E937] decoration-4 underline-offset-4">
                Multi-Currency
              </span>{" "}
              Settlement & Instant Ramps.
            </h1>

            <p className="text-base sm:text-lg text-[#525B68] max-w-2xl leading-relaxed">
              Experience SEAFI’s full end-to-end interactive frontend MVP:
              Passwordless ERC-4337 Sign-In, instant Cross-Border Transfers,
              Multi-Currency Payment Requests with QR checkout, and local Fiat
              On-Ramp / Off-Ramp via BI-FAST, QRIS, PayNow & Stablecoins.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/login"
                className="btn-primary shadow-[0_10px_25px_rgba(147,233,55,0.35)] gap-2"
              >
                Start Full Demo from Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleQuickDemoEnter}
                className="h-12 px-6 rounded-full bg-white border border-[#DCE0D4] hover:border-[#0B3B24] font-outfit font-semibold text-sm text-[#0F141A] inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                Jump Straight to Wallet
              </button>
            </div>

            {/* Trust / Feature Pills */}
            <div className="flex flex-wrap gap-2.5 pt-3">
              {[
                "10 Fiat & Stablecoin Wallets",
                "Zero Gas Fees (ERC-4337)",
                "QRIS • BI-FAST • PayNow • ACH",
                "CANB Replay Protection",
              ].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#DCE0D4] text-xs font-medium text-[#525B68]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3B24]" />
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Interactive Live Quote Sandbox */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-[0_24px_60px_-15px_rgba(11,59,36,0.12)] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-outfit text-xl font-bold text-[#0F141A]">
                    Live Cross-Border Sandbox
                  </h2>
                  <p className="text-xs text-[#525B68]">
                    Try any currency pair & continue into the app
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#93E937]/25 border border-[#93E937] text-[#0B3B24] font-mono text-[11px] font-bold">
                  0.3% Flat Fee
                </span>
              </div>

              {/* You Send */}
              <div className="p-4 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] focus-within:border-[#0B3B24] transition-colors">
                <div className="flex justify-between text-xs font-semibold text-[#525B68] mb-2">
                  <span>You Send</span>
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min={0}
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-transparent font-outfit text-2xl sm:text-3xl font-bold text-[#0F141A] outline-none"
                    placeholder="0.00"
                  />
                  <CurrencyPickerButton
                    value={fromCurrency}
                    onChange={setFromCurrency}
                    title="Select Source Currency"
                    showBalanceInModal={false}
                  />
                </div>
              </div>

              {/* Swap & Live Rate Divider */}
              <div className="flex items-center justify-between px-2">
                <div className="text-xs text-[#525B68] space-y-0.5">
                  <p className="font-mono font-semibold text-[#0B3B24]">
                    {formatRatePair(fromCurrency, toCurrency)}
                  </p>
                  <p>
                    Fee: {formatCurrency(fee, fromCurrency)} • Arrives in ~2 sec
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFromCurrency(toCurrency);
                    setToCurrency(fromCurrency);
                  }}
                  title="Swap currencies"
                  className="w-9 h-9 rounded-full bg-[#F6F7F2] hover:bg-[#93E937] border border-[#DCE0D4] flex items-center justify-center text-[#0B3B24] transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Recipient Gets */}
              <div className="p-4 rounded-2xl bg-[#0B3B24] text-white border border-[#0B3B24]">
                <div className="flex justify-between text-xs font-semibold text-[#93E937] mb-2">
                  <span>Recipient Receives</span>
                  <span>Guaranteed Rate (15m)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-outfit text-2xl sm:text-3xl font-bold truncate">
                    {formatCurrency(netConverted, toCurrency)}
                  </div>
                  <CurrencyPickerButton
                    value={toCurrency}
                    onChange={setToCurrency}
                    variant="dark"
                    title="Select Destination Currency"
                    showBalanceInModal={false}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleLaunchWithQuote}
                className="w-full py-4 rounded-full bg-[#93E937] hover:bg-[#052315] text-[#0B3B24] hover:text-[#93E937] font-outfit font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                Try This Transfer in MVP
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#525B68]">
                <ShieldCheck className="w-4 h-4 text-[#0B3B24]" />
                <span>
                  Protected by <strong>CANB EIP-712</strong> Replay Defense
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4 Interactive Demo Flows Grid */}
        <section className="mt-16 lg:mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#93E937] text-[#0B3B24] font-outfit text-xs font-bold uppercase tracking-wider">
                Interactive Demo Flows
              </span>
              <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-[#0F141A] mt-2">
                Everything Ready to Demo Live
              </h2>
            </div>
            <p className="text-sm text-[#525B68]">
              100% Frontend Interactive State • Balances & Receipts Persist Live
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                title: "Smart Account Sign-In",
                desc: "Passkey / Social ERC-4337 Vault login with Freelancer & Enterprise B2B personas.",
                href: "/login",
                icon: Fingerprint,
                accent: false,
              },
              {
                step: "02",
                title: "Multi-Currency Transfer",
                desc: "Send across IDR, SGD, USD, PHP, MYR, THB, EUR & USDC/IDRX with CANB verification.",
                href: "/dashboard/transfer",
                icon: Send,
                accent: true,
              },
              {
                step: "03",
                title: "Receive & Select Currency",
                desc: "Generate QR payment links or virtual bank details in any currency & simulate client pay-in.",
                href: "/dashboard/receive",
                icon: ArrowDownLeft,
                accent: false,
              },
              {
                step: "04",
                title: "Fiat On-Ramp & Off-Ramp",
                desc: "Buy stablecoins via QRIS / PayNow / Card & off-ramp instantly to local bank accounts.",
                href: "/dashboard/ramp",
                icon: Globe2,
                accent: false,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.step}
                  href={card.href}
                  className={`group rounded-[24px] p-6 border transition-all flex flex-col justify-between gap-6 ${
                    card.accent
                      ? "bg-[#93E937] border-[#93E937] text-[#0F141A] shadow-[0_12px_30px_rgba(147,233,55,0.3)] hover:-translate-y-1"
                      : "bg-white border-[#DCE0D4] hover:border-[#0B3B24] text-[#0F141A] shadow-xs hover:-translate-y-1"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          card.accent
                            ? "bg-[#0B3B24] text-[#93E937]"
                            : "bg-[#F6F7F2] text-[#0B3B24]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold opacity-60">
                        FLOW {card.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-outfit text-lg font-bold">
                        {card.title}
                      </h3>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed ${
                          card.accent ? "text-[#0B3B24]/85" : "text-[#525B68]"
                        }`}
                      >
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-outfit font-bold text-[#0B3B24]">
                    Launch Flow
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
