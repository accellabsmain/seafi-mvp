"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ALL_CURRENCY_CODES,
  convertCurrency,
  CURRENCIES,
  type CurrencyCode,
  formatCurrency,
} from "@/lib/currencies";

export type DemoPersona = "personal" | "enterprise";

export interface DemoUser {
  name: string;
  email: string;
  company: string;
  persona: DemoPersona;
  smartWallet: string;
  canbNodeId: string;
  authMethod: "Passkey (ERC-4337)" | "Google Smart Auth" | "Email Vault";
}

export interface SavedRecipient {
  id: string;
  name: string;
  handleOrAccount: string;
  institution: string;
  country: string;
  preferredCurrency: CurrencyCode;
  avatar: string;
}

export interface PayoutAccount {
  id: string;
  label: string;
  bankOrWallet: string;
  accountNumber: string;
  accountHolder: string;
  currency: CurrencyCode;
  rail: string;
}

export interface CanbProof {
  domainHash: string;
  nonceBindingId: string;
  txHash: string;
  network: string;
  settlementMs: number;
}

export type TransactionType = "transfer" | "receive" | "onramp" | "offramp";

export interface DemoTransaction {
  id: string;
  reference: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  counterparty: string;
  rail: string;
  sourceAmount: number;
  sourceCurrency: CurrencyCode;
  targetAmount: number;
  targetCurrency: CurrencyCode;
  feeAmount: number;
  feeCurrency: CurrencyCode;
  status: "SETTLED" | "DISBURSED";
  createdAt: string;
  note?: string;
  canbProof: CanbProof;
}

export interface PaymentRequestItem {
  id: string;
  reference: string;
  payerName: string;
  description: string;
  requestAmount: number;
  requestCurrency: CurrencyCode;
  settleCurrency: CurrencyCode;
  settledAmount: number;
  status: "PENDING" | "PAID" | "DISBURSED";
  createdAt: string;
  paidVia?: string;
  txId?: string;
}

export interface DemoToast {
  id: string;
  title: string;
  description?: string;
  tone: "success" | "info" | "warning";
}

interface DemoPersistedState {
  isAuthenticated: boolean;
  user: DemoUser;
  displayCurrency: CurrencyCode;
  hideBalances: boolean;
  balances: Record<CurrencyCode, number>;
  recipients: SavedRecipient[];
  payoutAccounts: PayoutAccount[];
  transactions: DemoTransaction[];
  paymentRequests: PaymentRequestItem[];
}

const STORAGE_KEY = "seafi_interactive_mvp_v1";

