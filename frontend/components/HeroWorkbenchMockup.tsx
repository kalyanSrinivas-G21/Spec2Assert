"use client";

import React, { useState } from "react";
import { Check, Copy, ChevronRight } from "lucide-react";

interface Protocol {
  id: string;
  label: string;
  tag: string;
  spec: string;
  sva: string;
  ruleName: string;
  latency: string;
}

const PROTOCOLS: Protocol[] = [
  {
    id: "axi4",
    label: "AXI4-Stream",
    tag: "HANDSHAKE",
    spec: "When TVALID is asserted high, TREADY must respond within 3 clock cycles. TVALID must remain high until the handshake completes.",
    sva: `// AXI4-Stream Handshake Latency Guard
property p_axi4_handshake_timeout;
  @(posedge aclk)
  disable iff (!aresetn)
  (tvalid && !tready) |-> ##[1:3] tready;
endproperty

a_axi4_handshake: assert property(
  p_axi4_handshake_timeout)
  else $error("[S2A] tready latency violated.");`,
    ruleName: "AXI4_HANDSHAKE_TIMEOUT",
    latency: "3 CLK",
  },
  {
    id: "fifo",
    label: "FIFO Guard",
    tag: "OVERFLOW",
    spec: "When fifo_full is asserted, any write_en pulse must trigger overflow_err on the next clock cycle and suppress fifo_we.",
    sva: `// FIFO Overflow Write Suppression
property p_fifo_overflow_suppress;
  @(posedge clk)
  disable iff (!rst_n)
  (fifo_full && write_en)
  |=> (overflow_err && !fifo_we);
endproperty

a_fifo_overflow: assert property(
  p_fifo_overflow_suppress)
  else $error("[S2A] Write not suppressed.");`,
    ruleName: "FIFO_OVERFLOW_SUPPRESS",
    latency: "1 CLK",
  },
  {
    id: "apb",
    label: "APB3 Timeout",
    tag: "TRANSFER",
    spec: "If PSEL and PENABLE are asserted while PREADY remains low for more than 16 cycles, PSLVERR must assert high.",
    sva: `// APB3 Transfer Timeout Guard
property p_apb_transfer_timeout;
  @(posedge pclk)
  disable iff (!presetn)
  (psel && penable && !pready)
  |-> ##[1:16] (pready || pslverr);
endproperty

a_apb_timeout: assert property(
  p_apb_transfer_timeout)
  else $error("[S2A] APB bus hung.");`,
    ruleName: "APB_TRANSFER_TIMEOUT",
    latency: "16 CLK",
  },
];

