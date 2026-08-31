"use client";

import React, { useState } from "react";
import Link from "next/link";
import ApiKeyModal from "@/components/ApiKeyModal";
import HeroWorkbenchMockup from "@/components/HeroWorkbenchMockup";
import HeroAnimation from "@/components/HeroAnimation";
import {
  ArrowRight,
  Play,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Activity,
  Network,
} from "lucide-react";

// ─── Architecture Pipeline Step ─────────────────────────────────────────────
interface PipelineStep {
  num: string;
  title: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
}

const PIPELINE: PipelineStep[] = [
  {
    num: "01",
    title: "Natural Language Spec",
    description: "Ingests interface timing rules written in plain English from protocol specification documents.",
    detail: "INPUT_PARSER",
    icon: <GitBranch className="w-5 h-5" />,
  },
  {
    num: "02",
    title: "Pydantic AI Schema",
    description: "Forces strict typed JSON output contracts, eliminating all conversational fluff and unstructured markdown.",
    detail: "SCHEMA_ENFORCE",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    num: "03",
    title: "Deterministic AST Linter",
    description: "Compiles and parses every Python cocotb testbench through native Python ast.parse() before delivery.",
    detail: "AST_VALIDATE",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    num: "04",
    title: "Formal SVA Synthesis",
    description: "Emits clocked SystemVerilog Assertions with posedge timing, disable iff reset guards, and cycle bounds.",
    detail: "SVA_EMIT",
    icon: <Zap className="w-5 h-5" />,
  },
];