function randomHex(len: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function createCanbProof(network = "Arbitrum Stylus L2"): CanbProof {
  return {
    domainHash: `0x712f${randomHex(12)}...${randomHex(6)}`,
    nonceBindingId: `CANB-${Math.floor(100000 + Math.random() * 900000)}`,
    txHash: `0x${randomHex(16)}...${randomHex(8)}`,
    network,
    settlementMs: Math.floor(1150 + Math.random() * 1400),
  };
}

const INITIAL_USER: DemoUser = {
  name: "Arka Pratama",
  email: "arka@nusantara.studio",
  company: "Nusantara Digital Studio",
  persona: "personal",
  smartWallet: "0x84Fe...cA2c",
  canbNodeId: "0x9f4e...4a2c",
  authMethod: "Passkey (ERC-4337)",
};

const ENTERPRISE_USER: DemoUser = {
  name: "Bianca Taylor",
  email: "treasury@seafi-global.io",
  company: "Apex Pacific Holdings Pte Ltd",
  persona: "enterprise",
  smartWallet: "0x31Ab...90Ef",
  canbNodeId: "0x7c12...88b1",
  authMethod: "Passkey (ERC-4337)",
};

const INITIAL_BALANCES: Record<CurrencyCode, number> = {
  USDC: 4850.0,
  IDRX: 32500000,
  USDT: 1420.0,
  IDR: 24750000,
  USD: 2400.0,
  SGD: 1850.0,
  MYR: 1500.0,
  PHP: 18500.0,
  THB: 12000.0,
  EUR: 650.0,
};

const INITIAL_RECIPIENTS: SavedRecipient[] = [
  {
    id: "rec-1",
    name: "PT Kreasi Nusantara",
    handleOrAccount: "BCA • 8820 4910 22",
    institution: "Bank Central Asia (BI-FAST)",
    country: "Indonesia",
    preferredCurrency: "IDR",
    avatar: "KN",
  },
  {
    id: "rec-2",
    name: "Nexus Cloud Pte Ltd",
    handleOrAccount: "PayNow • UEN 20240912K",
    institution: "DBS Bank Singapore",
    country: "Singapore",
    preferredCurrency: "SGD",
    avatar: "NC",
  },
  {
    id: "rec-3",
    name: "Maria Clara Santos",
    handleOrAccount: "GCash • +63 917 840 2219",
    institution: "GCash / InstaPay",
    country: "Philippines",
    preferredCurrency: "PHP",
    avatar: "MS",
  },
  {
    id: "rec-4",
    name: "Studio Kinetik KL",
    handleOrAccount: "DuitNow • 5140 8922 1104",
    institution: "Maybank Malaysia",
    country: "Malaysia",
    preferredCurrency: "MYR",
    avatar: "SK",
  },
  {
    id: "rec-5",
    name: "Alex Rivera Design",
    handleOrAccount: "ACH • •••• 7741",
    institution: "Mercury / Lead Bank USD",
    country: "United States",
    preferredCurrency: "USD",
    avatar: "AR",
  },
  {
    id: "rec-6",
    name: "Aave Yield Vault #04",
    handleOrAccount: "0x49Bc...77E1",
    institution: "Arbitrum Smart Account",
    country: "On-Chain",
    preferredCurrency: "USDC",
    avatar: "AV",
  },
];

const INITIAL_PAYOUT_ACCOUNTS: PayoutAccount[] = [
  {
    id: "bank-bca",
    label: "Primary Local Bank (IDR)",
    bankOrWallet: "Bank Central Asia (BCA)",
    accountNumber: "8720 1948 88",
    accountHolder: "Arka Pratama",
    currency: "IDR",
    rail: "BI-FAST Real-Time (24/7)",
  },
  {
    id: "bank-gopay",
    label: "Instant e-Wallet (IDR)",
    bankOrWallet: "GoPay Indonesia",
    accountNumber: "0812 9400 8821",
    accountHolder: "Arka Pratama",
    currency: "IDR",
    rail: "QRIS / GoPay Instant Push",
  },
  {
    id: "bank-dbs",
    label: "Singapore SGD Account",
    bankOrWallet: "DBS Multiplier SGD",
    accountNumber: "072-441092-1",
    accountHolder: "Arka Pratama",
    currency: "SGD",
    rail: "Singapore FAST / PayNow",
  },
  {
    id: "bank-usd",
    label: "US Checking Account",
    bankOrWallet: "Chase Commercial USD",
    accountNumber: "•••• 5519",
    accountHolder: "Nusantara Digital LLC",
    currency: "USD",
    rail: "FedNow / Instant RTP",
  },
  {
    id: "bank-myr",
    label: "Malaysia Ringgit Account",
    bankOrWallet: "CIMB Malaysia",
    accountNumber: "8009 4120 77",
    accountHolder: "Arka Pratama",
    currency: "MYR",
    rail: "DuitNow Instant",
  },
];

const INITIAL_REQUESTS: PaymentRequestItem[] = [
  {
    id: "inv-demo-101",
    reference: "INV-2026-101",
    payerName: "Stellar Ventures SG",
    description: "UI/UX Sprint & Smart Contract Audit Retainer",
    requestAmount: 1800,
    requestCurrency: "SGD",
    settleCurrency: "IDR",
    settledAmount: convertCurrency(1800, "SGD", "IDR"),
    status: "PENDING",
    createdAt: "10 mins ago",
  },
  {
    id: "inv-demo-100",
    reference: "INV-2026-100",
    payerName: "Horizon AI Labs Inc.",
    description: "Cross-Border API Integration Milestone",
    requestAmount: 1250,
    requestCurrency: "USDC",
    settleCurrency: "USDC",
    settledAmount: 1250,
    status: "DISBURSED",
    createdAt: "Yesterday, 16:20",
    paidVia: "USDC on Arbitrum (Gas Sponsored)",
  },
];

const INITIAL_TRANSACTIONS: DemoTransaction[] = [
  {
    id: "tx-seed-1",
    reference: "SF-2026-8842",
    type: "receive",
    title: "Payment Received • Horizon AI Labs",
    subtitle: "Invoice INV-2026-100 • Auto-reconciled",
    counterparty: "Horizon AI Labs Inc.",
    rail: "Arbitrum Stylus • ERC-4337",
    sourceAmount: 1250,
    sourceCurrency: "USDC",
    targetAmount: 1250,
    targetCurrency: "USDC",
    feeAmount: 0,
    feeCurrency: "USDC",
    status: "DISBURSED",
    createdAt: "Yesterday, 16:20",
    note: "Cross-Border API Integration Milestone",
    canbProof: {
      domainHash: "0x712fa98b1024c3...91e04b",
      nonceBindingId: "CANB-482910",
      txHash: "0x94af02bc81e742d1...77c109a4",
      network: "Arbitrum Stylus L2",
      settlementMs: 1320,
    },
  },
  {
    id: "tx-seed-2",
    reference: "SF-2026-8819",
    type: "offramp",
    title: "Off-Ramp Payout to BCA",
    subtitle: "USDC ➔ IDR Instant Bank Disbursal",
    counterparty: "BCA • 8720 1948 88",
    rail: "BI-FAST Real-Time (24/7)",
    sourceAmount: 600,
    sourceCurrency: "USDC",
    targetAmount: 9725625,
    targetCurrency: "IDR",
    feeAmount: 1.5,
    feeCurrency: "USDC",
    status: "DISBURSED",
    createdAt: "Oct 28, 11:05",
    canbProof: {
      domainHash: "0x712fc44188d920...33a81f",
      nonceBindingId: "CANB-481004",
      txHash: "0x61be9904cc1284fa...18a204ff",
      network: "Base ➔ BI-FAST Bridge",
      settlementMs: 1890,
    },
  },
  {
    id: "tx-seed-3",
    reference: "SF-2026-8790",
    type: "transfer",
    title: "Cross-Border Transfer • Nexus Cloud",
    subtitle: "USDC ➔ SGD Corporate PayNow",
    counterparty: "Nexus Cloud Pte Ltd",
    rail: "PayNow & FAST Singapore",
    sourceAmount: 450,
    sourceCurrency: "USDC",
    targetAmount: 599.98,
    targetCurrency: "SGD",
    feeAmount: 2.25,
    feeCurrency: "USDC",
    status: "SETTLED",
    createdAt: "Oct 26, 09:42",
    canbProof: {
      domainHash: "0x712fe01923ab77...55d12c",
      nonceBindingId: "CANB-479331",
      txHash: "0x38dc7741aa0981bc...90f312dd",
      network: "Arbitrum ➔ Singapore FAST",
      settlementMs: 1410,
    },
  },
  {
    id: "tx-seed-4",
    reference: "SF-2026-8751",
    type: "onramp",
    title: "On-Ramp Deposit via QRIS",
    subtitle: "IDR ➔ IDRX Zero-Slippage Mint",
    counterparty: "QRIS Instant Indonesia",
    rail: "QRIS ➔ Base L2 Smart Vault",
    sourceAmount: 15000000,
    sourceCurrency: "IDR",
    targetAmount: 14985000,
    targetCurrency: "IDRX",
    feeAmount: 15000,
    feeCurrency: "IDR",
    status: "SETTLED",
    createdAt: "Oct 24, 19:18",
    canbProof: {
      domainHash: "0x712f883100fa12...09b44a",
      nonceBindingId: "CANB-477812",
      txHash: "0x19fa8823be0091cd...44e981ab",
      network: "Base Mainnet (Sponsored)",
      settlementMs: 1180,
    },
  },
];

function getInitialState(): DemoPersistedState {
  return {
    isAuthenticated: false,
    user: INITIAL_USER,
    displayCurrency: "USD",
    hideBalances: false,
    balances: { ...INITIAL_BALANCES },
    recipients: [...INITIAL_RECIPIENTS],
    payoutAccounts: [...INITIAL_PAYOUT_ACCOUNTS],
    transactions: [...INITIAL_TRANSACTIONS],
    paymentRequests: [...INITIAL_REQUESTS],
  };
}

interface DemoContextValue extends DemoPersistedState {
  hydrated: boolean;
  totalPortfolioInDisplayCurrency: number;
  activeReceiptTx: DemoTransaction | null;
  setActiveReceiptTx: (tx: DemoTransaction | null) => void;
  toasts: DemoToast[];
  pushToast: (
    title: string,
    description?: string,
    tone?: DemoToast["tone"]
  ) => void;
  dismissToast: (id: string) => void;
  signIn: (opts?: {
    email?: string;
    name?: string;
    persona?: DemoPersona;
    authMethod?: DemoUser["authMethod"];
  }) => void;
  signOut: () => void;
  switchPersona: (persona: DemoPersona) => void;
  setDisplayCurrency: (code: CurrencyCode) => void;
  toggleHideBalances: () => void;
  addRecipient: (rec: Omit<SavedRecipient, "id" | "avatar">) => SavedRecipient;
  addPayoutAccount: (acc: Omit<PayoutAccount, "id">) => PayoutAccount;
  executeTransfer: (params: {
    sourceCurrency: CurrencyCode;
    sourceAmount: number;
    targetCurrency: CurrencyCode;
    targetAmount: number;
    feeAmount: number;
    recipientName: string;
    recipientAccount: string;
    rail: string;
    note?: string;
  }) => DemoTransaction;
  createPaymentRequest: (params: {
    payerName: string;
    description: string;
    requestAmount: number;
    requestCurrency: CurrencyCode;
    settleCurrency: CurrencyCode;
  }) => PaymentRequestItem;
  simulatePayRequest: (
    requestId: string,
    paidVia?: string
  ) => DemoTransaction | null;
  simulateDirectDeposit: (params: {
    currency: CurrencyCode;
    amount: number;
    senderName?: string;
  }) => DemoTransaction;
  executeOnRamp: (params: {
    fiatCurrency: CurrencyCode;
    fiatAmount: number;
    cryptoCurrency: CurrencyCode;
    cryptoAmount: number;
    feeAmount: number;
    methodName: string;
    network: string;
    deductFromFiatVault: boolean;
  }) => DemoTransaction;
  executeOffRamp: (params: {
    cryptoCurrency: CurrencyCode;
    cryptoAmount: number;
    fiatCurrency: CurrencyCode;
    fiatAmount: number;
    feeAmount: number;
    payoutAccount: PayoutAccount;
    creditToFiatVault: boolean;
  }) => DemoTransaction;
  topUpDemoBalances: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoPersistedState>(getInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] =
    useState<DemoTransaction | null>(null);
  const [toasts, setToasts] = useState<DemoToast[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DemoPersistedState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          balances: { ...INITIAL_BALANCES, ...(parsed.balances ?? {}) },
        }));
      }
    } catch {
      // Ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state, hydrated]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (
      title: string,
      description?: string,
      tone: DemoToast["tone"] = "success"
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, tone }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast]
  );

  const totalPortfolioInDisplayCurrency = useMemo(() => {
    let totalUsd = 0;
    for (const code of ALL_CURRENCY_CODES) {
      const bal = state.balances[code] ?? 0;
      totalUsd += convertCurrency(bal, code, "USD");
    }
    return convertCurrency(totalUsd, "USD", state.displayCurrency);
  }, [state.balances, state.displayCurrency]);

  const signIn: DemoContextValue["signIn"] = useCallback(
    (opts) => {
      const persona = opts?.persona ?? "personal";
      const baseUser =
        persona === "enterprise" ? ENTERPRISE_USER : INITIAL_USER;
      const derivedName =
        opts?.name?.trim() ||
        (opts?.email
          ? opts.email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : baseUser.name);

      const nextUser: DemoUser = {
        ...baseUser,
        name: derivedName,
        email: opts?.email?.trim() || baseUser.email,
        persona,
        authMethod: opts?.authMethod ?? "Passkey (ERC-4337)",
      };

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: nextUser,
      }));
      pushToast(
        `Welcome back, ${nextUser.name}`,
        `ERC-4337 Smart Account & CANB Session verified`
      );
    },
    [pushToast]
  );

  const signOut = useCallback(() => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
    pushToast("Signed out of SEAFI Vault", "Demo balances remain saved locally", "info");
  }, [pushToast]);

  const switchPersona = useCallback(
    (persona: DemoPersona) => {
      const nextUser = persona === "enterprise" ? ENTERPRISE_USER : INITIAL_USER;
      setState((prev) => ({
        ...prev,
        user: nextUser,
      }));
      pushToast(
        `Switched to ${persona === "enterprise" ? "Enterprise B2B" : "Personal Freelancer"} Mode`,
        `${nextUser.company} • ${nextUser.smartWallet}`,
        "info"
      );
    },
    [pushToast]
  );

  const setDisplayCurrency = useCallback((code: CurrencyCode) => {
    setState((prev) => ({ ...prev, displayCurrency: code }));
  }, []);

  const toggleHideBalances = useCallback(() => {
    setState((prev) => ({ ...prev, hideBalances: !prev.hideBalances }));
  }, []);

  const addRecipient: DemoContextValue["addRecipient"] = useCallback(
    (rec) => {
      const initials = rec.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      const created: SavedRecipient = {
        ...rec,
        id: `rec-${Date.now()}`,
        avatar: initials || "SF",
      };
      setState((prev) => ({
        ...prev,
        recipients: [created, ...prev.recipients],
      }));
      pushToast("Recipient saved", `${created.name} (${created.preferredCurrency})`);
      return created;
    },
    [pushToast]
  );

  const addPayoutAccount: DemoContextValue["addPayoutAccount"] = useCallback(
    (acc) => {
      const created: PayoutAccount = {
        ...acc,
        id: `bank-${Date.now()}`,
      };
      setState((prev) => ({
        ...prev,
        payoutAccounts: [created, ...prev.payoutAccounts],
      }));
      pushToast(
        "Payout account linked",
        `${created.bankOrWallet} • ${created.accountNumber}`
      );
      return created;
    },
    [pushToast]
  );

  const executeTransfer: DemoContextValue["executeTransfer"] = useCallback(
    (params) => {
      const refNum = Math.floor(1000 + Math.random() * 9000);
      const tx: DemoTransaction = {
        id: `tx-${Date.now()}`,
        reference: `SF-2026-${refNum}`,
        type: "transfer",
        title: `Transfer to ${params.recipientName}`,
        subtitle: `${params.sourceCurrency} ➔ ${params.targetCurrency} • ${params.recipientAccount}`,
        counterparty: params.recipientName,
        rail: params.rail,
        sourceAmount: params.sourceAmount,
        sourceCurrency: params.sourceCurrency,
        targetAmount: params.targetAmount,
        targetCurrency: params.targetCurrency,
        feeAmount: params.feeAmount,
        feeCurrency: params.sourceCurrency,
        status: "SETTLED",
        createdAt: "Just now",
        note: params.note,
        canbProof: createCanbProof(`Arbitrum ➔ ${params.rail}`),
      };

      setState((prev) => ({
        ...prev,
        balances: {
          ...prev.balances,
          [params.sourceCurrency]: Math.max(
            0,
            (prev.balances[params.sourceCurrency] ?? 0) - params.sourceAmount
          ),
        },
        transactions: [tx, ...prev.transactions],
      }));

      pushToast(
        "Transfer Settled Instantly",
        `${formatCurrency(params.targetAmount, params.targetCurrency)} delivered to ${params.recipientName}`
      );
      return tx;
    },
    [pushToast]
  );

  const createPaymentRequest: DemoContextValue["createPaymentRequest"] =
    useCallback(
      (params) => {
        const num = Math.floor(102 + Math.random() * 890);
        const settledAmount = convertCurrency(
          params.requestAmount,
          params.requestCurrency,
          params.settleCurrency
        );
        const item: PaymentRequestItem = {
          id: `inv-${Date.now()}`,
          reference: `INV-2026-${num}`,
          payerName: params.payerName || "Global Client",
          description:
            params.description || "Cross-Border Settlement via SEAFI Link",
          requestAmount: params.requestAmount,
          requestCurrency: params.requestCurrency,
          settleCurrency: params.settleCurrency,
          settledAmount,
          status: "PENDING",
          createdAt: "Just now",
        };

        setState((prev) => ({
          ...prev,
          paymentRequests: [item, ...prev.paymentRequests],
        }));

        pushToast(
          `Payment Link Created (${item.reference})`,
          `Requesting ${formatCurrency(item.requestAmount, item.requestCurrency)}`
        );
        return item;
      },
      [pushToast]
    );

  const simulatePayRequest: DemoContextValue["simulatePayRequest"] =
    useCallback(
      (requestId, paidVia = "Instant Multi-Rail Checkout") => {
        let createdTx: DemoTransaction | null = null;

        setState((prev) => {
          const target = prev.paymentRequests.find((r) => r.id === requestId);
          if (!target || target.status === "DISBURSED") return prev;

          const refNum = Math.floor(1000 + Math.random() * 9000);
          const tx: DemoTransaction = {
            id: `tx-${Date.now()}`,
            reference: `SF-2026-${refNum}`,
            type: "receive",
            title: `Payment Received • ${target.payerName}`,
            subtitle: `${target.reference} • ${paidVia}`,
            counterparty: target.payerName,
            rail: CURRENCIES[target.settleCurrency].rail,
            sourceAmount: target.requestAmount,
            sourceCurrency: target.requestCurrency,
            targetAmount: target.settledAmount,
            targetCurrency: target.settleCurrency,
            feeAmount: 0,
            feeCurrency: target.settleCurrency,
            status: "DISBURSED",
            createdAt: "Just now",
            note: target.description,
            canbProof: createCanbProof(
              `CANB Pay-In ➔ ${target.settleCurrency} Vault`
            ),
          };
          createdTx = tx;

          return {
            ...prev,
            balances: {
              ...prev.balances,
              [target.settleCurrency]:
                (prev.balances[target.settleCurrency] ?? 0) +
                target.settledAmount,
            },
            paymentRequests: prev.paymentRequests.map((r) =>
              r.id === requestId
                ? { ...r, status: "DISBURSED", paidVia, txId: tx.id }
                : r
            ),
            transactions: [tx, ...prev.transactions],
          };
        });

        if (createdTx) {
          const settledTx = createdTx as DemoTransaction;
          pushToast(
            "Funds Received & Settled!",
            `+${formatCurrency(settledTx.targetAmount, settledTx.targetCurrency)} credited to your ${settledTx.targetCurrency} wallet`
          );
        }

        return createdTx;
      },
      [pushToast]
    );

  const simulateDirectDeposit: DemoContextValue["simulateDirectDeposit"] =
    useCallback(
      ({ currency, amount, senderName = "External Bank / Wallet Sender" }) => {
        const refNum = Math.floor(1000 + Math.random() * 9000);
        const tx: DemoTransaction = {
          id: `tx-${Date.now()}`,
          reference: `SF-2026-${refNum}`,
          type: "receive",
          title: `Direct Deposit (${currency})`,
          subtitle: `Inbound via ${CURRENCIES[currency].depositInfo.provider}`,
          counterparty: senderName,
          rail: CURRENCIES[currency].rail,
          sourceAmount: amount,
          sourceCurrency: currency,
          targetAmount: amount,
          targetCurrency: currency,
          feeAmount: 0,
          feeCurrency: currency,
          status: "SETTLED",
          createdAt: "Just now",
          canbProof: createCanbProof(CURRENCIES[currency].rail),
        };

        setState((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            [currency]: (prev.balances[currency] ?? 0) + amount,
          },
          transactions: [tx, ...prev.transactions],
        }));

        pushToast(
          `${currency} Deposit Confirmed`,
          `+${formatCurrency(amount, currency)} added to your ${currency} balance`
        );
        return tx;
      },
      [pushToast]
    );

  const executeOnRamp: DemoContextValue["executeOnRamp"] = useCallback(
    (params) => {
      const refNum = Math.floor(1000 + Math.random() * 9000);
      const tx: DemoTransaction = {
        id: `tx-${Date.now()}`,
        reference: `SF-2026-${refNum}`,
        type: "onramp",
        title: `On-Ramp • Bought ${params.cryptoCurrency}`,
        subtitle: `${params.methodName} (${params.fiatCurrency} ➔ ${params.cryptoCurrency})`,
        counterparty: params.methodName,
        rail: `${params.methodName} ➔ ${params.network}`,
        sourceAmount: params.fiatAmount,
        sourceCurrency: params.fiatCurrency,
        targetAmount: params.cryptoAmount,
        targetCurrency: params.cryptoCurrency,
        feeAmount: params.feeAmount,
        feeCurrency: params.fiatCurrency,
        status: "SETTLED",
        createdAt: "Just now",
        canbProof: createCanbProof(`${params.network} (ERC-4337 Sponsored)`),
      };

      setState((prev) => {
        const nextBalances = {
          ...prev.balances,
          [params.cryptoCurrency]:
            (prev.balances[params.cryptoCurrency] ?? 0) + params.cryptoAmount,
        };
        if (params.deductFromFiatVault) {
          nextBalances[params.fiatCurrency] = Math.max(
            0,
            (prev.balances[params.fiatCurrency] ?? 0) - params.fiatAmount
          );
        }
        return {
          ...prev,
          balances: nextBalances,
          transactions: [tx, ...prev.transactions],
        };
      });

      pushToast(
        "On-Ramp Complete!",
        `+${formatCurrency(params.cryptoAmount, params.cryptoCurrency)} minted into Smart Wallet`
      );
      return tx;
    },
    [pushToast]
  );

  const executeOffRamp: DemoContextValue["executeOffRamp"] = useCallback(
    (params) => {
      const refNum = Math.floor(1000 + Math.random() * 9000);
      const tx: DemoTransaction = {
        id: `tx-${Date.now()}`,
        reference: `SF-2026-${refNum}`,
        type: "offramp",
        title: `Off-Ramp Payout • ${params.payoutAccount.bankOrWallet}`,
        subtitle: `${params.cryptoCurrency} ➔ ${params.fiatCurrency} (${params.payoutAccount.accountNumber})`,
        counterparty: `${params.payoutAccount.bankOrWallet} • ${params.payoutAccount.accountNumber}`,
        rail: params.payoutAccount.rail,
        sourceAmount: params.cryptoAmount,
        sourceCurrency: params.cryptoCurrency,
        targetAmount: params.fiatAmount,
        targetCurrency: params.fiatCurrency,
        feeAmount: params.feeAmount,
        feeCurrency: params.cryptoCurrency,
        status: "DISBURSED",
        createdAt: "Just now",
        canbProof: createCanbProof(`CANB Bridge ➔ ${params.payoutAccount.rail}`),
      };

      setState((prev) => {
        const nextBalances = {
          ...prev.balances,
          [params.cryptoCurrency]: Math.max(
            0,
            (prev.balances[params.cryptoCurrency] ?? 0) - params.cryptoAmount
          ),
        };
        if (params.creditToFiatVault) {
          nextBalances[params.fiatCurrency] =
            (prev.balances[params.fiatCurrency] ?? 0) + params.fiatAmount;
        }
        return {
          ...prev,
          balances: nextBalances,
          transactions: [tx, ...prev.transactions],
        };
      });

      pushToast(
        "Off-Ramp Disbursed!",
        `${formatCurrency(params.fiatAmount, params.fiatCurrency)} sent to ${params.payoutAccount.bankOrWallet}`
      );
      return tx;
    },
    [pushToast]
  );

  const topUpDemoBalances = useCallback(() => {
    setState((prev) => ({
      ...prev,
      balances: {
        ...prev.balances,
        USDC: (prev.balances.USDC ?? 0) + 2500,
        IDRX: (prev.balances.IDRX ?? 0) + 25000000,
        IDR: (prev.balances.IDR ?? 0) + 15000000,
        SGD: (prev.balances.SGD ?? 0) + 1000,
        USD: (prev.balances.USD ?? 0) + 1500,
      },
    }));
    pushToast(
      "Demo Liquidity Topped Up!",
      "Added +2,500 USDC, +25M IDRX, +Rp 15M IDR, +S$1,000 SGD & +$1,500 USD"
    );
  }, [pushToast]);

  const resetDemo = useCallback(() => {
    const fresh = getInitialState();
    fresh.isAuthenticated = state.isAuthenticated;
    fresh.user = state.user;
    setState(fresh);
    setActiveReceiptTx(null);
    pushToast(
      "Demo Reset to Default",
      "All balances, requests, and sample transactions restored",
      "info"
    );
  }, [pushToast, state.isAuthenticated, state.user]);

  const value: DemoContextValue = {
    ...state,
    hydrated,
    totalPortfolioInDisplayCurrency,
    activeReceiptTx,
    setActiveReceiptTx,
    toasts,
    pushToast,
    dismissToast,
    signIn,
    signOut,
    switchPersona,
    setDisplayCurrency,
    toggleHideBalances,
    addRecipient,
    addPayoutAccount,
    executeTransfer,
    createPaymentRequest,
    simulatePayRequest,
    simulateDirectDeposit,
    executeOnRamp,
    executeOffRamp,
    topUpDemoBalances,
    resetDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used inside <DemoProvider>");
  }
  return ctx;
}
