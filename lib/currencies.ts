export type CurrencyCode =
  | "USDC"
  | "USDT"
  | "IDRX"
  | "IDR"
  | "USD"
  | "SGD"
  | "MYR"
  | "THB"
  | "PHP"
  | "EUR";

export interface CurrencyMeta {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  kind: "stablecoin" | "fiat";
  /** Units per 1.00 USD */
  usdRate: number;
  decimals: number;
  rail: string;
  network?: string;
  quickAmounts: number[];
  depositInfo: {
    provider: string;
    accountLabel: string;
    accountValue: string;
    secondaryLabel: string;
    secondaryValue: string;
  };
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USDC: {
    code: "USDC",
    name: "USD Coin (Circle)",
    symbol: "USDC",
    flag: "💠",
    kind: "stablecoin",
    usdRate: 1.0,
    decimals: 2,
    rail: "Arbitrum Stylus • ERC-4337",
    network: "Arbitrum / Base",
    quickAmounts: [100, 500, 1000, 2500],
    depositInfo: {
      provider: "SEAFI Smart Vault (ERC-4337)",
      accountLabel: "Smart Account Address",
      accountValue: "0x84Fe9A21cB709E412c09D3e99418a9B4cA2c",
      secondaryLabel: "Supported Chains",
      secondaryValue: "Arbitrum One, Base, Optimism, Lisk (Gas $0)",
    },
  },
  USDT: {
    code: "USDT",
    name: "Tether USD",
    symbol: "USDT",
    flag: "🟢",
    kind: "stablecoin",
    usdRate: 1.0,
    decimals: 2,
    rail: "Base / Polygon Liquidity Rail",
    network: "Base / Polygon",
    quickAmounts: [100, 500, 1000, 2500],
    depositInfo: {
      provider: "SEAFI Smart Vault (ERC-4337)",
      accountLabel: "Smart Account Address",
      accountValue: "0x84Fe9A21cB709E412c09D3e99418a9B4cA2c",
      secondaryLabel: "Supported Chains",
      secondaryValue: "Base, Arbitrum One, Polygon POS",
    },
  },
  IDRX: {
    code: "IDRX",
    name: "Rupiah Stablecoin",
    symbol: "IDRX",
    flag: "⚡",
    kind: "stablecoin",
    usdRate: 16250,
    decimals: 0,
    rail: "Base / Lisk Instant Pool",
    network: "Base / Lisk",
    quickAmounts: [1500000, 5000000, 15000000, 50000000],
    depositInfo: {
      provider: "IDRX Native Smart Vault",
      accountLabel: "IDRX Vault Address",
      accountValue: "0x84Fe9A21cB709E412c09D3e99418a9B4cA2c",
      secondaryLabel: "Supported Chains",
      secondaryValue: "Base Mainnet, Lisk L2 (1 IDRX = 1 IDR)",
    },
  },
  IDR: {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    flag: "🇮🇩",
    kind: "fiat",
    usdRate: 16250,
    decimals: 0,
    rail: "BI-FAST & QRIS 24/7",
    quickAmounts: [1500000, 5000000, 15000000, 25000000],
    depositInfo: {
      provider: "BCA Virtual Account & QRIS",
      accountLabel: "BCA Virtual Account",
      accountValue: "3901 0812 9940 8821",
      secondaryLabel: "Merchant / Rail",
      secondaryValue: "SEAFI TECHNOLOGY INDONESIA • BI-FAST / QRIS",
    },
  },
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    kind: "fiat",
    usdRate: 1.0,
    decimals: 2,
    rail: "FedNow / Instant ACH",
    quickAmounts: [100, 500, 1500, 5000],
    depositInfo: {
      provider: "Lead Bank USD Named Account",
      accountLabel: "Account Number",
      accountValue: "219400887412",
      secondaryLabel: "ACH / Wire Routing",
      secondaryValue: "101019644 • FedNow Instant Enabled",
    },
  },
  SGD: {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    flag: "🇸🇬",
    kind: "fiat",
    usdRate: 1.34,
    decimals: 2,
    rail: "PayNow & FAST Singapore",
    quickAmounts: [150, 500, 1500, 3000],
    depositInfo: {
      provider: "DBS Corporate PayNow & FAST",
      accountLabel: "PayNow UEN / VPA",
      accountValue: "202618492K-SEAFI",
      secondaryLabel: "FAST Account No.",
      secondaryValue: "072-994120-8 (DBS Bank Ltd)",
    },
  },
  MYR: {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    flag: "🇲🇾",
    kind: "fiat",
    usdRate: 4.38,
    decimals: 2,
    rail: "DuitNow Instant",
    quickAmounts: [500, 1500, 5000, 10000],
    depositInfo: {
      provider: "Maybank DuitNow Virtual ID",
      accountLabel: "DuitNow ID",
      accountValue: "MY-SEAFI-8829104",
      secondaryLabel: "Clearing Rail",
      secondaryValue: "PayNet DuitNow 24/7 Instant",
    },
  },
  THB: {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    flag: "🇹🇭",
    kind: "fiat",
    usdRate: 33.8,
    decimals: 2,
    rail: "PromptPay Thailand",
    quickAmounts: [3000, 10000, 35000, 100000],
    depositInfo: {
      provider: "Kasikorn PromptPay QR",
      accountLabel: "PromptPay Biller ID",
      accountValue: "010556709912488",
      secondaryLabel: "Clearing Rail",
      secondaryValue: "PromptPay Instant Settlement",
    },
  },
  PHP: {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    flag: "🇵🇭",
    kind: "fiat",
    usdRate: 57.6,
    decimals: 2,
    rail: "InstaPay / GCash",
    quickAmounts: [5000, 15000, 50000, 100000],
    depositInfo: {
      provider: "UnionBank InstaPay & QR Ph",
      accountLabel: "Virtual Account",
      accountValue: "1094 8821 0049",
      secondaryLabel: "Clearing Rail",
      secondaryValue: "InstaPay / GCash / Maya QR Ph",
    },
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    kind: "fiat",
    usdRate: 0.92,
    decimals: 2,
    rail: "SEPA Instant",
    quickAmounts: [100, 500, 1500, 3000],
    depositInfo: {
      provider: "Banking Circle Dedicated IBAN",
      accountLabel: "Virtual IBAN",
      accountValue: "LU89 4080 0000 4192 8810",
      secondaryLabel: "BIC / Rail",
      secondaryValue: "BCIRLULL • SEPA Instant 24/7",
    },
  },
};

