"use client";

import React from "react";
import { History, CheckCircle2, XCircle, ChevronRight, Clock } from "lucide-react";
import { HistoryItem } from "@/lib/api";

interface HistoryListProps {
  history: HistoryItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export function HistoryList({ history, selectedId, onSelect, isLoading }: HistoryListProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Recent Compilations
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          {history.length} {history.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {isLoading && history.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500 animate-pulse">
          Loading history from SQLite...
        </div>
      ) : history.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500">
          No compilations recorded yet. Run a compilation above.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
          {history.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-200"
                    : "bg-zinc-950/50 hover:bg-zinc-900 border-zinc-800/60 text-zinc-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-semibold truncate text-zinc-200">
                      {item.rule_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">{item.spec}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{item.created_at?.split(" ")[1] ?? item.created_at}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
