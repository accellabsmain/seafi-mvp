"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  QrCode,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import QrCodeMatrix from "@/components/QrCodeMatrix";
import { useDemo } from "@/context/DemoContext";
import {
  convertCurrency,
  type CurrencyCode,
  formatCurrency,
} from "@/lib/currencies";

export default function PublicPayerCheckoutPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const {
    user,
    paymentRequests,
    simulatePayRequest,
    transactions,
    setActiveReceiptTx,
  } = useDemo();

  const request = paymentRequests.find((r) => r.id === requestId);

  const [payTab, setPayTab] = useState<"local" | "crypto" | "card">("local");
  const [selectedCrypto, setSelectedCrypto] = useState<CurrencyCode>("USDC");
  const [selectedChain, setSelectedChain] = useState("Base (Fee < $0.01)");
  const [countdown, setCountdown] = useState(895);
  const [step, setStep] = useState<"idle" | "verifying" | "done">("idle");

  useEffect(() => {
    const t = window.setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : 895));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F6F7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-[28px] p-8 border border-[#DCE0D4] max-w-md w-full text-center space-y-4">
          <h1 className="font-outfit text-2xl font-bold text-[#0F141A]">
            Invoice Not Found
          </h1>
          <p className="text-sm text-[#525B68]">
            Create a new payment link in the Receive tab to preview client
            checkout.
          </p>
          <Link href="/dashboard/receive" className="btn-primary">
            Back to Receive Suite
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = request.status === "DISBURSED" || step === "done";
  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");

  const cryptoEquivalent = convertCurrency(
    request.requestAmount,
    request.requestCurrency,
    selectedCrypto
  );

  const handleCompletePayment = () => {
    if (isPaid || step === "verifying") return;
    setStep("verifying");

    const methodDesc =
      payTab === "crypto"
        ? `${selectedCrypto} via ${selectedChain}`
        : payTab === "card"
          ? "Corporate Visa •••• 4242"
          : `Instant Local Rail (${request.requestCurrency} QR / Transfer)`;

    window.setTimeout(() => {
      const tx = simulatePayRequest(request.id, methodDesc);
      setStep("done");
      if (tx) {
        setActiveReceiptTx(tx);
      }
    }, 1250);
  };

  const linkedTx = request.txId
    ? transactions.find((t) => t.id === request.txId)
    : null;

  return (
    <div className="min-h-screen bg-[#F6F7F2] py-8 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/receive"
            className="inline-flex items-center gap-2 text-xs font-outfit font-bold text-[#0B3B24] bg-white px-3.5 py-2 rounded-full border border-[#DCE0D4] hover:border-[#0B3B24]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Merchant Dashboard
          </Link>
          <div className="inline-flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#0B3B24] text-[#93E937] flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-outfit font-extrabold text-base">
              SEAFI Checkout
            </span>
          </div>
        </div>

        {/* Invoice Header Card */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#525B68]">
                Payable to {user.company}
              </span>
              <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold text-[#0F141A] mt-1">
                {formatCurrency(request.requestAmount, request.requestCurrency)}
              </h1>
              <p className="text-xs text-[#525B68] mt-1">
                {request.reference} • Billed to{" "}
                <strong>{request.payerName}</strong>
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-outfit font-bold ${
                isPaid
                  ? "bg-[#0B3B24] text-[#93E937]"
                  : step === "verifying"
                    ? "bg-[#93E937] text-[#0B3B24]"
                    : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
              }`}
            >
              {isPaid
                ? "DISBURSED"
                : step === "verifying"
                  ? "CONFIRMING..."
                  : "PENDING"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] flex items-center justify-between text-xs">
            <span className="text-[#525B68]">{request.description}</span>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-[#0B3B24] shrink-0">
              <Clock className="w-3.5 h-3.5" />
              Rate Lock {mins}:{secs}
            </span>
          </div>

          {isPaid ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-[#93E937]/20 border border-[#93E937] text-center space-y-3"
            >
              <CheckCircle2 className="w-12 h-12 text-[#0B3B24] mx-auto" />
              <h2 className="font-outfit text-2xl font-bold text-[#0F141A]">
                Payment Confirmed & Settled!
              </h2>
              <p className="text-xs text-[#525B68]">
                Merchant received{" "}
                <strong>
                  {formatCurrency(request.settledAmount, request.settleCurrency)}
                </strong>{" "}
                in their SEAFI {request.settleCurrency} wallet.
              </p>
              {linkedTx && (
                <button
                  type="button"
                  onClick={() => setActiveReceiptTx(linkedTx)}
                  className="px-5 py-2.5 rounded-full bg-[#0B3B24] text-[#93E937] font-outfit font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  View Official Digital Kwitansi
                </button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4]">
                {[
                  { id: "local", label: "QRIS / Bank", icon: QrCode },
                  { id: "crypto", label: "Stablecoin", icon: Wallet },
                  { id: "card", label: "Card", icon: CreditCard },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPayTab(t.id as typeof payTab)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-outfit font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        payTab === t.id
                          ? "bg-[#0B3B24] text-[#93E937]"
                          : "text-[#525B68]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {payTab === "local" && (
                <div className="text-center space-y-3 py-2">
                  <QrCodeMatrix
                    value={`pay-local:${request.id}:${request.requestCurrency}`}
                    size={168}
                    label="Scan via QRIS / PayNow / Mobile Banking"
                  />
                </div>
              )}

              {payTab === "crypto" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(["USDC", "USDT", "IDRX"] as CurrencyCode[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCrypto(c)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-outfit font-bold cursor-pointer ${
                          selectedCrypto === c
                            ? "bg-[#93E937]/25 border-[#0B3B24] text-[#0B3B24]"
                            : "bg-[#F6F7F2] border-[#DCE0D4] text-[#525B68]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Base (Fee < $0.01)",
                      "Arbitrum One",
                      "Lisk L2",
                      "Polygon POS",
                    ].map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setSelectedChain(net)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left cursor-pointer ${
                          selectedChain === net
                            ? "border-[#0B3B24] bg-[#F6F7F2] font-bold"
                            : "border-[#DCE0D4] text-[#525B68]"
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#14171A] text-white flex justify-between items-center text-xs">
                    <span className="text-white/70">Exact Crypto Amount</span>
                    <span className="font-mono text-base font-bold text-[#93E937]">
                      {formatCurrency(cryptoEquivalent, selectedCrypto)}
                    </span>
                  </div>
                </div>
              )}

              {payTab === "card" && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4]">
                  <input
                    type="text"
                    readOnly
                    value="4242 •••• •••• 4242 (Demo Corporate Visa)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE0D4] font-mono text-xs text-[#0F141A]"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      readOnly
                      value="09 / 29"
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE0D4] font-mono text-xs"
                    />
                    <input
                      type="text"
                      readOnly
                      value="CVC •••"
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE0D4] font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={step === "verifying"}
                onClick={handleCompletePayment}
                className="w-full py-4 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] font-outfit font-extrabold text-base transition-all shadow-md cursor-pointer"
              >
                {step === "verifying"
                  ? "Verifying on CANB Security Engine..."
                  : `Complete Demo Payment (${formatCurrency(request.requestAmount, request.requestCurrency)})`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#525B68]">
                <ShieldCheck className="w-4 h-4 text-[#0B3B24]" />
                <span>Zero Double-Spend • Instant Kwitansi Issued</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