// Syntax highlighter - returns JSX spans with colors
function highlightSVA(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  const keywords = [
    "property", "endproperty", "assert", "posedge", "disable", "iff",
    "else", "input", "output", "logic", "wire", "reg",
  ];
  const operators = ["|->", "|=>", "##", "@", "&&", "||", "!", "||"];

  return lines.map((line, lineIdx) => {
    if (line.startsWith("//")) {
      return (
        <div key={lineIdx} className="text-zinc-500 select-text">
          {line}
        </div>
      );
    }

    // Tokenize for colors
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let tokenIdx = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Check keywords
      for (const kw of keywords) {
        if (remaining.startsWith(kw) && (remaining.length === kw.length || /\W/.test(remaining[kw.length]))) {
          parts.push(
            <span key={`${lineIdx}-kw-${tokenIdx}`} className="text-blue-400 font-medium">
              {kw}
            </span>
          );
          remaining = remaining.slice(kw.length);
          tokenIdx++;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // Check operators
      for (const op of operators) {
        if (remaining.startsWith(op)) {
          parts.push(
            <span key={`${lineIdx}-op-${tokenIdx}`} className="text-sky-400">
              {op}
            </span>
          );
          remaining = remaining.slice(op.length);
          tokenIdx++;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // Strings / identifiers
      const identMatch = remaining.match(/^[a-zA-Z_]\w*/);
      if (identMatch) {
        const ident = identMatch[0];
        const isSignal = ["aclk", "aresetn", "tvalid", "tready", "clk", "rst_n",
          "fifo_full", "write_en", "overflow_err", "fifo_we", "pclk", "presetn",
          "psel", "penable", "pready", "pslverr"].includes(ident);
        parts.push(
          <span
            key={`${lineIdx}-id-${tokenIdx}`}
            className={isSignal ? "text-emerald-400" : "text-zinc-200"}
          >
            {ident}
          </span>
        );
        remaining = remaining.slice(ident.length);
        tokenIdx++;
        continue;
      }

      // Numbers
      const numMatch = remaining.match(/^\d+/);
      if (numMatch) {
        parts.push(
          <span key={`${lineIdx}-num-${tokenIdx}`} className="text-amber-400">
            {numMatch[0]}
          </span>
        );
        remaining = remaining.slice(numMatch[0].length);
        tokenIdx++;
        continue;
      }

      // String literals
      if (remaining.startsWith('"')) {
        const end = remaining.indexOf('"', 1);
        const str = end === -1 ? remaining : remaining.slice(0, end + 1);
        parts.push(
          <span key={`${lineIdx}-str-${tokenIdx}`} className="text-orange-400">
            {str}
          </span>
        );
        remaining = remaining.slice(str.length);
        tokenIdx++;
        continue;
      }

      // Default: single char
      parts.push(<span key={`${lineIdx}-ch-${tokenIdx}`} className="text-zinc-400">{remaining[0]}</span>);
      remaining = remaining.slice(1);
      tokenIdx++;
    }

    return <div key={lineIdx} className="select-text">{parts}</div>;
  });
}

export default function HeroWorkbenchMockup() {
  const [activeProtocol, setActiveProtocol] = useState<string>("axi4");
  const [copied, setCopied] = useState(false);

  const protocol = PROTOCOLS.find((p) => p.id === activeProtocol)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(protocol.sva);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(135deg, #111115 0%, #18181b 100%)",
        boxShadow: "0 0 0 1px rgba(0,102,255,0.08), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,102,255,0.06)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <div className="flex-1 flex justify-center">
          <span className="text-[11px] text-zinc-500 font-mono tracking-wide">
            SPEC2ASSERT_SYNTHESIS_ENGINE · v1.2.0
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
        </div>
      </div>

      {/* Main content: split pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 min-h-[320px]">
        {/* Left: Input */}
        <div className="flex flex-col">
          <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
              Protocol Specification
            </span>
          </div>

          {/* Protocol selector tabs */}
          <div className="flex border-b border-white/5">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProtocol(p.id)}
                className={`flex-1 py-2 text-[11px] font-mono tracking-wide transition-all ${
                  activeProtocol === p.id
                    ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-500"
                    : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Spec text display */}
          <div className="flex-1 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "rgba(0,102,255,0.15)", color: "#60a5fa", border: "1px solid rgba(0,102,255,0.2)" }}
              >
                {protocol.tag}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{protocol.ruleName}</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {protocol.spec}
            </p>
            <div className="mt-auto flex items-center gap-2 pt-3 border-t border-white/5">
              <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-[11px] text-blue-400 font-mono">Synthesizing formal property...</span>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col">
          <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
              formal_sva.sv
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-0.5 rounded hover:bg-white/5"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="font-mono">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Code with line numbers */}
          <div className="flex-1 p-0 overflow-auto" style={{ background: "rgba(0,0,0,0.3)" }}>
            <table className="w-full text-[12px] font-mono leading-5">
              <tbody>
                {protocol.sva.split("\n").map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="w-8 text-right pr-3 pl-4 py-0.5 text-zinc-600 select-none border-r border-white/5">
                      {idx + 1}
                    </td>
                    <td className="pl-4 pr-4 py-0.5">
                      {line.startsWith("//") ? (
                        <span className="text-zinc-500">{line}</span>
                      ) : (
                        highlightSVA(line)[0]
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status strip */}
          <div
            className="px-4 py-2 border-t border-white/5 flex items-center justify-between"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AST: 100% VALIDATED
              </span>
              <span className="text-zinc-500">TEMP: 0.0T</span>
              <span className="text-zinc-500">LATENCY: {protocol.latency}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">DETERMINISTIC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
