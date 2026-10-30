import type { Metadata } from "next";
import { geistSans, jetbrainsMono, outfit } from "@/lib/fonts";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEAFI MVP | Interactive Multi-Currency & On/Off-Ramp Demo",
  description:
    "Interactive frontend MVP for SEAFI: Smart Account Sign-In, Multi-Currency Cross-Border Transfer, Receive with Currency Selection, and Instant Fiat On-Ramp / Off-Ramp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#F6F7F2] text-[#0F141A] antialiased min-h-screen selection:bg-[#93E937]/30 selection:text-[#0B3B24]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
