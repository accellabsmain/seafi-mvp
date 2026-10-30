"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  Clock,
  Coins,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/currencies";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    shortLabel: "Home",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: "/dashboard/transfer",
    label: "Transfer Money",
    shortLabel: "Transfer",
    icon: Send,
    badge: "FX Live",
  },
  {
    href: "/dashboard/receive",
    label: "Receive & Request",
    shortLabel: "Receive",
    icon: ArrowDownLeft,
    badge: "10 Currencies",
  },
  {
    href: "/dashboard/ramp",
    label: "On-Ramp / Off-Ramp",
    shortLabel: "Ramp",
    icon: ArrowRightLeft,
    badge: "Fiat ⇄ Crypto",
  },
  {
    href: "/dashboard/activity",
    label: "Activity & Kwitansi",
    shortLabel: "Activity",
    icon: Clock,
    badge: null,
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    hydrated,
    isAuthenticated,
    user,
    signIn,
    signOut,
    switchPersona,
    topUpDemoBalances,
    resetDemo,
    totalPortfolioInDisplayCurrency,
    displayCurrency,
    hideBalances,
    paymentRequests,
  } = useDemo();

  const pendingCount = paymentRequests.filter(
    (r) => r.status === "PENDING"
  ).length;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#F6F7F2] flex items-center justify-center">
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-[#DCE0D4] shadow-sm">
          <div className="w-5 h-5 rounded-full border-2 border-[#0B3B24] border-t-transparent animate-spin" />
          <span className="font-outfit font-semibold text-sm text-[#0B3B24]">
            Loading SEAFI Interactive Vault...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6F7F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 border border-[#DCE0D4] shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#0B3B24] text-[#93E937] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-outfit text-2xl font-bold text-[#0F141A]">
              Sign In to Access SEAFI Demo
            </h2>
            <p className="text-sm text-[#525B68] mt-1.5">
              Start from the full Sign-In screen or enter immediately with a
              pre-funded Smart Account.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-full bg-[#93E937] hover:bg-[#0B3B24] text-[#0B3B24] hover:text-[#93E937] font-outfit font-bold text-sm transition-all"
            >
              Go to Interactive Sign-In Page
            </Link>
            <button
              type="button"
              onClick={() => signIn({ persona: "personal" })}
              className="w-full py-3 rounded-full bg-[#F6F7F2] hover:bg-[#E8EAE0] text-[#0F141A] font-outfit font-semibold text-sm border border-[#DCE0D4] transition-all cursor-pointer"
            >
              1-Click Instant Demo Sign-In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F2] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#DCE0D4] z-40 justify-between">
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#0B3B24] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-[#93E937] fill-[#93E937]" />
              </div>
              <div className="leading-none">
                <span className="font-outfit text-2xl font-extrabold tracking-tight text-[#0F141A]">
                  SEA<span className="text-[#0B3B24]">FI</span>
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#0B3B24] mt-0.5">
                  Interactive MVP
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-[#93E937]/25 border border-[#93E937] text-[#0B3B24] font-mono text-[10px] font-bold">
              v2.0
            </span>
          </div>

          {/* Mini Portfolio Pill */}
          <div className="p-4 rounded-2xl bg-[#14171A] text-white border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-white/60 font-medium">
              <span>Consolidated Vault</span>
              <span className="text-[#93E937] font-mono">{displayCurrency}</span>
            </div>
            <p className="font-outfit text-xl font-bold mt-1">
              {hideBalances
                ? "••••••••"
                : formatCurrency(
                    totalPortfolioInDisplayCurrency,
                    displayCurrency
                  )}
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-white/60 font-mono">{user.smartWallet}</span>
              <span className="inline-flex items-center gap-1 text-[#93E937] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#93E937] animate-pulse" />
                Gas $0
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-2xl font-outfit text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#0B3B24] text-white shadow-sm"
                      : "text-[#525B68] hover:bg-[#F6F7F2] hover:text-[#0F141A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-[#93E937]" : "text-[#525B68]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.href === "/dashboard/receive" && pendingCount > 0 ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-[#93E937] text-[#0B3B24]"
                          : "bg-[#F59E0B]/15 text-[#F59E0B]"
                      }`}
                    >
                      {pendingCount} Pending
                    </span>
                  ) : item.badge ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        active
                          ? "bg-white/15 text-[#93E937]"
                          : "bg-[#F6F7F2] text-[#525B68]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Demo Controls & Profile */}
        <div className="p-5 border-t border-[#DCE0D4] space-y-3 bg-[#F6F7F2]/50">
          <div className="p-3 rounded-2xl bg-white border border-[#DCE0D4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#525B68]">
                Demo Controls
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#0B3B24]" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={topUpDemoBalances}
                className="py-1.5 px-2 rounded-xl bg-[#93E937]/25 hover:bg-[#93E937] text-[#0B3B24] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5" />
                Top-Up
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="py-1.5 px-2 rounded-xl bg-[#F6F7F2] hover:bg-[#E8EAE0] text-[#525B68] hover:text-[#0F141A] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="min-w-0">
              <p className="font-outfit font-bold text-sm text-[#0F141A] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#525B68] truncate">{user.company}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              title="Sign Out"
              className="w-9 h-9 rounded-full bg-white border border-[#DCE0D4] hover:border-[#F43F5E] hover:text-[#F43F5E] flex items-center justify-center text-[#525B68] transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen pb-20 lg:pb-8">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-[#F6F7F2]/85 backdrop-blur-xl border-b border-[#DCE0D4] px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B3B24] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#93E937] fill-[#93E937]" />
              </div>
              <span className="font-outfit font-bold text-lg text-[#0F141A]">
                SEAFI
              </span>
            </Link>

            {/* Persona Switcher */}
            <div className="hidden sm:inline-flex items-center p-1 rounded-full bg-white border border-[#DCE0D4]">
              <button
                type="button"
                onClick={() => switchPersona("personal")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  user.persona === "personal"
                    ? "bg-[#0B3B24] text-[#93E937]"
                    : "text-[#525B68] hover:text-[#0F141A]"
                }`}
              >
                Freelancer / C2C
              </button>
              <button
                type="button"
                onClick={() => switchPersona("enterprise")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  user.persona === "enterprise"
                    ? "bg-[#0B3B24] text-[#93E937]"
                    : "text-[#525B68] hover:text-[#0F141A]"
                }`}
              >
                Enterprise / B2B
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14171A] text-white font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#93E937] animate-pulse" />
              <span>CANB Engine: {user.canbNodeId}</span>
            </div>

            <button
              type="button"
              onClick={topUpDemoBalances}
              className="lg:hidden px-3 py-1.5 rounded-full bg-[#93E937] text-[#0B3B24] font-outfit font-bold text-xs cursor-pointer"
            >
              + Demo Funds
            </button>

            <button
              type="button"
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="lg:hidden p-2 rounded-full bg-white border border-[#DCE0D4] text-[#525B68]"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#DCE0D4] px-2 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                active ? "text-[#0B3B24] bg-[#93E937]/25" : "text-[#525B68]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
