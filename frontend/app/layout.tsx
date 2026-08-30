import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spec2Assert | Deterministic Hardware Verification Workbench",
  description:
    "Deterministic EDA engine compiling natural-language hardware interface specifications into formal SystemVerilog Assertions (SVA) and executable cocotb testbenches.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-zinc-100 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
