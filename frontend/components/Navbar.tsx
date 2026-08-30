"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Terminal, ExternalLink, ShieldCheck, GitCommit } from "lucide-react";

interface NavbarProps {
  isSynthesizing?: boolean;
}

export default function Navbar({ isSynthesizing = false }: NavbarProps) {
  const apiDocsUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/docs`
    : "http://localhost:8000/docs";

  return (
    <header className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Branding & Breadcrumbs */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="w-6 h-6 bg-blue-600 text-black flex items-center justify-center font-bold font-mono text-sm">
          S2A
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-100 tracking-wider">SPEC2ASSERT</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">EDA_SYNTHESIS_CORE</span>
          <span className="text-zinc-600">/</span>
          <span className="text-blue-500 font-medium">v1.2.0-deterministic</span>
        </div>
      </Link>

      {/* Center: System Status Indicator */}
      <div className="hidden md:flex items-center gap-4 text-zinc-400">
        <div
          className={`flex items-center gap-1.5 border px-2.5 py-1 transition-colors ${
            isSynthesizing
              ? "border-blue-500/80 bg-blue-950/40 text-blue-300 shadow-[0_0_10px_rgba(0,102,255,0.2)]"
              : "border-zinc-800 bg-zinc-900/80 text-zinc-300"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 ${
              isSynthesizing ? "bg-blue-400 animate-ping" : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-[11px] font-semibold">
            {isSynthesizing
              ? "ENGINE: ACTIVE_SYNTHESIS // CORE_01_RUNNING"
              : "ENGINE: DETERMINISTIC (0.0T)"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
          <GitCommit className="w-3.5 h-3.5" />
          <span>{isSynthesizing ? "AST_PARSING" : "AST_VERIFIED"}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <a
          href={apiDocsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-500" />
          <span>OPENAPI_SPEC</span>
          <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
        </a>
      </div>
    </header>
  );
}

export { Navbar };
