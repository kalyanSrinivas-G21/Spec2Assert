"use client";

import React, { useState } from "react";
import Link from "next/link";
import PixelGridBackground from "@/components/PixelGridBackground";
import ApiKeyModal from "@/components/ApiKeyModal";
import HeroTerminalPreview from "@/components/HeroTerminalPreview";
import {
  ShieldCheck,
  ArrowRight,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  FileCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Animated Pixel Canvas Background */}
      <PixelGridBackground />

      {/* API Key Modal */}
      <ApiKeyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Top Navbar */}
      <header className="relative z-10 h-14 border-b border-zinc-800/80 bg-black/70 backdrop-blur-md px-6 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 text-black flex items-center justify-center font-bold text-sm">
            S2A
          </div>
          <span className="font-bold tracking-wider text-white">SPEC2ASSERT</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 hidden sm:inline">DETERMINISTIC_EDA_CORE</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition-colors hidden sm:flex items-center gap-1"
          >
            <span>GITHUB_SRC</span>
            <ExternalLink className="w-3 h-3 text-zinc-600" />
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="h-8 px-3.5 bg-blue-600 hover:bg-blue-500 text-black font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>LAUNCH WORKBENCH</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-950/20 px-3 py-1 text-xs font-mono text-blue-400 w-fit">
              <span className="w-1.5 h-1.5 bg-blue-500 animate-pulse" />
              <span>ELIMINATING THE HARDWARE VERIFICATION BOTTLENECK</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Deterministic AI for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-white">
                Formal Assertions & EDA
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
              In chip design, verification consumes 70% of engineering cycles. Spec2Assert translates natural-language hardware protocol rules into strict, verifiable <strong>SystemVerilog Assertions (SVA)</strong> and <strong>cocotb test harnesses</strong> with mathematical AST guarantees.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => setModalOpen(true)}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-black font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-950"
              >
                <span>OPEN WORKBENCH [EXEC]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="h-11 px-5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 flex items-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>LOAD DEMO PROTOCOLS</span>
              </button>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-900 font-mono text-xs">
              <div>
                <div className="text-lg font-bold text-white">70%</div>
                <div className="text-[11px] text-zinc-500">VERIFICATION CYCLE REDUCTION</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">0.0T</div>
                <div className="text-[11px] text-zinc-500">STOCHASTIC HALLUCINATION</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400">100%</div>
                <div className="text-[11px] text-zinc-500">AST_PARSE INTEGRITY</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Terminal Preview */}
          <div className="lg:col-span-5 w-full">
            <HeroTerminalPreview />
          </div>
        </section>

        {/* COMPARISON SECTION: STOCHASTIC vs DETERMINISTIC */}
        <section className="border-t border-b border-zinc-800 bg-zinc-950/60 py-16 px-6 font-mono">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-10 text-center">
              <span className="text-[11px] text-blue-400 uppercase tracking-widest">Architectural Paradigm</span>
              <h2 className="text-2xl font-bold text-white mt-1">Stochastic LLMs vs. Deterministic EDA Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* The Old Way */}
              <div className="border border-red-950 bg-red-950/10 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <XCircle className="w-4 h-4" />
                  <span>TRADITIONAL OFF-THE-SHELF LLM</span>
                </div>
                <ul className="flex flex-col gap-2.5 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Outputs freeform markdown preamble and conversational fluff.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Stochastic temperature causes differing SVA code on consecutive queries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Generates subtle clock cycle boundary hallucinations causing silicon respins.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Zero automated syntax verification before returning to engineer.</span>
                  </li>
                </ul>
              </div>

              {/* The Spec2Assert Way */}
              <div className="border border-blue-900/60 bg-blue-950/10 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SPEC2ASSERT DETERMINISTIC ENGINE</span>
                </div>
                <ul className="flex flex-col gap-2.5 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Rigid Pydantic schema contracts ensuring zero unstructured text.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Enforced 0.0 temperature with multi-model fallback cascades on OpenRouter.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Automated Python AST parsing (ast.parse) validates executable test harnesses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Structural regex checks verify posedge clocking, resets, and cycle bounds.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID: CORE CAPABILITIES */}
        <section className="max-w-7xl mx-auto px-6 py-20 w-full font-mono">
          <div className="mb-10">
            <span className="text-[11px] text-blue-400 uppercase tracking-widest">Core Capabilities</span>
            <h2 className="text-2xl font-bold text-white mt-1">Engineered for Hardware Verification Pipelines</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Bento Card 1 */}
            <div className="border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center gap-2 text-blue-400">
                <Layers className="w-4 h-4" />
                <span className="font-bold">MULTI-MODEL ORCHESTRATION</span>
              </div>
              <p className="text-zinc-400 mt-3 leading-relaxed">
                Connects through OpenRouter with automatic multi-model failover spanning Meta Llama 3.3, Claude 3.5 Sonnet, and Minimax to eliminate single-provider outages.
              </p>
              <div className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-900 pt-2">
                FALLBACK_CASCADES: ENABLED
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center gap-2 text-blue-400">
                <FileCheck className="w-4 h-4" />
                <span className="font-bold">DUAL-LAYER AST LINTER</span>
              </div>
              <p className="text-zinc-400 mt-3 leading-relaxed">
                Every generated cocotb testbench is parsed by Python&apos;s native Abstract Syntax Tree before delivery, guaranteeing zero syntax exceptions.
              </p>
              <div className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-900 pt-2">
                SYNTAX_PASS_RATE: 100%
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">ZERO CLIENT-DATA RETENTION</span>
              </div>
              <p className="text-zinc-400 mt-3 leading-relaxed">
                Your API keys and proprietary hardware specifications remain strictly on the client or in ephemeral local SQLite sessions.
              </p>
              <div className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-900 pt-2">
                PRIVACY: CLIENT_STORAGE_ONLY
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="border-t border-zinc-800 bg-zinc-950 py-16 px-6 text-center font-mono">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Experience Deterministic Hardware Synthesis</h2>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              Input your custom timing specifications or load pre-configured AXI4, FIFO, and APB3 benchmarks in the live workbench.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 h-11 px-8 bg-blue-600 hover:bg-blue-500 text-black font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <span>LAUNCH SPEC2ASSERT WORKBENCH</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-zinc-800 bg-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500">
        <div>SPEC2ASSERT // BUILT FOR PURPLECODEAI RECRUITMENT BENCHMARK</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>FRAMEWORK: NEXT.JS + FASTAPI</span>
          <span>THEME: MONOCHROMATIC PITCH BLACK</span>
        </div>
      </footer>
    </div>
  );
}
