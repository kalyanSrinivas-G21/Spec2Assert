"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, FileCode } from "lucide-react";

interface CodeTabsProps {
  svaCode: string;
  pythonCode: string;
}

export default function CodeTabs({ svaCode, pythonCode }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState<"sva" | "python">("sva");
  const [copied, setCopied] = useState(false);

  // Clean code and strip stray markdown code fences
  const cleanCode = (code: string) => {
    return code
      .replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
  };

  const currentCode = cleanCode(activeTab === "sva" ? svaCode : pythonCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // High-density keyword tokenizer
  const renderLine = (line: string, isSva: boolean) => {
    const trimmed = line.trim();
    if (isSva ? trimmed.startsWith("//") : trimmed.startsWith("#")) {
      return <span className="text-zinc-600 italic">{line}</span>;
    }

    const svaKeywords = new Set([
      "property", "endproperty", "assert", "cover", "disable", "iff",
      "posedge", "negedge", "always", "input", "output", "wire", "reg", "logic"
    ]);
    const pyKeywords = new Set([
      "import", "from", "async", "def", "await", "assert", "for", "in", "return", "pass"
    ]);

    const words = line.split(/(\s+|[(),;@|#\[\]])/);

    return words.map((w, i) => {
      if (isSva && svaKeywords.has(w)) {
        return <span key={i} className="text-blue-400 font-semibold">{w}</span>;
      }
      if (!isSva && pyKeywords.has(w)) {
        return <span key={i} className="text-blue-400 font-semibold">{w}</span>;
      }
      if (w.includes("|->") || w.includes("|=>") || w.startsWith("##") || w.startsWith("@")) {
        return <span key={i} className="text-amber-400 font-medium">{w}</span>;
      }
      if (w.startsWith('"') || w.startsWith("'")) {
        return <span key={i} className="text-emerald-400">{w}</span>;
      }
      return <span key={i} className="text-zinc-200">{w}</span>;
    });
  };

  const lines = currentCode.split("\n");

  return (
    <div className="flex-1 flex flex-col border border-zinc-800 bg-zinc-950 font-mono text-xs">
      {/* Sharp Tab Bar */}
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-2">
        <div className="flex items-center h-full">
          <button
            onClick={() => setActiveTab("sva")}
            className={`h-full px-3 flex items-center gap-1.5 border-r border-zinc-800 transition-colors ${
              activeTab === "sva"
                ? "bg-zinc-950 text-white border-t-2 border-t-blue-500 font-medium"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-500" />
            <span>formal_property.sva</span>
          </button>
          <button
            onClick={() => setActiveTab("python")}
            className={`h-full px-3 flex items-center gap-1.5 border-r border-zinc-800 transition-colors ${
              activeTab === "python"
                ? "bg-zinc-950 text-white border-t-2 border-t-blue-500 font-medium"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span>test_cocotb.py</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="h-6 px-2 flex items-center gap-1 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-zinc-400" />
              <span>COPY BUFFER</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="flex-1 p-3 overflow-auto bg-black font-mono text-[12px] leading-5 min-h-[300px]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/40">
                <td className="w-10 pr-3 text-right select-none text-zinc-600 text-[11px] align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre pl-2 text-zinc-300 font-mono">
                  {renderLine(line, activeTab === "sva")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { CodeTabs };