export const ALL_CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];
export const STABLECOIN_CODES: CurrencyCode[] = ["USDC", "USDT", "IDRX"];
export const FIAT_CODES: CurrencyCode[] = [
  "IDR",
  "USD",
  "SGD",
  "MYR",
  "PHP",
  "THB",
  "EUR",
];

/**
 * Returns how many units of `to` equal 1 unit of `from`
 */
export function getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  const fromPerUsd = CURRENCIES[from].usdRate;
  const toPerUsd = CURRENCIES[to].usdRate;
  return toPerUsd / fromPerUsd;
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (!Number.isFinite(amount)) return 0;
  return amount * getExchangeRate(from, to);
}

export function formatCurrency(
  amount: number,
  code: CurrencyCode,
  options?: { compact?: boolean; includeCode?: boolean }
): string {
  const meta = CURRENCIES[code];
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (options?.compact && Math.abs(safeAmount) >= 1_000_000) {
    const millions = safeAmount / 1_000_000;
    if (meta.kind === "stablecoin") {
      return `${millions.toFixed(2)}M ${meta.code}`;
    }
    return `${meta.symbol} ${millions.toFixed(2)}M`;
  }

  const formattedNum = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(safeAmount);

  if (meta.kind === "stablecoin") {
    return `${formattedNum} ${meta.code}`;
  }

  const base = `${meta.symbol}${meta.symbol.length > 1 ? " " : ""}${formattedNum}`;
  return options?.includeCode ? `${base} ${meta.code}` : base;
}

export function formatRatePair(from: CurrencyCode, to: CurrencyCode): string {
  const rate = getExchangeRate(from, to);
  if (rate >= 100) {
    return `1 ${from} = ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(rate)} ${to}`;
  }
  if (rate >= 1) {
    return `1 ${from} = ${rate.toFixed(4)} ${to}`;
  }
  const inverse = getExchangeRate(to, from);
  return `1 ${to} = ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: inverse >= 100 ? 0 : 4,
  }).format(inverse)} ${from}`;
}

export interface OnRampMethod {
  id: string;
  name: string;
  badge: string;
  feePct: number;
  eta: string;
  supportedFiats?: CurrencyCode[];
}

export const ONRAMP_METHODS: OnRampMethod[] = [
  {
    id: "qris",
    name: "QRIS Instant Scan",
    badge: "0% Promo Fee",
    feePct: 0.001,
    eta: "~5 sec",
    supportedFiats: ["IDR"],
  },
  {
    id: "bca_va",
    name: "BCA / Mandiri Virtual Account",
    badge: "BI-FAST",
    feePct: 0.0025,
    eta: "~10 sec",
    supportedFiats: ["IDR"],
  },
  {
    id: "ewallet_id",
    name: "GoPay / OVO / DANA",
    badge: "Instant Push",
    feePct: 0.005,
    eta: "~8 sec",
    supportedFiats: ["IDR"],
  },
  {
    id: "paynow_sg",
    name: "PayNow QR / FAST Transfer",
    badge: "Zero FX Markup",
    feePct: 0.002,
    eta: "~6 sec",
    supportedFiats: ["SGD"],
  },
  {
    id: "duitnow_my",
    name: "DuitNow QR / Instant Bank",
    badge: "24/7 Local Rail",
    feePct: 0.003,
    eta: "~8 sec",
    supportedFiats: ["MYR"],
  },
  {
    id: "instapay_ph",
    name: "GCash / Maya / InstaPay",
    badge: "Instant PHP",
    feePct: 0.004,
    eta: "~10 sec",
    supportedFiats: ["PHP"],
  },
  {
    id: "promptpay_th",
    name: "PromptPay QR Instant",
    badge: "Zero Slippage",
    feePct: 0.003,
    eta: "~8 sec",
    supportedFiats: ["THB"],
  },
  {
    id: "bank_ach_sepa",
    name: "Instant Bank Transfer (FedNow / SEPA)",
    badge: "Low Flat Fee",
    feePct: 0.0025,
    eta: "~12 sec",
    supportedFiats: ["USD", "EUR"],
  },
  {
    id: "card_global",
    name: "Visa / Mastercard / Apple Pay",
    badge: "Global Instant",
    feePct: 0.015,
    eta: "Instant",
  },
];

export function getOnRampMethodsForFiat(fiat: CurrencyCode): OnRampMethod[] {
  return ONRAMP_METHODS.filter(
    (m) => !m.supportedFiats || m.supportedFiats.includes(fiat)
  );
}
