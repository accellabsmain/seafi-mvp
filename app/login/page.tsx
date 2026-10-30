"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { type DemoPersona, type DemoUser, useDemo } from "@/context/DemoContext";

const AUTH_STEPS = [
  "Verifying Passkey / Vault Credentials...",
  "Provisioning ERC-4337 Zero-Gas Smart Account...",
  "Binding CANB EIP-712 Session Nonce...",
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const { signIn } = useDemo();

  const [persona, setPersona] = useState<DemoPersona>("personal");
  const [name, setName] = useState("Arka Pratama");
  const [email, setEmail] = useState("arka@nusantara.studio");
  const [password, setPassword] = useState("seafi-demo-2026");
  const [showPassword, setShowPassword] = useState(false);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const handleSelectPersona = (nextPersona: DemoPersona) => {
    setPersona(nextPersona);
    if (nextPersona === "enterprise") {
      setName("Bianca Taylor");
      setEmail("treasury@seafi-global.io");
    } else {
      setName("Arka Pratama");
      setEmail("arka@nusantara.studio");
    }
  };

  const triggerLoginFlow = (authMethod: DemoUser["authMethod"]) => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setStepIdx(0);

    window.setTimeout(() => setStepIdx(1), 420);
    window.setTimeout(() => setStepIdx(2), 860);
    window.setTimeout(() => {
      signIn({
        name,
        email,
        persona,
        authMethod,
      });
      router.push(nextUrl);
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F2] flex flex-col lg:flex-row">
      {/* Left Brand & CANB Showcase */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0B3B24] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #93E937 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#93E937] text-[#0B3B24] flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-outfit text-2xl font-extrabold tracking-tight">
                SEAFI
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#93E937] font-bold">
                Interactive Demo Vault
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 my-auto py-12">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-[#93E937]/30 flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-[#93E937]" />
          </div>
          <h1 className="font-outfit text-4xl font-bold leading-tight">
            Invisible Web3 UX.
            <br />
            <span className="text-[#93E937]">Swiss Banking Trust.</span>
          </h1>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            No MetaMask popups, no seed phrases, and zero gas fees. SEAFI
            provisions an ERC-4337 Smart Account protected by our CANB
            4-Layer Replay Defense Engine the moment you sign in.
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              "Pre-loaded with $14,000+ multi-currency demo liquidity",
              "Instant Transfer across 10 ASEAN & Global currencies",
              "Live QRIS, BI-FAST, PayNow & Stablecoin On/Off-Ramp",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-xs text-white/90"
              >
                <CheckCircle2 className="w-4 h-4 text-[#93E937] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#052315] border border-white/10 w-fit font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-[#93E937] animate-pulse" />
          <span>CANB Security Engine • Online</span>
        </div>
      </div>

      {/* Right Interactive Sign-In Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-10 bg-white lg:bg-[#F6F7F2]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 border border-[#DCE0D4] shadow-[0_24px_60px_rgba(0,0,0,0.06)] space-y-6"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="lg:hidden inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B3B24] text-[#93E937] flex items-center justify-center">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="font-outfit font-bold text-xl">SEAFI</span>
            </Link>
            <span className="px-3 py-1 rounded-full bg-[#93E937]/25 border border-[#93E937] text-[#0B3B24] font-mono text-[11px] font-bold">
              DEMO SIGN IN
            </span>
          </div>

          <div>
            <h2 className="font-outfit text-2xl font-bold text-[#0F141A]">
              Sign In to SEAFI OS
            </h2>
            <p className="text-sm text-[#525B68] mt-1">
              Choose a demo persona or customize your account name below.
            </p>
          </div>

          {/* Demo Persona Selector */}
          <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-[#F6F7F2] border border-[#DCE0D4]">
            <button
              type="button"
              onClick={() => handleSelectPersona("personal")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-outfit font-bold transition-all cursor-pointer ${
                persona === "personal"
                  ? "bg-[#0B3B24] text-[#93E937] shadow-xs"
                  : "text-[#525B68] hover:text-[#0F141A]"
              }`}
            >
              <User className="w-4 h-4" />
              Freelancer / C2C
            </button>
            <button
              type="button"
              onClick={() => handleSelectPersona("enterprise")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-outfit font-bold transition-all cursor-pointer ${
                persona === "enterprise"
                  ? "bg-[#0B3B24] text-[#93E937] shadow-xs"
                  : "text-[#525B68] hover:text-[#0F141A]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Enterprise / B2B
            </button>
          </div>

          {/* 1-Click Passwordless Smart Wallet Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={() => triggerLoginFlow("Passkey (ERC-4337)")}
              className="py-3 px-4 rounded-xl bg-[#0B3B24] hover:bg-[#052315] text-white font-outfit font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <Fingerprint className="w-4 h-4 text-[#93E937]" />
              Sign In with Passkey
            </button>
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={() => triggerLoginFlow("Google Smart Auth")}
              className="py-3 px-4 rounded-xl bg-[#F6F7F2] hover:bg-[#E8EAE0] border border-[#DCE0D4] text-[#0F141A] font-outfit font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <span className="font-bold text-sm text-[#0B3B24]">G</span>
              Continue with Google
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#DCE0D4] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-[#8E98A8] shrink-0">
              or email vault login
            </span>
            <div className="border-t border-[#DCE0D4] w-full" />
          </div>

          {/* Email & Password Form */}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              triggerLoginFlow("Email Vault");
            }}
          >
            <div>
              <label
                htmlFor="demo-name"
                className="block text-xs font-semibold text-[#525B68] mb-1.5"
              >
                Display Name
              </label>
              <input
                id="demo-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE0D4] focus:border-[#0B3B24] focus:bg-white text-sm text-[#0F141A] outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="demo-email"
                className="block text-xs font-semibold text-[#525B68] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="demo-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE0D4] focus:border-[#0B3B24] focus:bg-white text-sm text-[#0F141A] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="demo-password"
                className="block text-xs font-semibold text-[#525B68] mb-1.5"
              >
                Vault Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="demo-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE0D4] focus:border-[#0B3B24] focus:bg-white text-sm text-[#0F141A] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E98A8] hover:text-[#0F141A] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isAuthenticating ? (
                <motion.div
                  key="auth-progress"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-[#14171A] text-white space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-[#93E937] border-t-transparent animate-spin shrink-0" />
                    <span className="font-mono text-xs text-[#93E937]">
                      {AUTH_STEPS[stepIdx]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#93E937]"
                      initial={{ width: "15%" }}
                      animate={{ width: `${((stepIdx + 1) / 3) * 100}%` }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </motion.div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] font-outfit font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(147,233,55,0.35)] transition-all cursor-pointer"
                >
                  Sign In & Launch Vault
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F7F2] flex items-center justify-center text-sm font-outfit">
          Loading Sign-In...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