// ─── Bento Card: Digital Timing Waveform ─────────────────────────────────────
function TimingWaveCard() {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 h-full"
      style={{
        background: "linear-gradient(135deg, #111115 0%, #18181b 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
            Digital Timing Analyzer
          </h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Real-time clock-edge monitoring with antecedent trigger detection and assertion capture points.
        </p>
      </div>

      {/* Animated SVG Waveform */}
      <div
        className="rounded-lg p-3 overflow-hidden"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="text-[10px] font-mono text-zinc-500 mb-2 flex justify-between">
          <span>DIGITAL_TIMING_TRACE</span>
          <span>CH1·CH2·CH3</span>
        </div>
        <svg viewBox="0 0 260 72" className="w-full" style={{ height: 72 }}>
          {/* Grid lines */}
          {[18, 36, 54].map((y) => (
            <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {[52, 104, 156, 208].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="72" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}

          {/* CLK */}
          <text x="2" y="9" fontSize="7" fill="rgba(148,163,184,0.6)" fontFamily="monospace">CLK</text>
          <path
            d="M28,6 L28,14 L40,14 L40,6 L52,6 L52,14 L64,14 L64,6 L76,6 L76,14 L88,14 L88,6 L100,6 L100,14 L112,14 L112,6 L124,6 L124,14 L136,14 L136,6 L148,6 L148,14 L160,14 L160,6 L172,6 L172,14 L184,14 L184,6 L196,6 L196,14 L208,14 L208,6 L220,6 L220,14 L232,14 L232,6 L244,6 L244,14 L256,14"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />

          {/* VALID */}
          <text x="2" y="33" fontSize="7" fill="rgba(148,163,184,0.6)" fontFamily="monospace">VALID</text>
          <path
            d="M28,36 L64,36 L64,28 L148,28 L148,36 L256,36"
            fill="none"
            stroke="#818cf8"
            strokeWidth="1.5"
          />

          {/* ASSERT */}
          <text x="2" y="57" fontSize="7" fill="rgba(148,163,184,0.6)" fontFamily="monospace">ASSERT</text>
          <path
            d="M28,60 L112,60 L112,52 L172,52 L172,60 L256,60"
            fill="none"
            stroke="#34d399"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Capture marker */}
          <line x1="112" y1="26" x2="112" y2="66" stroke="rgba(251,191,36,0.5)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="112" cy="52" r="3" fill="#fbbf24" opacity="0.8" />
        </svg>
        <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono">
          <span className="flex items-center gap-1 text-blue-400"><span className="w-3 border-t-2 border-blue-400 inline-block" />CLK</span>
          <span className="flex items-center gap-1 text-indigo-400"><span className="w-3 border-t-2 border-indigo-400 inline-block" />VALID</span>
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-3 border-t border-emerald-400 border-dashed inline-block" />ASSERT</span>
        </div>
      </div>

      <div className="text-[10px] font-mono text-zinc-500">
        SAMPLE_RATE: 14.2 kHz · CAPTURE: ENABLED
      </div>
    </div>
  );
}

// ─── Bento Card: AST Linter ───────────────────────────────────────────────────
function ASTLinterCard() {
  const checks = [
    { label: "ast.parse(python_stub)", status: "PASS", color: "text-emerald-400" },
    { label: "posedge_clk_present", status: "PASS", color: "text-emerald-400" },
    { label: "disable_iff_reset", status: "PASS", color: "text-emerald-400" },
    { label: "cycle_bound_##N", status: "PASS", color: "text-emerald-400" },
    { label: "markdown_fence_detected", status: "NONE", color: "text-zinc-500" },
  ];

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 h-full"
      style={{
        background: "linear-gradient(135deg, #111115 0%, #18181b 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
            Dual-Layer AST Validation
          </h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Every generated cocotb testbench passes Python&apos;s native abstract syntax tree parser before delivery.
        </p>
      </div>

      <div
        className="rounded-lg overflow-hidden flex-1"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="text-[10px] font-mono text-zinc-500 px-3 py-2 border-b border-white/5 flex justify-between">
          <span>LINTER_REPORT</span>
          <span className="text-emerald-400">5/5 PASS</span>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-mono text-zinc-300">{c.label}</span>
              <span className={`text-[10px] font-mono font-semibold ${c.color}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] font-mono text-zinc-500">
        SYNTAX_PASS_RATE: 100% · TEMP: 0.0T
      </div>
    </div>
  );
}

// ─── Bento Card: Multi-Model Orchestration ─────────────────────────────────────
function ModelOrchestrationCard() {
  const models = [
    { name: "nvidia/nemotron-3.5", badge: "PRIMARY", latency: "1.2s", status: "ACTIVE", color: "text-emerald-400", dot: "bg-emerald-500" },
    { name: "google/gemma-4-31b", badge: "FALLBACK_1", latency: "1.8s", status: "STANDBY", color: "text-zinc-400", dot: "bg-zinc-600" },
    { name: "minimax/m3.1-flash", badge: "FALLBACK_2", latency: "2.1s", status: "STANDBY", color: "text-zinc-400", dot: "bg-zinc-600" },
    { name: "cohere/north-mini", badge: "FALLBACK_3", latency: "1.5s", status: "STANDBY", color: "text-zinc-400", dot: "bg-zinc-600" },
  ];

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 h-full"
      style={{
        background: "linear-gradient(135deg, #111115 0%, #18181b 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
            Multi-Model Failover
          </h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Automatic cascade across OpenRouter models eliminates single-provider dependency and rate-limit failures.
        </p>
      </div>

      <div
        className="rounded-lg overflow-hidden flex-1"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="text-[10px] font-mono text-zinc-500 px-3 py-2 border-b border-white/5 flex justify-between">
          <span>OPENROUTER_CASCADE</span>
          <span className="text-blue-400">FREE_TIER</span>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {models.map((m) => (
            <div key={m.name} className="flex items-center gap-2 px-3 py-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
              <span className="text-[11px] font-mono text-zinc-300 flex-1 truncate">{m.name}</span>
              <span className={`text-[10px] font-mono ${m.color}`}>{m.latency}</span>
              <span
                className="text-[9px] font-mono px-1 py-0.5 rounded"
                style={{
                  background: m.status === "ACTIVE" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                  color: m.status === "ACTIVE" ? "#34d399" : "#52525b",
                  border: m.status === "ACTIVE" ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] font-mono text-zinc-500">
        FALLBACK_CASCADES: ENABLED · VENDOR_LOCK: NONE
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col text-zinc-100 selection:bg-blue-600 selection:text-white"
      style={{ background: "#09090b" }}
    >
      <ApiKeyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className="relative z-20 flex items-center justify-between px-6 h-14"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.8)", backdropFilter: "blur(12px)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 flex items-center justify-center text-[11px] font-bold text-black rounded-md"
            style={{ background: "linear-gradient(135deg, #0066FF 0%, #3b82f6 100%)" }}
          >
            S2A
          </div>
          <span className="text-sm font-semibold text-zinc-100 tracking-tight">Spec2Assert</span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded hidden sm:inline"
            style={{ background: "rgba(0,102,255,0.12)", color: "#60a5fa", border: "1px solid rgba(0,102,255,0.2)" }}
          >
            CORE_v1.2
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#architecture" className="hover:text-zinc-100 transition-colors">Architecture</a>
          <a href="#capabilities" className="hover:text-zinc-100 transition-colors">Capabilities</a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-100 transition-colors flex items-center gap-1"
          >
            OpenAPI Docs <ExternalLink className="w-3 h-3 text-zinc-600" />
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-8 text-sm font-medium text-white rounded-md transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: "linear-gradient(135deg, #0066FF 0%, #2563eb 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 8px rgba(0,102,255,0.3)",
            }}
          >
            Open Studio
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero wrapper: relative container so animation is scoped to hero only */}
        <div className="relative overflow-hidden">
          {/* Signal-to-Assertion synthesis animation — behind all content */}
          <HeroAnimation />

          {/* Ambient electric-blue top glow — sits above animation, below content */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{
              height: "65%",
              zIndex: 1,
              background:
                "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,102,255,0.11), transparent 75%)",
            }}
          />

          <section className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-16 pb-20 flex flex-col items-center gap-8 text-center">
          {/* Announcement pill */}
          <a
            href="#architecture"
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs text-blue-400 transition-all hover:border-blue-500/30"
            style={{ border: "1px solid rgba(0,102,255,0.2)", background: "rgba(0,102,255,0.08)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Spec2Assert v1.2 Released · Deterministic Hardware Synthesis
            <ChevronRight className="w-3 h-3" />
          </a>

          {/* Headline */}
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Deterministic Formal Assertions
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f0f9ff 100%)" }}
              >
                for Modern Silicon
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Transform natural-language hardware protocol rules into mathematically verified SystemVerilog Assertions (SVA) and executable cocotb test suites with zero stochastic hallucination.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 h-10 text-sm font-semibold text-white rounded-md transition-all hover:brightness-110 active:brightness-90"
              style={{
                background: "linear-gradient(135deg, #0066FF 0%, #2563eb 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 16px rgba(0,102,255,0.25)",
              }}
            >
              Launch Live Studio ↗
            </button>
            <a
              href="#capabilities"
              className="flex items-center gap-2 px-5 h-10 text-sm font-medium text-zinc-300 rounded-md transition-all hover:text-zinc-100 hover:bg-zinc-800"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(24,24,27,0.6)", backdropFilter: "blur(8px)" }}
            >
              <Play className="w-3.5 h-3.5 text-blue-400" />
              Explore Pre-Compiled Benchmarks ↓
            </a>
          </div>

          {/* Hero interactive IDE mockup */}
          <div className="w-full max-w-5xl mt-4">
            <HeroWorkbenchMockup />
          </div>

          {/* Trust metrics row */}
          <div
            className="w-full max-w-3xl grid grid-cols-3 divide-x divide-white/5 rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,17,21,0.8)" }}
          >
            {[
              { value: "70%", label: "Verification Cycle Reduction", color: "text-white" },
              { value: "0.0T", label: "Stochastic Hallucination Rate", color: "text-blue-400" },
              { value: "100%", label: "AST Parse Integrity Score", color: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="py-5 flex flex-col items-center gap-1">
                <span className={`text-2xl font-bold tracking-tight ${m.color}`}>{m.value}</span>
                <span className="text-xs text-zinc-500 text-center px-2 leading-snug">{m.label}</span>
              </div>
            ))}
          </div>
        </section>
        </div>{/* end hero wrapper */}

        {/* ── Architecture Pipeline ──────────────────────────────────────────── */}
        <section
          id="architecture"
          className="py-20 px-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,17,21,0.6)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">How It Works</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                Deterministic Synthesis Pipeline
              </h2>
              <p className="mt-3 text-zinc-400 leading-relaxed max-w-xl mx-auto">
                Four-stage automated pipeline that converts imprecise natural language into silicon-grade formal verification properties.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PIPELINE.map((step, i) => (
                <div key={step.num} className="relative flex flex-col">
                  {/* Connector line */}
                  {i < PIPELINE.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-8 left-full w-full z-10"
                      style={{ transform: "translateX(-50%)" }}
                    >
                      <div
                        className="h-px w-full"
                        style={{ background: "linear-gradient(90deg, rgba(0,102,255,0.3), rgba(0,102,255,0.1))" }}
                      />
                    </div>
                  )}

                  <div
                    className="rounded-xl p-5 flex flex-col gap-3 h-full"
                    style={{
                      background: "linear-gradient(135deg, #111115 0%, #18181b 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Step number + icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-zinc-800 leading-none">{step.num}</span>
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-400"
                        style={{ background: "rgba(0,102,255,0.12)", border: "1px solid rgba(0,102,255,0.2)" }}
                      >
                        {step.icon}
                      </div>
                    </div>

                    <div>
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#60a5fa" }}
                      >
                        {step.detail}
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-100 mt-0.5 tracking-tight">{step.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bento Grid ────────────────────────────────────────────────────── */}
        <section id="capabilities" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Core Capabilities</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                Engineered for Hardware Verification
              </h2>
              <p className="mt-3 text-zinc-400 leading-relaxed max-w-xl">
                Each component is purpose-built for the EDA verification workflow, not adapted from generic AI templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TimingWaveCard />
              <ASTLinterCard />
              <ModelOrchestrationCard />
            </div>
          </div>
        </section>

        {/* ── CTA Section ───────────────────────────────────────────────────── */}
        <section
          className="py-20 px-6 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,17,21,0.6)" }}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-400"
              style={{ background: "rgba(0,102,255,0.12)", border: "1px solid rgba(0,102,255,0.2)" }}
            >
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Experience Deterministic Hardware Synthesis
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Input your custom timing specifications or load pre-configured AXI4, FIFO, and APB3 benchmarks in the live workbench.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-6 h-10 text-sm font-semibold text-white rounded-md transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #0066FF 0%, #2563eb 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 16px rgba(0,102,255,0.25)",
                }}
              >
                Launch Spec2Assert Studio
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                href="/workbench?mode=demo"
                className="flex items-center gap-2 px-5 h-10 text-sm font-medium text-zinc-300 rounded-md transition-all hover:text-zinc-100 hover:bg-zinc-800"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(24,24,27,0.6)" }}
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Try Demo Mode
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#09090b" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 flex items-center justify-center text-[9px] font-bold text-black rounded"
            style={{ background: "#0066FF" }}
          >
            S2A
          </div>
          <span>Spec2Assert · Deterministic AI Hardware Assertion Workbench</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Next.js 16</span>
          <span className="text-zinc-700">·</span>
          <span>FastAPI</span>
          <span className="text-zinc-700">·</span>
          <span>Pydantic AI</span>
        </div>
      </footer>
    </div>
  );
}
