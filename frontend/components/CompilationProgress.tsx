"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Cpu, Check, Activity } from "lucide-react";
import ThinkingPolygon from "./ThinkingPolygon";

const PIPELINE_STAGES = [
  { label: "SIGNAL_BUS_EXTRACTION", detail: "Resolving port list, wires, and bus widths...", duration: 400 },
  { label: "CLOCK_DOMAIN_RESOLUTION", detail: "Binding posedge clock and asynchronous reset guards...", duration: 450 },
  { label: "TEMPORAL_SVA_SYNTHESIS", detail: "Formulating antecedent |-> consequent cycle bounds...", duration: 550 },
  { label: "DETERMINISTIC_AST_LINT", detail: "Executing Python ast.parse() on cocotb test harness...", duration: 600 },
];

export default function CompilationProgress() {
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 50);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      accumulated += PIPELINE_STAGES[i].duration;
      if (elapsed < accumulated) {
        setCurrentStage(i);
        return;
      }
    }
    setCurrentStage(PIPELINE_STAGES.length - 1);
  }, [elapsed]);

  return (
    <div className="flex-1 flex flex-col border border-zinc-800 bg-zinc-950 font-mono text-xs select-none p-5 justify-between min-h-[500px]">
      {/* Top Telemetry Header */}
      <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-400 font-bold tracking-wider">
          <Activity className="w-4 h-4 animate-pulse text-blue-500" />
          <span>SYNTHESIZING_FORMAL_PROPERTY</span>
        </div>
        <div className="text-[11px] text-zinc-500">
          ELAPSED: <span className="text-zinc-200 font-bold">{(elapsed / 1000).toFixed(2)}s</span>
        </div>
      </div>

      {/* Middle: AI-Native Thinking Polygon Visualization */}
      <div className="my-4">
        <ThinkingPolygon />
      </div>

      {/* Bottom: Pipeline Execution Stepper */}
      <div className="border border-zinc-900 bg-black/60 p-3 flex flex-col gap-2">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Compiler Pipeline Stages:</span>
        <div className="flex flex-col gap-1.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;
            return (
              <div
                key={stage.label}
                className={`flex items-center justify-between p-1.5 border ${
                  isCurrent
                    ? "border-blue-500/50 bg-blue-950/20 text-blue-300"
                    : isDone
                    ? "border-zinc-900 bg-black text-zinc-400"
                    : "border-transparent text-zinc-700"
                } transition-all`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px]">
                    {isDone ? (
                      <span className="text-emerald-400 font-bold">[✓]</span>
                    ) : isCurrent ? (
                      <span className="text-blue-400 animate-pulse font-bold">[▶]</span>
                    ) : (
                      <span className="text-zinc-700">[ ]</span>
                    )}
                  </span>
                  <span className="font-semibold">{stage.label}</span>
                </div>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">
                  {stage.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CompilationProgress };
