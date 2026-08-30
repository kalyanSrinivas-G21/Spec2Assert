"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CodeTabs from "@/components/CodeTabs";
import CompilationProgress from "@/components/CompilationProgress";
import ApiKeyModal from "@/components/ApiKeyModal";
import {
  generateAssertion,
  getHistory,
  getHistoryItem,
  AssertionResult,
  HistoryItem,
} from "@/lib/api";
import {
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  History,
  KeyRound,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const PROTOCOL_TEMPLATES = [
  {
    tag: "AXI4-STREAM",
    label: "AXI4 Handshake Latency",
    spec: "When TVALID is asserted high, TREADY must be asserted within 3 clock cycles. TVALID must remain high until handshake occurs.",
  },
  {
    tag: "FIFO-CTL",
    label: "FIFO Overflow Guard",
    spec: "When fifo_full is asserted, any write_en pulse must trigger overflow_err on the next clock cycle with fifo_we suppressed.",
  },
  {
    tag: "APB-BRIDGE",
    label: "APB Transfer Timeout",
    spec: "If PSEL and PENABLE are asserted high while PREADY remains low for more than 16 cycles, PSLVERR must assert high.",
  },
];

function WorkbenchContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("mode") === "demo";

  const [spec, setSpec] = useState(PROTOCOL_TEMPLATES[0].spec);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AssertionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  // Load history on initial mount
  useEffect(() => {
    refreshHistory();
  }, []);

  // Segmented block progression simulation while loading
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, Math.floor((elapsed / 2400) * 92));
      setProgress(pct);
    }, 60);

    return () => clearInterval(interval);
  }, [loading]);

  const refreshHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch {
      // Backend may be offline during initial load
    }
  };

  const handleCompile = async () => {
    if (!spec.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const data = await generateAssertion(spec, isDemo);
      setResult(data);
      await refreshHistory();
    } catch (err: any) {
      setError(err.message || "Compilation failed. Ensure backend engine is online or enter an API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleCompile();
    }
  };

  const handleSelectHistory = async (id: number) => {
    setError(null);
    try {
      const item = await getHistoryItem(id);
      setResult(item);
      if (item.spec) {
        setSpec(item.spec);
      }
    } catch (err: any) {
      setError(`Failed to retrieve history item #${id}: ${err.message}`);
    }
  };

  const filledBlocks = Math.floor((progress / 100) * 10);
  const progressBlocks = "■".repeat(filledBlocks) + "□".repeat(10 - filledBlocks);

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 font-sans">
      <Navbar isSynthesizing={loading} />

      {/* API Key Modal for user adjustment */}
      <ApiKeyModal isOpen={keyModalOpen} onClose={() => setKeyModalOpen(false)} />

      {/* Workbench Subheader / Mode Indicator */}
      <div className="h-9 border-b border-zinc-800 bg-zinc-950/80 px-4 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT_TO_LANDING</span>
          </Link>
          <span className="text-zinc-700">|</span>
          {isDemo ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>MODE: OFFLINE_DEMO_FIXTURES</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span>MODE: LIVE_OPENROUTER_INFERENCE</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setKeyModalOpen(true)}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-blue-400 border border-zinc-800 bg-zinc-900 px-2 py-0.5 transition-colors"
        >
          <KeyRound className="w-3 h-3 text-blue-500" />
          <span>CONFIG_API_KEY</span>
        </button>
      </div>

      {/* Main Split-Pane Workbench */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-zinc-800">
        {/* Left Column: Input Terminal & Templates (5 Columns) */}
        <section className="lg:col-span-5 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            {/* Header Tag */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 ${loading ? "bg-blue-400 animate-ping" : "bg-blue-500"}`}
                />
                INPUT_INTERFACE_SPECIFICATION
              </span>
              <span className="text-[11px] font-mono text-zinc-500">FORMAT: NATURAL_TEXT</span>
            </div>

            {/* Template Selector */}
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase">
                Load Standard EDA Template:
              </span>
              <div className="grid grid-cols-1 gap-1.5 mt-1.5">
                {PROTOCOL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.tag}
                    onClick={() => setSpec(tmpl.spec)}
                    className="flex items-center justify-between border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 hover:bg-zinc-900 p-2 text-left transition-colors font-mono text-xs"
                  >
                    <span className="text-zinc-200">{tmpl.label}</span>
                    <span className="text-[10px] bg-zinc-800 text-blue-400 px-1.5 py-0.5 border border-zinc-700">
                      {tmpl.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spec Textarea with Scanning Laser Overlay */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>NATURAL_LANGUAGE_PROTOCOL_RULE</span>
                <span className="text-zinc-500 text-[10px]">SHORTCUT: ⌘+ENTER</span>
              </label>
              <div className="relative overflow-hidden">
                <textarea
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe clock signals, reset behavior, and timing dependencies..."
                  className={`w-full h-44 bg-black border ${
                    loading
                      ? "border-blue-500/80 shadow-[0_0_15px_rgba(0,102,255,0.15)]"
                      : "border-zinc-800 focus:border-blue-500"
                  } rounded-none p-3 text-xs font-mono text-zinc-200 resize-none outline-none leading-relaxed transition-colors`}
                />
                {loading && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent pointer-events-none animate-pulse top-2" />
                )}
              </div>
            </div>

            {/* Compile Action Button with Segmented Block Progress */}
            <button
              onClick={handleCompile}
              disabled={loading || !spec.trim()}
              className={`h-10 ${
                loading
                  ? "bg-blue-600/90 text-black cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black"
              } font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors select-none`}
            >
              {loading ? (
                <span className="tracking-wider">
                  [{progressBlocks}] SYNTHESIZING_AST ({progress}%)
                </span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>COMPILE FORMAL PROPERTY [EXEC]</span>
                </>
              )}
            </button>

            {error && (
              <div className="border border-red-900 bg-red-950/40 text-red-400 text-xs font-mono p-2.5">
                [ERROR]: {error}
              </div>
            )}
          </div>

          {/* Bottom Historical Sessions List */}
          <div className="border-t border-zinc-800 pt-3 mt-4">
            <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 mb-2">
              <History className="w-3.5 h-3.5" />
              SESSION_LOGS ({history.length})
            </span>
            <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleSelectHistory(h.id)}
                  className="flex items-center justify-between p-1.5 border border-zinc-900 hover:border-zinc-700 bg-black text-left font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <span className="truncate max-w-[220px]">{h.rule_name}</span>
                  <span className={h.passed ? "text-emerald-500" : "text-amber-500"}>
                    {h.passed ? "AST:OK" : "AST:WARN"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Output Instrumentation & Verification Viewer (7 Columns) */}
        <section className="lg:col-span-7 bg-black p-4 flex flex-col gap-3 min-h-[550px]">
          {loading ? (
            <CompilationProgress />
          ) : result ? (
            <div className="flex-1 flex flex-col gap-3">
              {/* Telemetry Header Badges */}
              <div className="border border-zinc-800 bg-zinc-950 p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <div className="text-zinc-500 text-[10px]">RULE_IDENTIFIER</div>
                  <div className="text-blue-400 font-bold text-sm tracking-wide">
                    {result.rule_name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="border-l border-zinc-800 pl-3">
                    <div className="text-zinc-500 text-[10px]">CLK_DOMAIN</div>
                    <div className="text-zinc-200 font-semibold">{result.clock}</div>
                  </div>
                  <div className="border-l border-zinc-800 pl-3">
                    <div className="text-zinc-500 text-[10px]">RESET_GUARD</div>
                    <div className="text-zinc-200 font-semibold">{result.reset}</div>
                  </div>
                  <div className="border-l border-zinc-800 pl-3">
                    <div className="text-zinc-500 text-[10px]">MAX_LATENCY</div>
                    <div className="text-amber-400 font-semibold">
                      {result.max_latency_cycles} CYCLES
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitored Signals Bar */}
              <div className="border border-zinc-800 bg-zinc-950 px-3 py-2 flex items-center gap-2 font-mono text-xs">
                <span className="text-zinc-500 text-[11px]">INTERFACED_SIGNALS:</span>
                <div className="flex flex-wrap gap-1">
                  {result.monitored_signals.map((sig) => (
                    <span
                      key={sig}
                      className="border border-zinc-800 bg-black text-blue-400 px-1.5 py-0.5 text-[11px]"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Viewer (SVA + cocotb) */}
              <CodeTabs svaCode={result.formal_sva} pythonCode={result.python_test_stub} />

              {/* Validation Status Checklist */}
              <div className="border border-zinc-800 bg-zinc-950 p-2.5 flex items-center justify-between font-mono text-[11px]">
                <span className="text-zinc-500">DETERMINISTIC_CHECKS:</span>
                <div className="flex items-center gap-4">
                  <span
                    className={`flex items-center gap-1 ${
                      result.checks?.python_stub_parses !== false
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {result.checks?.python_stub_parses !== false ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}{" "}
                    AST_PARSE
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      result.checks?.cycle_bound_present !== false
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {result.checks?.cycle_bound_present !== false ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}{" "}
                    SVA_BOUNDS
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      result.checks?.has_reset_disable !== false
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {result.checks?.has_reset_disable !== false ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}{" "}
                    RESET_DISABLE
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center font-mono">
              <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-xs text-zinc-300 font-semibold uppercase tracking-wider">
                NO COMPILED PROPERTY IN MEMORY
              </div>
              <p className="text-[11px] text-zinc-500 max-w-sm mt-1 leading-relaxed">
                Load a protocol template on the left panel or input your custom timing rules, then
                execute compilation via ⌘+Enter.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Low-Profile Workbench Status Bar */}
      <footer className="h-7 border-t border-zinc-800 bg-black px-4 flex items-center justify-between font-mono text-[11px] text-zinc-500 select-none">
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-4 text-blue-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 animate-ping" />
                SAMPLING: 14.2 kHz
              </span>
              <span>SVA_LATENCY: {(progress * 2.4).toFixed(0)}ms</span>
              <span>MEM_BUS: ACTIVE_CAPTURE</span>
            </div>
          ) : (
            <>
              <span>PORT: 8000</span>
              <span>CORS: ENABLED</span>
              <span>FRAMEWORK: FASTAPI + PYDANTIC_AI</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>TARGET: ASIC / SYSTEMVERILOG</span>
          <span className={loading ? "text-blue-400 font-semibold animate-pulse" : "text-zinc-400"}>
            {loading ? "SYNTHESIS PIPELINE ACTIVE" : "SPEC2ASSERT SYSTEM ACTIVE"}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function WorkbenchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-mono text-xs">
          INITIALIZING_EDA_WORKBENCH...
        </div>
      }
    >
      <WorkbenchContent />
    </Suspense>
  );
}
