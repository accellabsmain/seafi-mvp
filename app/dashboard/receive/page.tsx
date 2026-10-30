"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  Link2,
  QrCode,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import CurrencyPickerButton from "@/components/CurrencySelectModal";
import QrCodeMatrix from "@/components/QrCodeMatrix";
import { type PaymentRequestItem, useDemo } from "@/context/DemoContext";
import {
  ALL_CURRENCY_CODES,
  convertCurrency,
  CURRENCIES,
  type CurrencyCode,
  formatCurrency,
  formatRatePair,
} from "@/lib/currencies";

const QUICK_CURRENCY_CHIPS: CurrencyCode[] = [
  "IDR",
  "USDC",
  "SGD",
  "USD",
  "IDRX",
  "MYR",
  "PHP",
  "THB",
  "EUR",
  "USDT",
];

function ReceiveFlowContent() {
  const searchParams = useSearchParams();
  const initialCurr = (searchParams.get("currency") || "IDR") as CurrencyCode;

  const {
    balances,
    paymentRequests,
    createPaymentRequest,
    simulatePayRequest,
    simulateDirectDeposit,
    setActiveReceiptTx,
    pushToast,
  } = useDemo();

  const [mode, setMode] = useState<"request" | "direct">("request");
  const [requestCurrency, setRequestCurrency] = useState<CurrencyCode>(
    ALL_CURRENCY_CODES.includes(initialCurr) ? initialCurr : "IDR"
  );
  const [settleCurrency, setSettleCurrency] = useState<CurrencyCode>(
    ALL_CURRENCY_CODES.includes(initialCurr) ? initialCurr : "IDR"
  );
  const [autoConvert, setAutoConvert] = useState(false);

  const [amount, setAmount] = useState<number>(
    CURRENCIES[ALL_CURRENCY_CODES.includes(initialCurr) ? initialCurr : "IDR"]
      .quickAmounts[1]
  );
  const [payerName, setPayerName] = useState("Global Client Pte Ltd");
  const [description, setDescription] = useState(
    "Product Design & Engineering Milestone"
  );

  const [activeCreatedRequest, setActiveCreatedRequest] =
    useState<PaymentRequestItem | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [directSimulating, setDirectSimulating] = useState(false);

  const effectiveSettleCurrency = autoConvert
    ? settleCurrency
    : requestCurrency;
  const estimatedSettled = convertCurrency(
    amount,
    requestCurrency,
    effectiveSettleCurrency
  );

  const handleSelectReceiveCurrency = (code: CurrencyCode) => {
    setRequestCurrency(code);
    if (!autoConvert) {
      setSettleCurrency(code);
    }
    setAmount(CURRENCIES[code].quickAmounts[1]);
  };

  const handleGenerateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    const item = createPaymentRequest({
      payerName,
      description,
      requestAmount: amount,
      requestCurrency,
      settleCurrency: effectiveSettleCurrency,
    });
    setActiveCreatedRequest(item);
  };

  const handleSimulatePay = (reqId: string) => {
    setSimulatingId(reqId);
    window.setTimeout(() => {
      const tx = simulatePayRequest(
        reqId,
        `${requestCurrency} Instant Omnichannel Pay-In`
      );
      setSimulatingId(null);
      if (tx) {
        setActiveReceiptTx(tx);
        if (activeCreatedRequest?.id === reqId) {
          setActiveCreatedRequest((prev) =>
            prev ? { ...prev, status: "DISBURSED", txId: tx.id } : null
          );
        }
      }
    }, 900);
  };

  const handleSimulateDirectInbound = () => {
    if (amount <= 0 || directSimulating) return;
    setDirectSimulating(true);
    window.setTimeout(() => {
      const tx = simulateDirectDeposit({
        currency: requestCurrency,
        amount,
        senderName: `${CURRENCIES[requestCurrency].depositInfo.provider} Sender`,
      });
      setDirectSimulating(false);
      setActiveReceiptTx(tx);
    }, 850);
  };

  const copyToClipboard = (label: string, text: string) => {
    navigator.clipboard?.writeText(text);
    pushToast(`${label} copied`, text, "info");
  };

  const depositMeta = CURRENCIES[requestCurrency];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B24]">
            Omnichannel Pay-In & Invoicing
          </span>
          <h1 className="font-outfit text-3xl font-bold text-[#0F141A] mt-1">
            Receive Money & Select Currency
          </h1>
          <p className="text-sm text-[#525B68] mt-1">
            Accept local Fiat or Stablecoins via QRIS, Virtual Accounts, PayNow,
            or Smart Payment Links.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex p-1 rounded-full bg-white border border-[#DCE0D4] w-fit">
          <button
            type="button"
            onClick={() => setMode("request")}
            className={`px-4 py-2 rounded-full text-xs font-outfit font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "request"
                ? "bg-[#0B3B24] text-[#93E937]"
                : "text-[#525B68] hover:text-[#0F141A]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Payment Link & QR
          </button>
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`px-4 py-2 rounded-full text-xs font-outfit font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "direct"
                ? "bg-[#0B3B24] text-[#93E937]"
                : "text-[#525B68] hover:text-[#0F141A]"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Direct Deposit Account
          </button>
        </div>
      </div>

      {/* Quick Currency Pill Bar */}
      <div className="bg-white rounded-[22px] p-4 border border-[#DCE0D4] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#525B68]">
            Select Currency to Receive
          </span>
          <span className="font-mono text-xs text-[#0B3B24] font-semibold">
            Current {requestCurrency} Balance:{" "}
            {formatCurrency(balances[requestCurrency] ?? 0, requestCurrency)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_CURRENCY_CHIPS.map((code) => {
            const active = code === requestCurrency;
            const c = CURRENCIES[code];
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectReceiveCurrency(code)}
                className={`px-3.5 py-2 rounded-full text-xs font-outfit font-bold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                  active
                    ? "bg-[#0B3B24] text-[#93E937] border-[#0B3B24] shadow-xs"
                    : "bg-[#F6F7F2] text-[#0F141A] border-[#DCE0D4] hover:border-[#0B3B24]"
                }`}
              >
                <span>{c.flag}</span>
                <span>{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === "request" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Configure Request */}
          <form
            onSubmit={handleGenerateRequest}
            className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-2xs space-y-5"
          >
            <h2 className="font-outfit text-lg font-bold text-[#0F141A]">
              Create Multi-Currency Payment Request
            </h2>

            {/* Request Amount & Currency */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] focus-within:border-[#0B3B24]">
              <div className="flex justify-between text-xs font-semibold text-[#525B68] mb-2">
                <span>Request Amount (Client Sees)</span>
                <span>{depositMeta.rail}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-transparent font-outfit text-3xl font-bold text-[#0F141A] outline-none"
                  placeholder="0.00"
                />
                <CurrencyPickerButton
                  value={requestCurrency}
                  onChange={handleSelectReceiveCurrency}
                  title="Select Billing Currency"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#DCE0D4]/70">
                {depositMeta.quickAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#93E937]/30 border border-[#DCE0D4] font-mono text-[11px] font-semibold cursor-pointer"
                  >
                    {formatCurrency(preset, requestCurrency, { compact: true })}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Auto-Settlement Currency */}
            <div className="p-4 rounded-2xl border border-[#DCE0D4] bg-white space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-outfit font-bold text-sm text-[#0F141A] block">
                    Auto-Convert Incoming Payment to Another Currency
                  </span>
                  <span className="text-xs text-[#525B68]">
                    e.g., Bill client in USD or SGD, receive IDR or USDC in your
                    wallet
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoConvert}
                  onChange={(e) => setAutoConvert(e.target.checked)}
                  className="w-5 h-5 accent-[#0B3B24] cursor-pointer"
                />
              </label>

              {autoConvert && (
                <div className="pt-3 border-t border-[#F0F2EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#525B68]">
                      Credited to your{" "}
                      <strong>{effectiveSettleCurrency}</strong> wallet:
                    </p>
                    <p className="font-outfit text-xl font-bold text-[#0B3B24]">
                      {formatCurrency(
                        estimatedSettled,
                        effectiveSettleCurrency
                      )}
                    </p>
                    <p className="font-mono text-[11px] text-[#8E98A8]">
                      {formatRatePair(requestCurrency, effectiveSettleCurrency)}
                    </p>
                  </div>
                  <CurrencyPickerButton
                    value={settleCurrency}
                    onChange={setSettleCurrency}
                    title="Select Settlement Wallet Currency"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#525B68] mb-1">
                  Client / Payer Name
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE0D4] focus:bg-white focus:border-[#0B3B24] text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525B68] mb-1">
                  Invoice / Item Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE0D4] focus:bg-white focus:border-[#0B3B24] text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] font-outfit font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              Generate Shareable Payment Link & QR
            </button>
          </form>

          {/* Right Panel: Live QR Preview & Simulator */}
          <div className="lg:col-span-5 bg-[#14171A] text-white rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xl space-y-5">
            {activeCreatedRequest ? (
              <motion.div
                key={activeCreatedRequest.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 text-center"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#93E937] font-bold">
                    {activeCreatedRequest.reference}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      activeCreatedRequest.status === "DISBURSED"
                        ? "bg-[#93E937] text-[#0B3B24]"
                        : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                    }`}
                  >
                    {activeCreatedRequest.status}
                  </span>
                </div>

                <QrCodeMatrix
                  value={`https://seafi.app/pay/${activeCreatedRequest.id}?c=${activeCreatedRequest.requestCurrency}&a=${activeCreatedRequest.requestAmount}`}
                  size={176}
                  label={`Scan via QRIS / PayNow / SEAFI Wallet`}
                />

                <div>
                  <p className="text-xs text-white/65">
                    Request for {activeCreatedRequest.payerName}
                  </p>
                  <h3 className="font-outfit text-3xl font-extrabold text-white mt-0.5">
                    {formatCurrency(
                      activeCreatedRequest.requestAmount,
                      activeCreatedRequest.requestCurrency
                    )}
                  </h3>
                  {activeCreatedRequest.requestCurrency !==
                    activeCreatedRequest.settleCurrency && (
                    <p className="text-xs text-[#93E937] font-mono mt-1">
                      Auto-settles as{" "}
                      {formatCurrency(
                        activeCreatedRequest.settledAmount,
                        activeCreatedRequest.settleCurrency
                      )}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "Payment Link",
                        `${window.location.origin}/pay/${activeCreatedRequest.id}`
                      )
                    }
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-outfit font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <Link
                    href={`/pay/${activeCreatedRequest.id}`}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-outfit font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#93E937]" />
                    Open Payer View
                  </Link>
                </div>

                {activeCreatedRequest.status !== "DISBURSED" ? (
                  <button
                    type="button"
                    disabled={simulatingId === activeCreatedRequest.id}
                    onClick={() => handleSimulatePay(activeCreatedRequest.id)}
                    className="w-full py-3.5 rounded-full bg-[#93E937] hover:bg-[#a6f450] text-[#0B3B24] font-outfit font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(147,233,55,0.35)] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {simulatingId === activeCreatedRequest.id
                      ? "Confirming Payment & Settling..."
                      : "Simulate Client Paying Now"}
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#93E937]/15 border border-[#93E937]/40 text-xs text-[#93E937] font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Paid & Credited to {activeCreatedRequest.settleCurrency}{" "}
                    Wallet!
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-5 text-center py-4">
                <QrCodeMatrix
                  value={`seafi-preview:${requestCurrency}:${amount}`}
                  size={172}
                  label={`Live Preview • ${requestCurrency} QR`}
                />
                <div className="space-y-1">
                  <p className="font-outfit text-xl font-bold">
                    {formatCurrency(amount, requestCurrency)}
                  </p>
                  <p className="text-xs text-white/65 max-w-xs mx-auto">
                    Click <strong>Generate Shareable Payment Link & QR</strong>{" "}
                    to create an interactive checkout link and test live client
                    settlement.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Direct Multi-Currency Account & QR Deposit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-outfit text-xl font-bold text-[#0F141A]">
                  {depositMeta.flag} Dedicated {requestCurrency} Deposit Details
                </h2>
                <p className="text-xs text-[#525B68] mt-0.5">
                  {depositMeta.depositInfo.provider}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#93E937]/25 text-[#0B3B24] font-mono text-xs font-bold">
                0% Inbound Fee
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#525B68] block">
                    {depositMeta.depositInfo.accountLabel}
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#0F141A] break-all">
                    {depositMeta.depositInfo.accountValue}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      depositMeta.depositInfo.accountLabel,
                      depositMeta.depositInfo.accountValue
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#0B3B24] text-[#0F141A] hover:text-[#93E937] border border-[#DCE0D4] text-xs font-outfit font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>

              <div className="pt-3 border-t border-[#DCE0D4] flex justify-between text-xs">
                <span className="text-[#525B68]">
                  {depositMeta.depositInfo.secondaryLabel}
                </span>
                <span className="font-semibold text-[#0B3B24] text-right">
                  {depositMeta.depositInfo.secondaryValue}
                </span>
              </div>
            </div>

            {/* Interactive Direct Deposit Simulator */}
            <div className="p-5 rounded-2xl bg-[#0B3B24] text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#93E937]">
                  Interactive Inbound Deposit Simulator
                </span>
                <Sparkles className="w-4 h-4 text-[#93E937]" />
              </div>
              <p className="text-xs text-white/80">
                Test receiving funds directly into your{" "}
                <strong>{requestCurrency}</strong> wallet during your live demo:
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 font-outfit text-xl font-bold text-white outline-none focus:border-[#93E937]"
                />
                <button
                  type="button"
                  disabled={directSimulating || amount <= 0}
                  onClick={handleSimulateDirectInbound}
                  className="px-6 py-3 rounded-xl bg-[#93E937] hover:bg-[#a6f450] text-[#0B3B24] font-outfit font-extrabold text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  {directSimulating
                    ? "Crediting..."
                    : `Simulate +${formatCurrency(amount, requestCurrency, { compact: true })}`}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] text-center space-y-4">
            <QrCodeMatrix
              value={`${requestCurrency}:${depositMeta.depositInfo.accountValue}`}
              size={190}
              label={`${requestCurrency} Instant Deposit QR`}
            />
            <p className="text-xs text-[#525B68]">
              Scan with any supported banking app, e-Wallet, or ERC-4337 wallet
              to deposit <strong>{requestCurrency}</strong> directly.
            </p>
          </div>
        </div>
      )}

      {/* Existing Payment Requests Table */}
      <section className="bg-white rounded-[24px] p-6 border border-[#DCE0D4] space-y-4">
        <h3 className="font-outfit text-lg font-bold text-[#0F141A]">
          Generated Payment Requests & Invoices
        </h3>
        <div className="divide-y divide-[#F0F2EA]">
          {paymentRequests.map((req) => (
            <div
              key={req.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0B3B24]">
                    {req.reference}
                  </span>
                  <span className="font-outfit font-bold text-sm text-[#0F141A]">
                    {req.payerName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === "DISBURSED"
                        ? "bg-[#93E937]/30 text-[#0B3B24]"
                        : "bg-[#F59E0B]/15 text-[#F59E0B]"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-[#525B68] mt-0.5">
                  {req.description} • Created {req.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right mr-2">
                  <p className="font-mono text-sm font-bold text-[#0F141A]">
                    {formatCurrency(req.requestAmount, req.requestCurrency)}
                  </p>
                  {req.requestCurrency !== req.settleCurrency && (
                    <p className="text-[11px] text-[#0B3B24] font-mono">
                      ➔ {formatCurrency(req.settledAmount, req.settleCurrency)}
                    </p>
                  )}
                </div>

                <Link
                  href={`/pay/${req.id}`}
                  className="px-3 py-1.5 rounded-full border border-[#DCE0D4] hover:border-[#0B3B24] text-xs font-outfit font-semibold text-[#0F141A]"
                >
                  Payer View
                </Link>

                {req.status !== "DISBURSED" ? (
                  <button
                    type="button"
                    disabled={simulatingId === req.id}
                    onClick={() => handleSimulatePay(req.id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] text-xs font-outfit font-bold transition-colors cursor-pointer"
                  >
                    {simulatingId === req.id ? "Settling..." : "Simulate Pay"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3B24]">
                    <FileCheck2 className="w-4 h-4" />
                    Settled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ReceivePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-outfit text-sm text-[#525B68]">
          Loading Receive Suite...
        </div>
      }
    >
      <ReceiveFlowContent />
    </Suspense>
  );
}
