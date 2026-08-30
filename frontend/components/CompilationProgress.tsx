"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Cpu, Check, Activity } from "lucide-react";

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

      {/* Middle: Oscilloscope Digital Logic Waveform */}
      <div className="my-6 border border-zinc-900 bg-black p-4 flex flex-col gap-3 relative overflow-hidden">
        {/* Scanning laser beam overlay */}
        <div 
          className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none animate-wave-sweep" 
        />

        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-900 pb-1">
          <span>DIGITAL_TIMING_TRACE</span>
          <span>CH1: CLK | CH2: ANTECEDENT | CH3: ASSERTION_CAPTURE</span>
        </div>

        {/* CLK Signal */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-[10px] text-zinc-500">CLK</span>
          <svg className="w-full h-5 stroke-blue-500 fill-none stroke-[1.5]" preserveAspectRatio="none" viewBox="0 0 200 20">
            <path d="M0,18 L10,18 L10,2 L20,2 L20,18 L30,18 L30,2 L40,2 L40,18 L50,18 L50,2 L60,2 L60,18 L70,18 L70,2 L80,2 L80,18 L90,18 L90,2 L100,2 L100,18 L110,18 L110,2 L120,2 L120,18 L130,18 L130,2 L140,2 L140,18 L150,18 L150,2 L160,2 L160,18 L170,18 L170,2 L180,2 L180,18 L190,18 L190,2 L200,2" />
          </svg>
        </div>

        {/* VALID / ANTECEDENT Signal */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-[10px] text-zinc-500">TRIG</span>
          <svg className="w-full h-5 stroke-indigo-400 fill-none stroke-[1.5]" preserveAspectRatio="none" viewBox="0 0 200 20">
            <path d="M0,18 L40,18 L40,2 L100,2 L100,18 L200,18" />
          </svg>
        </div>

        {/* EVAL / SVA Signal (Hunting & Locking) */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-[10px] text-zinc-500">ASSERT</span>
          <svg className="w-full h-5 stroke-amber-400 fill-none stroke-[1.5] stroke-dasharray-[4,2]" preserveAspectRatio="none" viewBox="0 0 200 20">
            <path d="M0,18 L100,18 L100,2 L160,2 L160,18 L200,18" />
          </svg>
        </div>
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
