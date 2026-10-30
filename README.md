# SEAFI Interactive Frontend MVP

Standalone **Next.js 16 (App Router + Tailwind CSS v4)** interactive frontend MVP for **SEAFI**, built for live product demos without requiring a backend database or external API keys.

## Quick Start

```bash
cd /home/xynerva/product/seafi/mvp
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## End-to-End Demo Walkthrough

1. **Landing & Live FX Sandbox (`/`)**:
   - Preview multi-currency exchange quotes (`USDC`, `IDRX`, `USDT`, `IDR`, `SGD`, `USD`, `MYR`, `PHP`, `THB`, `EUR`) and launch straight into Sign-In or Wallet.
2. **Smart Account Sign-In (`/login`)**:
   - Switch between **Freelancer / C2C** and **Enterprise / B2B** personas.
   - Sign in via **Passkey (ERC-4337)**, **Google Smart Auth**, or **Email Vault** with animated CANB session nonce binding.
3. **Consolidated Multi-Currency Dashboard (`/dashboard`)**:
   - Toggle portfolio display currency across 7 fiat currencies, watch per-second Aave V3 float yield accrue, and inspect all 10 live currency wallets.
4. **Try to Transfer (`/dashboard/transfer`)**:
   - Pick any source wallet and destination currency, choose a saved global recipient (or add a custom bank/e-wallet recipient), and watch the 3-step CANB + Local Instant Rail settlement deduct your balance and issue an **Official Digital Kwitansi**.
5. **Receive Selecting Currency (`/dashboard/receive` & `/pay/[id]`)**:
   - Select any of the 10 currencies to receive, optionally enable **Auto-Convert Settlement Currency** (e.g. bill in `USD`/`SGD`, settle in `IDR`/`USDC`), generate a live QR & checkout link, open the **Client Payer View (`/pay/[id]`)** or click **Simulate Client Paying Now**, or simulate direct Virtual Account / QRIS deposits.
6. **On-Ramp & Off-Ramp (`/dashboard/ramp`)**:
   - **On-Ramp**: Buy `USDC`, `IDRX`, or `USDT` using local payment methods (`QRIS`, `BCA Virtual Account`, `GoPay`, `PayNow`, `DuitNow`, `GCash`, `PromptPay`, `ACH/SEPA`, `Card`) or convert directly from your SEAFI Fiat Vault.
   - **Off-Ramp**: Cash out `USDC`, `IDRX`, or `USDT` directly to local bank accounts or e-wallets (`BI-FAST`, `PayNow`, `FedNow`, `DuitNow`) with custom bank account linking.
7. **Demo Controls**:
   - Use **Top-Up** or **Reset** in the left sidebar anytime during a live pitch to replenish balances or reset state.
