"use client";

import React from "react";
import { Cpu, Terminal, ExternalLink, ShieldCheck, GitCommit } from "lucide-react";

export default function Navbar() {
  const apiDocsUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/docs`
    : "http://localhost:8000/docs";

  return (
    <header className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center gap-3">
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
      </div>

      {/* Center: System Status Indicator */}
      <div className="hidden md:flex items-center gap-4 text-zinc-400">
        <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/80 px-2.5 py-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-zinc-300">ENGINE: DETERMINISTIC (0.0T)</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
          <GitCommit className="w-3.5 h-3.5" />
          <span>AST_VERIFIED</span>
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
