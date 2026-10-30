"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck2,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import CurrencyPickerButton from "@/components/CurrencySelectModal";
import { type DemoTransaction, useDemo } from "@/context/DemoContext";
import {
  ALL_CURRENCY_CODES,
  convertCurrency,
  CURRENCIES,
  type CurrencyCode,
  formatCurrency,
  formatRatePair,
} from "@/lib/currencies";

const SETTLEMENT_STAGES = [
  "Signing Gasless ERC-4337 Smart Account UserOp...",
  "Verifying CANB 4-Layer Replay Defense & FX Pool...",
  "Disbursing Funds via Instant Local Clearing Rail...",
];

function TransferFlowContent() {
  const searchParams = useSearchParams();
  const {
    balances,
    recipients,
    addRecipient,
    executeTransfer,
    topUpDemoBalances,
    setActiveReceiptTx,
  } = useDemo();

  const initialFrom = (searchParams.get("from") || "USDC") as CurrencyCode;
  const initialTo = (searchParams.get("to") || "IDR") as CurrencyCode;
  const initialAmount = Number(searchParams.get("amount")) || 500;

  const [sourceCurrency, setSourceCurrency] = useState<CurrencyCode>(
    ALL_CURRENCY_CODES.includes(initialFrom) ? initialFrom : "USDC"
  );
  const [targetCurrency, setTargetCurrency] = useState<CurrencyCode>(
    ALL_CURRENCY_CODES.includes(initialTo) ? initialTo : "IDR"
  );
  const [sourceAmount, setSourceAmount] = useState<number>(initialAmount);
  const [feeTier, setFeeTier] = useState<"standard" | "enterprise">("standard");
  const [note, setNote] = useState("Q4 Cross-Border Vendor Settlement");

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    recipients[0]?.id || ""
  );
  const [useCustomRecipient, setUseCustomRecipient] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customAccount, setCustomAccount] = useState("");
  const [customBank, setCustomBank] = useState("BCA / BI-FAST");

  const [lockSeconds, setLockSeconds] = useState(899); // 14:59
  const [isSending, setIsSending] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [completedTx, setCompletedTx] = useState<DemoTransaction | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLockSeconds((s) => (s > 1 ? s - 1 : 899));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const availableBalance = balances[sourceCurrency] ?? 0;
  const insufficient = sourceAmount > availableBalance;

  const feePct = feeTier === "enterprise" ? 0.001 : 0.003;
  const feeAmount =
    sourceCurrency === targetCurrency ? 0 : Math.max(0, sourceAmount * feePct);
  const netSource = Math.max(0, sourceAmount - feeAmount);
  const targetAmount = convertCurrency(
    netSource,
    sourceCurrency,
    targetCurrency
  );

  // Traditional bank wire typically charges ~3.8% FX + wire overhead
  const bankComparisonSavings = sourceAmount * 0.035;

  const activeRecipient = recipients.find((r) => r.id === selectedRecipientId);

  const handleSelectSavedRecipient = (id: string) => {
    setUseCustomRecipient(false);
    setSelectedRecipientId(id);
    const rec = recipients.find((r) => r.id === id);
    if (rec) {
      setTargetCurrency(rec.preferredCurrency);
    }
  };

  const handleSwapCurrencies = () => {
    const prevSource = sourceCurrency;
    const prevTarget = targetCurrency;
    setSourceCurrency(prevTarget);
    setTargetCurrency(prevSource);
    const convertedInput = convertCurrency(sourceAmount, prevSource, prevTarget);
    const decimals = CURRENCIES[prevTarget].decimals;
    setSourceAmount(
      decimals === 0
        ? Math.round(convertedInput)
        : Number(convertedInput.toFixed(2))
    );
  };

  const handleConfirmTransfer = () => {
    if (sourceAmount <= 0 || insufficient || isSending) return;

    let recipientName = activeRecipient?.name || "Global Recipient";
    let recipientAccount = activeRecipient?.handleOrAccount || "Instant Account";
    let rail = CURRENCIES[targetCurrency].rail;

    if (useCustomRecipient) {
      recipientName = customName.trim() || "Custom Recipient";
      recipientAccount = `${customBank} • ${customAccount.trim() || "88109241"}`;
      rail = `${customBank} (${CURRENCIES[targetCurrency].rail})`;
      if (customName.trim()) {
        addRecipient({
          name: recipientName,
          handleOrAccount: recipientAccount,
          institution: customBank,
          country: targetCurrency,
          preferredCurrency: targetCurrency,
        });
      }
    }

    setIsSending(true);
    setStageIdx(0);

    window.setTimeout(() => setStageIdx(1), 650);
    window.setTimeout(() => setStageIdx(2), 1350);
    window.setTimeout(() => {
      const tx = executeTransfer({
        sourceCurrency,
        sourceAmount,
        targetCurrency,
        targetAmount,
        feeAmount,
        recipientName,
        recipientAccount,
        rail,
        note,
      });
      setIsSending(false);
      setCompletedTx(tx);
    }, 2050);
  };

  const mins = String(Math.floor(lockSeconds / 60)).padStart(2, "0");
  const secs = String(lockSeconds % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B24]">
            Cross-Border & Local Payment Engine
          </span>
          <h1 className="font-outfit text-3xl font-bold text-[#0F141A] mt-1">
            Transfer Money
          </h1>
          <p className="text-sm text-[#525B68] mt-1">
            Send from any Fiat or Stablecoin wallet with guaranteed FX rate &
            instant local disbursal.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#DCE0D4] text-xs font-mono text-[#0B3B24] w-fit">
          <Clock className="w-3.5 h-3.5 text-[#0B3B24]" />
          <span>
            FX Rate Locked: <strong>{mins}:{secs}</strong>
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {completedTx ? (
          <motion.div
            key="transfer-complete"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[28px] p-8 border border-[#93E937] shadow-xl max-w-2xl mx-auto text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#93E937] text-[#0B3B24] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(147,233,55,0.5)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#93E937]/25 text-[#0B3B24] font-mono text-xs font-bold">
                {completedTx.reference} • SETTLED IN{" "}
                {completedTx.canbProof.settlementMs}ms
              </span>
              <h2 className="font-outfit text-3xl font-extrabold text-[#0F141A] mt-3">
                {formatCurrency(
                  completedTx.targetAmount,
                  completedTx.targetCurrency
                )}{" "}
                Delivered!
              </h2>
              <p className="text-sm text-[#525B68] mt-1">
                Sent to <strong>{completedTx.counterparty}</strong> via{" "}
                {completedTx.rail}
              </p>
            </div>

            <div className="bg-[#F6F7F2] rounded-2xl p-4 border border-[#DCE0D4] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#525B68]">Debited from Wallet</span>
                <span className="font-mono font-bold text-[#0F141A]">
                  {formatCurrency(
                    completedTx.sourceAmount,
                    completedTx.sourceCurrency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B68]">Remaining {sourceCurrency} Balance</span>
                <span className="font-mono font-semibold text-[#0B3B24]">
                  {formatCurrency(balances[sourceCurrency] ?? 0, sourceCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B68]">CANB Replay Nonce</span>
                <span className="font-mono text-[#0B3B24]">
                  {completedTx.canbProof.nonceBindingId}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveReceiptTx(completedTx)}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#0B3B24] text-[#93E937] font-outfit font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                Inspect Official Kwitansi & Proof
              </button>
              <button
                type="button"
                onClick={() => setCompletedTx(null)}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#93E937] text-[#0B3B24] font-outfit font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Make Another Transfer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="transfer-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left Column: Amount, Currencies & Recipient */}
            <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-2xs space-y-6">
              {/* Fee Tier Toggle */}
              <div className="flex items-center justify-between">
                <h2 className="font-outfit text-lg font-bold text-[#0F141A]">
                  1. Currency & Amount
                </h2>
                <div className="inline-flex p-1 rounded-full bg-[#F6F7F2] border border-[#DCE0D4]">
                  <button
                    type="button"
                    onClick={() => setFeeTier("standard")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      feeTier === "standard"
                        ? "bg-[#0B3B24] text-[#93E937]"
                        : "text-[#525B68]"
                    }`}
                  >
                    Standard (0.3%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeTier("enterprise")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      feeTier === "enterprise"
                        ? "bg-[#0B3B24] text-[#93E937]"
                        : "text-[#525B68]"
                    }`}
                  >
                    Enterprise (0.1%)
                  </button>
                </div>
              </div>

              {/* You Send Box */}
              <div
                className={`p-4 sm:p-5 rounded-2xl bg-[#F6F7F2] border transition-colors ${
                  insufficient
                    ? "border-[#F43F5E]"
                    : "border-[#DCE0D4] focus-within:border-[#0B3B24]"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#525B68]">
                    Pay From SEAFI Wallet
                  </span>
                  <span className="font-mono text-[#0B3B24] font-semibold">
                    Balance: {formatCurrency(availableBalance, sourceCurrency)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={sourceAmount || ""}
                    onChange={(e) => setSourceAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-transparent font-outfit text-3xl font-bold text-[#0F141A] outline-none"
                  />
                  <CurrencyPickerButton
                    value={sourceCurrency}
                    onChange={setSourceCurrency}
                    title="Select Source Wallet"
                  />
                </div>

                {/* Preset Amounts & Percentage Helpers */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#DCE0D4]/70">
                  <div className="flex flex-wrap gap-1.5">
                    {CURRENCIES[sourceCurrency].quickAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSourceAmount(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#93E937]/30 border border-[#DCE0D4] font-mono text-[11px] font-semibold text-[#0F141A] cursor-pointer"
                      >
                        {formatCurrency(preset, sourceCurrency, {
                          compact: true,
                        })}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSourceAmount(availableBalance)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B3B24] text-[#93E937] font-mono text-[11px] font-bold cursor-pointer"
                  >
                    MAX
                  </button>
                </div>

                {insufficient && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#F43F5E]">
                      Amount exceeds current {sourceCurrency} demo balance.
                    </span>
                    <button
                      type="button"
                      onClick={topUpDemoBalances}
                      className="px-3 py-1 rounded-full bg-[#0F141A] text-[#93E937] text-xs font-outfit font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Coins className="w-3 h-3" />
                      + Top Up Demo
                    </button>
                  </div>
                )}
              </div>

              {/* Swap Button & Rate Strip */}
              <div className="flex items-center justify-between px-2">
                <div className="text-xs text-[#525B68]">
                  <span className="font-mono font-bold text-[#0B3B24]">
                    {formatRatePair(sourceCurrency, targetCurrency)}
                  </span>
                  <span className="ml-2 text-[#8E98A8]">
                    • Zero FX Spread Markup
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="w-9 h-9 rounded-full bg-[#F6F7F2] hover:bg-[#93E937] border border-[#DCE0D4] flex items-center justify-center text-[#0B3B24] transition-colors cursor-pointer"
                  title="Swap Send & Receive currencies"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Recipient Gets Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0B3B24] text-white">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#93E937]">
                    Recipient Gets Exactly
                  </span>
                  <span className="text-white/70">
                    Rail: {CURRENCIES[targetCurrency].rail}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="font-outfit text-3xl font-bold truncate">
                    {formatCurrency(targetAmount, targetCurrency)}
                  </div>
                  <CurrencyPickerButton
                    value={targetCurrency}
                    onChange={setTargetCurrency}
                    variant="dark"
                    title="Select Recipient Currency"
                    showBalanceInModal={false}
                  />
                </div>
              </div>

              {/* Step 2: Select Recipient */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-outfit text-lg font-bold text-[#0F141A]">
                    2. Recipient Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setUseCustomRecipient(!useCustomRecipient)}
                    className="inline-flex items-center gap-1.5 text-xs font-outfit font-bold text-[#0B3B24] hover:underline cursor-pointer"
                  >
                    {useCustomRecipient ? (
                      "Choose Saved Recipient"
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />+ Custom Recipient
                      </>
                    )}
                  </button>
                </div>

                {!useCustomRecipient ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {recipients.map((rec) => {
                      const active = rec.id === selectedRecipientId;
                      return (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => handleSelectSavedRecipient(rec.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                            active
                              ? "bg-[#93E937]/20 border-[#0B3B24] shadow-2xs"
                              : "bg-[#F6F7F2]/60 border-[#DCE0D4] hover:border-[#0B3B24]"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#0B3B24] text-[#93E937] font-outfit font-bold text-xs flex items-center justify-center shrink-0">
                            {rec.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-outfit font-bold text-sm text-[#0F141A] truncate">
                                {rec.name}
                              </p>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#DCE0D4]">
                                {rec.preferredCurrency}
                              </span>
                            </div>
                            <p className="text-xs text-[#525B68] truncate">
                              {rec.handleOrAccount}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#525B68] mb-1">
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Budi Santoso / Acme SG"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCE0D4] text-sm outline-none focus:border-[#0B3B24]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#525B68] mb-1">
                          Bank / e-Wallet / Network
                        </label>
                        <input
                          type="text"
                          value={customBank}
                          onChange={(e) => setCustomBank(e.target.value)}
                          placeholder="e.g. BCA, GoPay, DBS PayNow"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCE0D4] text-sm outline-none focus:border-[#0B3B24]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#525B68] mb-1">
                        Account Number / Phone / Wallet Address
                      </label>
                      <input
                        type="text"
                        value={customAccount}
                        onChange={(e) => setCustomAccount(e.target.value)}
                        placeholder="e.g. 8810 4920 11 or 0x..."
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCE0D4] text-sm outline-none focus:border-[#0B3B24]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#525B68] mb-1">
                    Reference / Payment Note (Included on Kwitansi)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE0D4] focus:bg-white focus:border-[#0B3B24] text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Settlement Summary & CANB Check */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-[#14171A] text-white rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#93E937]">
                    Transfer Summary
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-mono text-[11px]">
                    ERC-4337 Sponsored
                  </span>
                </div>

                <div className="space-y-3 text-sm border-y border-white/10 py-4">
                  <div className="flex justify-between">
                    <span className="text-white/65">You Send</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(sourceAmount, sourceCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/65">SEAFI Liquidity Fee</span>
                    <span className="font-mono text-white/90">
                      {feeAmount === 0
                        ? "Free ($0.00)"
                        : `-${formatCurrency(feeAmount, sourceCurrency)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/65">Gas / Network Cost</span>
                    <span className="font-mono text-[#93E937] font-semibold">
                      $0.00 (Sponsored)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/65">Delivery Speed</span>
                    <span className="font-semibold text-[#93E937]">
                      Instant (~2 seconds)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-white/80 font-medium">
                      Recipient Gets
                    </span>
                    <span className="font-outfit text-2xl font-bold text-[#93E937]">
                      {formatCurrency(targetAmount, targetCurrency)}
                    </span>
                  </div>
                </div>

                {/* Savings Callout */}
                <div className="p-3.5 rounded-2xl bg-[#93E937]/10 border border-[#93E937]/25 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#93E937] shrink-0" />
                  <p className="text-xs text-white/90 leading-relaxed">
                    You save approx.{" "}
                    <strong className="text-[#93E937]">
                      {formatCurrency(bankComparisonSavings, sourceCurrency)}
                    </strong>{" "}
                    compared to traditional SWIFT bank FX & wire fees.
                  </p>
                </div>

                {/* CANB Pre-check Badges */}
                <div className="space-y-2 text-xs text-white/75">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#93E937]" />
                    <span>EIP-712 Domain Separation & Nonce Bound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#93E937]" />
                    <span>Official PDF/Print Kwitansi auto-generated</span>
                  </div>
                </div>

                {isSending ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-[#93E937]/40 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-[#93E937] border-t-transparent animate-spin shrink-0" />
                      <span className="font-mono text-xs text-[#93E937]">
                        {SETTLEMENT_STAGES[stageIdx]}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#93E937]"
                        initial={{ width: "20%" }}
                        animate={{ width: `${((stageIdx + 1) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={sourceAmount <= 0 || insufficient}
                    onClick={handleConfirmTransfer}
                    className="w-full py-4 rounded-full bg-[#93E937] hover:bg-[#a6f450] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B3B24] font-outfit font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(147,233,55,0.35)] transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Confirm & Send{" "}
                    {formatCurrency(targetAmount, targetCurrency, {
                      compact: true,
                    })}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TransferPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-outfit text-sm text-[#525B68]">
          Loading Transfer Engine...
        </div>
      }
    >
      <TransferFlowContent />
    </Suspense>
  );
}
