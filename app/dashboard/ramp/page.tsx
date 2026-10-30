"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  Building2,
  CheckCircle2,
  Coins,
  FileCheck2,
  Landmark,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import CurrencyPickerButton from "@/components/CurrencySelectModal";
import QrCodeMatrix from "@/components/QrCodeMatrix";
import {
  type DemoTransaction,
  type PayoutAccount,
  useDemo,
} from "@/context/DemoContext";
import {
  convertCurrency,
  CURRENCIES,
  type CurrencyCode,
  FIAT_CODES,
  formatCurrency,
  formatRatePair,
  getOnRampMethodsForFiat,
  STABLECOIN_CODES,
} from "@/lib/currencies";

const NETWORKS = [
  "Arbitrum Stylus L2",
  "Base Mainnet",
  "Lisk L2",
  "Polygon POS",
];

function RampFlowContent() {
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "offramp" ? "offramp" : "onramp";
  const paramFiat = (searchParams.get("fiat") || "IDR") as CurrencyCode;
  const paramCrypto = (searchParams.get("crypto") || "USDC") as CurrencyCode;

  const {
    user,
    balances,
    payoutAccounts,
    addPayoutAccount,
    executeOnRamp,
    executeOffRamp,
    topUpDemoBalances,
    setActiveReceiptTx,
  } = useDemo();

  const [mode, setMode] = useState<"onramp" | "offramp">(initialMode);

  // On-Ramp State
  const [onFiat, setOnFiat] = useState<CurrencyCode>(
    FIAT_CODES.includes(paramFiat) ? paramFiat : "IDR"
  );
  const [onCrypto, setOnCrypto] = useState<CurrencyCode>(
    STABLECOIN_CODES.includes(paramCrypto) ? paramCrypto : "USDC"
  );
  const [onFiatAmount, setOnFiatAmount] = useState<number>(
    CURRENCIES[FIAT_CODES.includes(paramFiat) ? paramFiat : "IDR"]
      .quickAmounts[1]
  );
  const [onNetwork, setOnNetwork] = useState(NETWORKS[0]);
  const [deductFromFiatVault, setDeductFromFiatVault] = useState(false);

  const availableMethods = getOnRampMethodsForFiat(onFiat);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    availableMethods[0]?.id || "card_global"
  );

  useEffect(() => {
    const methods = getOnRampMethodsForFiat(onFiat);
    if (!methods.some((m) => m.id === selectedMethodId)) {
      setSelectedMethodId(methods[0]?.id || "card_global");
    }
  }, [onFiat, selectedMethodId]);

  const activeOnMethod =
    availableMethods.find((m) => m.id === selectedMethodId) ||
    availableMethods[0];

  // Off-Ramp State
  const [offCrypto, setOffCrypto] = useState<CurrencyCode>(
    STABLECOIN_CODES.includes(paramCrypto) ? paramCrypto : "USDC"
  );
  const [offFiat, setOffFiat] = useState<CurrencyCode>(
    FIAT_CODES.includes(paramFiat) ? paramFiat : "IDR"
  );
  const [offCryptoAmount, setOffCryptoAmount] = useState<number>(500);
  const [creditToFiatVault, setCreditToFiatVault] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string>(
    payoutAccounts[0]?.id || ""
  );

  // Add new bank inline modal/section
  const [addingBank, setAddingBank] = useState(false);
  const [newBankName, setNewBankName] = useState("Bank Mandiri");
  const [newBankNumber, setNewBankNumber] = useState("");
  const [newBankHolder, setNewBankHolder] = useState(user.name);

  // Interactive Checkout / Execution States
  const [showOnRampPaymentSheet, setShowOnRampPaymentSheet] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<DemoTransaction | null>(null);

  // Math: On-Ramp
  const onFee = onFiatAmount * (activeOnMethod?.feePct ?? 0.002);
  const onNetFiat = Math.max(0, onFiatAmount - onFee);
  const onCryptoReceived = convertCurrency(onNetFiat, onFiat, onCrypto);
  const onVaultInsufficient =
    deductFromFiatVault && onFiatAmount > (balances[onFiat] ?? 0);

  // Math: Off-Ramp
  const offAvailable = balances[offCrypto] ?? 0;
  const offInsufficient = offCryptoAmount > offAvailable;
  const offFee = offCryptoAmount * 0.0025; // 0.25% flat liquidity fee
  const offNetCrypto = Math.max(0, offCryptoAmount - offFee);
  const offFiatReceived = convertCurrency(offNetCrypto, offCrypto, offFiat);

  const matchingAccounts = payoutAccounts.filter((a) => a.currency === offFiat);
  const displayPayoutAccounts =
    matchingAccounts.length > 0 ? matchingAccounts : payoutAccounts;

  useEffect(() => {
    if (!displayPayoutAccounts.some((a) => a.id === selectedPayoutId)) {
      setSelectedPayoutId(displayPayoutAccounts[0]?.id || "");
    }
  }, [displayPayoutAccounts, selectedPayoutId]);

  const activePayoutAccount: PayoutAccount =
    payoutAccounts.find((a) => a.id === selectedPayoutId) || payoutAccounts[0];

  const handleCompleteOnRamp = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const tx = executeOnRamp({
        fiatCurrency: onFiat,
        fiatAmount: onFiatAmount,
        cryptoCurrency: onCrypto,
        cryptoAmount: onCryptoReceived,
        feeAmount: onFee,
        methodName: deductFromFiatVault
          ? `SEAFI ${onFiat} Vault Conversion`
          : activeOnMethod.name,
        network: onNetwork,
        deductFromFiatVault,
      });
      setProcessing(false);
      setShowOnRampPaymentSheet(false);
      setCompletedTx(tx);
    }, 1150);
  };

  const handleCompleteOffRamp = () => {
    if (offCryptoAmount <= 0 || offInsufficient || processing) return;
    setProcessing(true);

    window.setTimeout(() => {
      const tx = executeOffRamp({
        cryptoCurrency: offCrypto,
        cryptoAmount: offCryptoAmount,
        fiatCurrency: offFiat,
        fiatAmount: offFiatReceived,
        feeAmount: offFee,
        payoutAccount: activePayoutAccount,
        creditToFiatVault,
      });
      setProcessing(false);
      setCompletedTx(tx);
    }, 1450);
  };

  const handleSaveNewBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankNumber.trim()) return;
    const created = addPayoutAccount({
      label: `${offFiat} Payout Account`,
      bankOrWallet: newBankName,
      accountNumber: newBankNumber.trim(),
      accountHolder: newBankHolder.trim() || user.name,
      currency: offFiat,
      rail: CURRENCIES[offFiat].rail,
    });
    setSelectedPayoutId(created.id);
    setAddingBank(false);
    setNewBankNumber("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B24]">
            Bridge & Local Liquidation Rails
          </span>
          <h1 className="font-outfit text-3xl font-bold text-[#0F141A] mt-1">
            Fiat On-Ramp & Off-Ramp
          </h1>
          <p className="text-sm text-[#525B68] mt-1">
            Seamlessly convert between local currencies (QRIS, BI-FAST, PayNow,
            ACH) and Stablecoins (USDC, IDRX, USDT).
          </p>
        </div>

        <div className="inline-flex p-1.5 rounded-full bg-white border border-[#DCE0D4] shadow-2xs w-fit">
          <button
            type="button"
            onClick={() => {
              setMode("onramp");
              setCompletedTx(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-outfit font-bold transition-all cursor-pointer ${
              mode === "onramp"
                ? "bg-[#93E937] text-[#0B3B24] shadow-xs"
                : "text-[#525B68] hover:text-[#0F141A]"
            }`}
          >
            On-Ramp (Buy Crypto)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("offramp");
              setCompletedTx(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-outfit font-bold transition-all cursor-pointer ${
              mode === "offramp"
                ? "bg-[#0B3B24] text-[#93E937] shadow-xs"
                : "text-[#525B68] hover:text-[#0F141A]"
            }`}
          >
            Off-Ramp (Cash Out to Bank)
          </button>
        </div>
      </div>

      {/* Completed Banner */}
      <AnimatePresence mode="wait">
        {completedTx ? (
          <motion.div
            key="ramp-complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[28px] p-8 border border-[#93E937] shadow-xl max-w-2xl mx-auto text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-[#93E937] text-[#0B3B24] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(147,233,55,0.45)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#93E937]/25 text-[#0B3B24] font-mono text-xs font-bold">
                {completedTx.reference} • {completedTx.status}
              </span>
              <h2 className="font-outfit text-3xl font-extrabold text-[#0F141A] mt-3">
                {completedTx.type === "onramp"
                  ? `+${formatCurrency(completedTx.targetAmount, completedTx.targetCurrency)} Minted!`
                  : `${formatCurrency(completedTx.targetAmount, completedTx.targetCurrency)} Disbursed!`}
              </h2>
              <p className="text-sm text-[#525B68] mt-1">
                {completedTx.subtitle} via {completedTx.rail}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveReceiptTx(completedTx)}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#0B3B24] text-[#93E937] font-outfit font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                View Official Kwitansi
              </button>
              <button
                type="button"
                onClick={() => setCompletedTx(null)}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#93E937] text-[#0B3B24] font-outfit font-bold text-sm cursor-pointer"
              >
                New {mode === "onramp" ? "On-Ramp" : "Off-Ramp"} Transaction
              </button>
            </div>
          </motion.div>
        ) : mode === "onramp" ? (
          /* ================= ON-RAMP VIEW ================= */
          <motion.div
            key="onramp-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-outfit text-lg font-bold text-[#0F141A]">
                  Deposit Local Fiat ➔ Receive Stablecoin
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-[#93E937]/25 text-[#0B3B24] font-mono text-[11px] font-bold">
                  Gas $0.00
                </span>
              </div>

              {/* Pay Fiat Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] focus-within:border-[#0B3B24]">
                <div className="flex justify-between text-xs font-semibold text-[#525B68] mb-2">
                  <span>You Pay (Local Fiat)</span>
                  {deductFromFiatVault && (
                    <span className="font-mono text-[#0B3B24]">
                      Vault Balance:{" "}
                      {formatCurrency(balances[onFiat] ?? 0, onFiat)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={onFiatAmount || ""}
                    onChange={(e) => setOnFiatAmount(Number(e.target.value))}
                    className="w-full bg-transparent font-outfit text-3xl font-bold text-[#0F141A] outline-none"
                  />
                  <CurrencyPickerButton
                    value={onFiat}
                    onChange={(c) => {
                      setOnFiat(c);
                      setOnFiatAmount(CURRENCIES[c].quickAmounts[1]);
                    }}
                    allowedCodes={FIAT_CODES}
                    title="Select Fiat Currency"
                    showBalanceInModal={deductFromFiatVault}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#DCE0D4]/70">
                  {CURRENCIES[onFiat].quickAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setOnFiatAmount(preset)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#93E937]/30 border border-[#DCE0D4] font-mono text-[11px] font-semibold cursor-pointer"
                    >
                      {formatCurrency(preset, onFiat, { compact: true })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center -my-2">
                <div className="w-9 h-9 rounded-full bg-white border border-[#DCE0D4] flex items-center justify-center text-[#0B3B24] shadow-2xs">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* Receive Stablecoin Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0B3B24] text-white">
                <div className="flex justify-between text-xs font-semibold text-[#93E937] mb-2">
                  <span>You Receive in Smart Wallet</span>
                  <span>
                    Current:{" "}
                    {formatCurrency(balances[onCrypto] ?? 0, onCrypto, {
                      compact: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-outfit text-3xl font-bold truncate">
                    {formatCurrency(onCryptoReceived, onCrypto)}
                  </div>
                  <CurrencyPickerButton
                    value={onCrypto}
                    onChange={setOnCrypto}
                    allowedCodes={STABLECOIN_CODES}
                    variant="dark"
                    title="Select Stablecoin"
                  />
                </div>
              </div>

              {/* Network Selection */}
              <div>
                <span className="block text-xs font-semibold text-[#525B68] mb-2">
                  Target Settlement Network (ERC-4337 Account Abstraction)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NETWORKS.map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setOnNetwork(net)}
                      className={`py-2 px-3 rounded-xl border text-xs font-outfit font-semibold transition-all cursor-pointer ${
                        onNetwork === net
                          ? "bg-[#93E937]/25 border-[#0B3B24] text-[#0B3B24]"
                          : "bg-[#F6F7F2] border-[#DCE0D4] text-[#525B68]"
                      }`}
                    >
                      {net.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Choice */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#525B68]">
                    Payment Rail ({onFiat})
                  </span>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B3B24] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deductFromFiatVault}
                      onChange={(e) => setDeductFromFiatVault(e.target.checked)}
                      className="accent-[#0B3B24]"
                    />
                    Pay from SEAFI {onFiat} Vault
                  </label>
                </div>

                {!deductFromFiatVault && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableMethods.map((m) => {
                      const active = m.id === activeOnMethod?.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMethodId(m.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            active
                              ? "bg-[#93E937]/20 border-[#0B3B24]"
                              : "bg-[#F6F7F2]/60 border-[#DCE0D4] hover:border-[#0B3B24]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-outfit font-bold text-sm text-[#0F141A]">
                              {m.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#525B68]">
                            <span className="text-[#0B3B24] font-semibold">
                              {m.badge}
                            </span>
                            <span className="font-mono">ETA {m.eta}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quote & Interactive Checkout Sheet */}
            <div className="lg:col-span-5 bg-[#14171A] text-white rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#93E937]">
                  On-Ramp Quote
                </span>
                <span className="font-mono text-xs text-white/70">
                  {formatRatePair(onFiat, onCrypto)}
                </span>
              </div>

              <div className="space-y-3 text-sm border-y border-white/10 py-4">
                <div className="flex justify-between">
                  <span className="text-white/65">Fiat Payment</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(onFiatAmount, onFiat)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/65">Rail Fee</span>
                  <span className="font-mono">
                    {formatCurrency(onFee, onFiat)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/65">Network Gas ({onNetwork})</span>
                  <span className="font-mono text-[#93E937]">$0.00</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-white/80">Minted to Wallet</span>
                  <span className="font-outfit text-2xl font-bold text-[#93E937]">
                    {formatCurrency(onCryptoReceived, onCrypto)}
                  </span>
                </div>
              </div>

              {showOnRampPaymentSheet ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-[#93E937]/40 space-y-4 text-center">
                  <p className="text-xs text-[#93E937] font-semibold">
                    {activeOnMethod.name} • Awaiting Confirmation
                  </p>
                  <QrCodeMatrix
                    value={`onramp:${onFiat}:${onFiatAmount}:${onCrypto}`}
                    size={148}
                  />
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleCompleteOnRamp}
                    className="w-full py-3.5 rounded-full bg-[#93E937] hover:bg-[#a6f450] text-[#0B3B24] font-outfit font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {processing
                      ? "Minting Stablecoins to Smart Vault..."
                      : "Simulate Fiat Payment Completed"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={
                    onFiatAmount <= 0 || onVaultInsufficient || processing
                  }
                  onClick={() => {
                    if (deductFromFiatVault) {
                      handleCompleteOnRamp();
                    } else {
                      setShowOnRampPaymentSheet(true);
                    }
                  }}
                  className="w-full py-4 rounded-full bg-[#93E937] hover:bg-[#a6f450] disabled:opacity-40 text-[#0B3B24] font-outfit font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(147,233,55,0.35)] cursor-pointer"
                >
                  <QrCode className="w-5 h-5" />
                  {processing
                    ? "Converting Vault Balance..."
                    : deductFromFiatVault
                      ? `Convert ${onFiat} Vault to ${onCrypto}`
                      : `Proceed to ${activeOnMethod?.name || "Payment"}`}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* ================= OFF-RAMP VIEW ================= */
          <motion.div
            key="offramp-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-7 border border-[#DCE0D4] shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-outfit text-lg font-bold text-[#0F141A]">
                  Cash Out Stablecoin ➔ Local Bank / e-Wallet
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-[#0B3B24] text-[#93E937] font-mono text-[11px] font-bold">
                  Instant 24/7 Payout
                </span>
              </div>

              {/* Spend Stablecoin Box */}
              <div
                className={`p-4 sm:p-5 rounded-2xl bg-[#F6F7F2] border ${
                  offInsufficient ? "border-[#F43F5E]" : "border-[#DCE0D4]"
                }`}
              >
                <div className="flex justify-between text-xs font-semibold text-[#525B68] mb-2">
                  <span>Withdraw From Stablecoin Wallet</span>
                  <span className="font-mono text-[#0B3B24] font-bold">
                    Available: {formatCurrency(offAvailable, offCrypto)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={offCryptoAmount || ""}
                    onChange={(e) => setOffCryptoAmount(Number(e.target.value))}
                    className="w-full bg-transparent font-outfit text-3xl font-bold text-[#0F141A] outline-none"
                  />
                  <CurrencyPickerButton
                    value={offCrypto}
                    onChange={(c) => {
                      setOffCrypto(c);
                      setOffCryptoAmount(CURRENCIES[c].quickAmounts[1]);
                    }}
                    allowedCodes={STABLECOIN_CODES}
                    title="Select Stablecoin to Off-Ramp"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#DCE0D4]/70">
                  <div className="flex flex-wrap gap-1.5">
                    {CURRENCIES[offCrypto].quickAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOffCryptoAmount(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#93E937]/30 border border-[#DCE0D4] font-mono text-[11px] font-semibold cursor-pointer"
                      >
                        {formatCurrency(preset, offCrypto, { compact: true })}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOffCryptoAmount(offAvailable)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B3B24] text-[#93E937] font-mono text-[11px] font-bold cursor-pointer"
                  >
                    MAX
                  </button>
                </div>

                {offInsufficient && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#F43F5E]">
                      Exceeds {offCrypto} balance.
                    </span>
                    <button
                      type="button"
                      onClick={topUpDemoBalances}
                      className="px-3 py-1 rounded-full bg-[#0F141A] text-[#93E937] text-xs font-outfit font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Coins className="w-3 h-3" />+ Top Up Demo
                    </button>
                  </div>
                )}
              </div>

              {/* Payout Fiat Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0B3B24] text-white">
                <div className="flex justify-between text-xs font-semibold text-[#93E937] mb-2">
                  <span>Disbursed to Bank / e-Wallet</span>
                  <span>{CURRENCIES[offFiat].rail}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-outfit text-3xl font-bold truncate">
                    {formatCurrency(offFiatReceived, offFiat)}
                  </div>
                  <CurrencyPickerButton
                    value={offFiat}
                    onChange={setOffFiat}
                    allowedCodes={FIAT_CODES}
                    variant="dark"
                    title="Select Payout Currency"
                    showBalanceInModal={false}
                  />
                </div>
              </div>

              {/* Payout Bank Account Selector */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-outfit font-bold text-base text-[#0F141A]">
                    Select Destination Bank / e-Wallet
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAddingBank(!addingBank)}
                    className="inline-flex items-center gap-1 text-xs font-outfit font-bold text-[#0B3B24] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {addingBank ? "Cancel" : "Link Bank / e-Wallet"}
                  </button>
                </div>

                {addingBank && (
                  <form
                    onSubmit={handleSaveNewBank}
                    className="p-4 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4] space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        placeholder="Bank / e-Wallet (e.g. Mandiri, OVO)"
                        className="px-3 py-2 rounded-xl bg-white border border-[#DCE0D4] text-sm outline-none"
                      />
                      <input
                        type="text"
                        value={newBankNumber}
                        onChange={(e) => setNewBankNumber(e.target.value)}
                        placeholder="Account / Mobile Number"
                        required
                        className="px-3 py-2 rounded-xl bg-white border border-[#DCE0D4] text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBankHolder}
                        onChange={(e) => setNewBankHolder(e.target.value)}
                        placeholder="Account Holder Name"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DCE0D4] text-sm outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#0B3B24] text-[#93E937] text-xs font-outfit font-bold cursor-pointer"
                      >
                        Save Account
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {displayPayoutAccounts.map((acc) => {
                    const active = acc.id === activePayoutAccount?.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedPayoutId(acc.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          active
                            ? "bg-[#93E937]/20 border-[#0B3B24]"
                            : "bg-[#F6F7F2]/60 border-[#DCE0D4] hover:border-[#0B3B24]"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#0B3B24] text-[#93E937] flex items-center justify-center shrink-0 mt-0.5">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-outfit font-bold text-sm text-[#0F141A] truncate">
                            {acc.bankOrWallet}
                          </p>
                          <p className="font-mono text-xs text-[#525B68]">
                            {acc.accountNumber}
                          </p>
                          <p className="text-[11px] text-[#0B3B24] font-medium mt-0.5">
                            {acc.rail}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2.5 pt-2 text-xs text-[#525B68] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={creditToFiatVault}
                    onChange={(e) => setCreditToFiatVault(e.target.checked)}
                    className="accent-[#0B3B24]"
                  />
                  <span>
                    Also reflect payout inside my SEAFI{" "}
                    <strong>{offFiat}</strong> Fiat Vault balance (for demo
                    balance inspection)
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Off-Ramp Execution Summary */}
            <div className="lg:col-span-5 bg-[#14171A] text-white rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#93E937]">
                  Off-Ramp Settlement
                </span>
                <span className="font-mono text-xs text-white/70">
                  {formatRatePair(offCrypto, offFiat)}
                </span>
              </div>

              <div className="space-y-3 text-sm border-y border-white/10 py-4">
                <div className="flex justify-between">
                  <span className="text-white/65">Stablecoin Burn / Swap</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(offCryptoAmount, offCrypto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/65">Settlement Fee (0.25%)</span>
                  <span className="font-mono">
                    -{formatCurrency(offFee, offCrypto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/65">Destination</span>
                  <span className="font-semibold text-right">
                    {activePayoutAccount?.bankOrWallet}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-white/80">Bank Payout</span>
                  <span className="font-outfit text-2xl font-bold text-[#93E937]">
                    {formatCurrency(offFiatReceived, offFiat)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-white/75">
                <ShieldCheck className="w-4 h-4 text-[#93E937] shrink-0" />
                <span>
                  24/7 Real-Time Disbursal via {CURRENCIES[offFiat].rail}
                </span>
              </div>

              <button
                type="button"
                disabled={offCryptoAmount <= 0 || offInsufficient || processing}
                onClick={handleCompleteOffRamp}
                className="w-full py-4 rounded-full bg-[#93E937] hover:bg-[#a6f450] disabled:opacity-40 text-[#0B3B24] font-outfit font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(147,233,55,0.35)] cursor-pointer"
              >
                <Building2 className="w-5 h-5" />
                {processing
                  ? "Disbursing via Local Bank Rail..."
                  : `Cash Out ${formatCurrency(offFiatReceived, offFiat, { compact: true })}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RampPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-outfit text-sm text-[#525B68]">
          Loading On-Ramp / Off-Ramp Engine...
        </div>
      }
    >
      <RampFlowContent />
    </Suspense>
  );
}
