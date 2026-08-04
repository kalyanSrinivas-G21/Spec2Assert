"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode, Terminal, AlertCircle } from "lucide-react";

interface CodeTabsProps {
  svaCode: string;
  cocotbCode: string;
}

export function CodeTabs({ svaCode, cocotbCode }: CodeTabsProps) {
  const [tab, setTab] = useState<"sva" | "cocotb">("sva");
  const [copied, setCopied] = useState(false);

  const activeCode = tab === "sva" ? svaCode : cocotbCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800/60">
          <button
            onClick={() => setTab("sva")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "sva"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SystemVerilog (SVA)</span>
          </button>
          <button
            onClick={() => setTab("cocotb")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "cocotb"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python / cocotb</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container */}
      <div className="p-4 bg-zinc-950 overflow-x-auto min-h-[220px] font-mono text-xs leading-relaxed text-zinc-200 selection:bg-indigo-500/30">
        <pre className="whitespace-pre">
          <code>{activeCode}</code>
        </pre>
      </div>

      {/* Verification Footnote */}
      <div className="px-4 py-2 bg-zinc-950/90 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-500 italic">
        <AlertCircle className="w-3 h-3 text-zinc-600 shrink-0" />
        <span>Generated assertions must be simulated or formally checked in your EDA tool before use.</span>
      </div>
    </div>
  );
}
