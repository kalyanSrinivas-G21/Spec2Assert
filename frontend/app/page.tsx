"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MetadataBadges } from "@/components/MetadataBadges";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { CodeTabs } from "@/components/CodeTabs";
import { HistoryList } from "@/components/HistoryList";
import {
  AssertionResult,
  HistoryItem,
  generate,
  getHistory,
  getHistoryItem,
} from "@/lib/api";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Cpu,
  Bookmark,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

const PRESETS = [
  {
    name: "AXI4 Handshake",
    spec: "When AXI valid is asserted, ready must assert within 3 clock cycles without valid dropping.",
    tag: "Bus Protocol",
  },
  {
    name: "FIFO Overflow",
    spec: "When fifo_full is high, any write_en pulse must trigger overflow_err on the next clock cycle.",
    tag: "Queue Guard",
  },
  {
    name: "APB Timeout",
    spec: "If psel and penable are high and pready is low for more than 16 cycles, pslverr must assert.",
    tag: "Slave Bus",
  },
];

export default function Home() {
  const [spec, setSpec] = useState(PRESETS[0].spec);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssertionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const items = await getHistory();
      setHistory(items);
    } catch (err) {
      console.warn("Could not load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCompile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!spec.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await generate(spec.trim());
      setResult(data);
      setSelectedHistoryId(data.id);
      await fetchHistory();
    } catch (err: any) {
      setError(err?.message || "Failed to compile specification into assertions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (id: number) => {
    setSelectedHistoryId(id);
    setError(null);
    try {
      const item = await getHistoryItem(id);
      setResult(item);
      if (item.spec) {
        setSpec(item.spec); // Restores the exact original user input
      }
    } catch (err: any) {
      setError(`Failed to load compilation #${id}: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-600/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Cold Start Banner for Free Hosting */}
        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Hardware Verification Pipeline:</strong> Pydantic AI structured generation + AST parsing + deterministic validation checks.
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-indigo-400/80">
            Render / Vercel Stack
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 flex items-start gap-3 text-sm text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Compilation Error</p>
              <p className="text-xs text-rose-300/90 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input, Presets, Compile Button, History List (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Input Card */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Natural-Language Protocol Rule
                </label>
                <p className="text-xs text-zinc-500 mb-3">
                  Specify interface timings, handshake relations, or safety invariants.
                </p>

                <textarea
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  placeholder="e.g. When AXI valid is asserted, ready must assert within 3 clock cycles without valid dropping."
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs sm:text-sm font-sans text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y"
                />
              </div>

              {/* Presets */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-2">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Preset Protocol Rules</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setSpec(preset.spec)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        spec === preset.spec
                          ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-200"
                          : "bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="font-medium truncate text-zinc-200">{preset.name}</div>
                      <div className="text-[10px] text-zinc-500">{preset.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCompile()}
                disabled={loading || !spec.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-lg ${
                  loading || !spec.trim()
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling SVA & cocotb Test...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compile Assertion</span>
                  </>
                )}
              </button>
            </div>

            {/* Recent Compilations List */}
            <HistoryList
              history={history}
              selectedId={selectedHistoryId}
              onSelect={handleSelectHistory}
              isLoading={historyLoading}
            />
          </div>

          {/* Right Column: Output, Metadata, Checklist, Code Tabs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {result ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Rule Metadata and Badges */}
                <MetadataBadges result={result} />

                {/* Validation Checklist */}
                <ValidationChecklist
                  checks={result.checks || {}}
                  allPassed={result.deterministic_check_passed}
                />

                {/* Code Tabs with SystemVerilog and Cocotb Test */}
                <CodeTabs
                  svaCode={result.formal_sva}
                  cocotbCode={result.python_test_stub}
                />
              </div>
            ) : (
              /* Empty State */
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[460px]">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 shadow-inner">
                  <Cpu className="w-8 h-8 text-indigo-400/60" />
                </div>
                <h3 className="text-base font-semibold text-zinc-200">No Assertion Compiled Yet</h3>
                <p className="text-xs text-zinc-500 max-w-md mt-1.5 leading-relaxed">
                  Enter a hardware protocol rule or click one of the presets on the left, then click{" "}
                  <strong className="text-zinc-300">"Compile Assertion"</strong> to synthesize synchronous
                  SystemVerilog Assertions (SVA) and an executable Python cocotb test harness.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Pydantic AI Structured Output</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span>AST Syntax Verification</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Spec2Assert v2.0 • Built for PurpleCodeAI EDA & Verification Stack
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>Pydantic AI</span>
            <span>•</span>
            <span>Next.js + Tailwind</span>
            <span>•</span>
            <span>SQLite History</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
