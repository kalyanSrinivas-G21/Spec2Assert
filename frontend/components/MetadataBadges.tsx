"use client";

import React from "react";
import { Clock, RotateCcw, Timer, Activity, Info, Tag } from "lucide-react";
import { AssertionResult } from "@/lib/api";

interface MetadataBadgesProps {
  result: AssertionResult;
}

export function MetadataBadges({ result }: MetadataBadgesProps) {
  return (
    <div className="space-y-4">
      {/* Rule header & explanation */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span className="font-mono font-semibold text-sm text-indigo-300">
              {result.rule_name}
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            ID: #{result.id ?? "pending"}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/50">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-zinc-200">Silicon Bug Prevention: </span>
            <span className="text-zinc-400">{result.explanation}</span>
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Clock Domain</div>
            <div className="font-mono text-xs font-semibold text-zinc-200">{result.clock}</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Reset Guard</div>
            <div className="font-mono text-xs font-semibold text-zinc-200">{result.reset}</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Max Latency</div>
            <div className="font-mono text-xs font-semibold text-zinc-200">{result.max_latency_cycles} cycles</div>
          </div>
        </div>
      </div>

      {/* Monitored signals pills */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Monitored Protocol Signals
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.monitored_signals.map((sig) => (
            <span
              key={sig}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-950 border border-zinc-800 text-indigo-300 font-medium"
            >
              {sig}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
