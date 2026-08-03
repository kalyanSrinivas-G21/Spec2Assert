"use client";

import React from "react";
import { CheckCircle2, XCircle, Shield, AlertTriangle } from "lucide-react";

interface ValidationChecklistProps {
  checks: Record<string, boolean>;
  allPassed: boolean;
}

const CHECK_LABELS: Record<string, { label: string; desc: string }> = {
  has_property_block: {
    label: "SVA Property Block",
    desc: "Contains valid property ... endproperty encapsulation",
  },
  has_assert_property: {
    label: "Assertion Directive",
    desc: "Explicit assert property (...) invocation present",
  },
  uses_clock: {
    label: "Clock Domain Attached",
    desc: "Synchronous clock signal referenced inside event control",
  },
  has_reset_disable: {
    label: "Reset Guard (disable iff)",
    desc: "Asynchronous/synchronous reset disable clause present",
  },
  references_all_signals: {
    label: "Monitored Signals Coverage",
    desc: "Every extracted protocol signal is verified in SVA body",
  },
  cycle_bound_present: {
    label: "Deterministic Latency Bound",
    desc: "Delay constraint explicitly bounded with ##N or latency integer",
  },
  python_stub_parses: {
    label: "Python AST Parse",
    desc: "Cocotb verification stub parses strictly into valid Python AST",
  },
  cocotb_imported: {
    label: "Cocotb Runtime Harness",
    desc: "Includes cocotb library imports and async test decorator",
  },
};

export function ValidationChecklist({ checks, allPassed }: ValidationChecklistProps) {
  const checkEntries = Object.entries(checks);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Deterministic Structural Checks
          </h3>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            allPassed
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {allPassed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Checks Passed</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Verification Warnings</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checkEntries.map(([key, passed]) => {
          const info = CHECK_LABELS[key] || { label: key, desc: key };
          return (
            <div
              key={key}
              className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition-colors ${
                passed
                  ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-300"
                  : "bg-red-950/20 border-red-900/40 text-red-300"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-zinc-200">{info.label}</div>
                <div className="text-[11px] text-zinc-500 truncate">{info.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
