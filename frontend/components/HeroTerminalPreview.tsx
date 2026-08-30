"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function HeroTerminalPreview() {
  const [activeTab, setActiveTab] = useState<"sva" | "cocotb">("sva");
  const [copied, setCopied] = useState(false);

  const sampleSVA = `// Spec: AXI4-Stream Handshake Latency Guard
property p_axi4_handshake_timeout;
  @(posedge aclk) disable iff (!aresetn)
  (tvalid && !tready) |-> ##[1:4] tready;
endproperty

a_axi4_handshake_timeout: assert property(p_axi4_handshake_timeout)
  else $error("[S2A_FATAL]: tready timed out after tvalid assertion.");`;

  const samplePython = `# Cocotb Deterministic Assertion Testbench
import cocotb
from cocotb.triggers import RisingEdge

@cocotb.test()
async def test_axi4_handshake_timeout(dut):
    """Verify tready asserts within 4 cycles of tvalid."""
    dut.aresetn.value = 1
    await RisingEdge(dut.aclk)
    dut.tvalid.value = 1
    dut.tready.value = 0

    for cycle in range(5):
        await RisingEdge(dut.aclk)
        if dut.tready.value == 1:
            return  # Handshake acknowledged
    assert False, "Verification Failure: Handshake latency violated."`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === "sva" ? sampleSVA : samplePython);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full border border-zinc-800 bg-zinc-950/90 shadow-2xl font-mono text-xs overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="text-[11px] text-zinc-400 ml-2">SPEC2ASSERT_SYNTHESIS_V1.2</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("sva")}
            className={`px-2 py-0.5 text-[11px] border border-zinc-800 transition-colors ${
              activeTab === "sva" ? "bg-zinc-800 text-blue-400 border-blue-500/50" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            formal_sva.sv
          </button>
          <button
            onClick={() => setActiveTab("cocotb")}
            className={`px-2 py-0.5 text-[11px] border border-zinc-800 transition-colors ${
              activeTab === "cocotb" ? "bg-zinc-800 text-blue-400 border-blue-500/50" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            test_cocotb.py
          </button>
          <button
            onClick={handleCopy}
            className="p-1 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 bg-black/90 overflow-x-auto text-[12px] leading-5 text-zinc-300">
        <pre className="font-mono">
          <code>{activeTab === "sva" ? sampleSVA : samplePython}</code>
        </pre>
      </div>

      {/* Terminal Live Telemetry Footer */}
      <div className="h-7 bg-zinc-950 border-t border-zinc-800 px-3 flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            AST: VALIDATED
          </span>
          <span>LATENCY: 4 CLK</span>
        </div>
        <div className="text-zinc-400">INFERENCE: 0.0T DETERMINISTIC</div>
      </div>
    </div>
  );
}
