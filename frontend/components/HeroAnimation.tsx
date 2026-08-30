"use client";

/**
 * HeroAnimation — "Signal-to-Assertion Synthesis"
 *
 * The concept directly mirrors what Spec2Assert does:
 * → Left side: soft, ambiguous sinusoidal waves  (natural-language specs)
 * → Right side: crisp, deterministic square waves (formal SVA properties)
 *
 * A continuous morphing from sine → square wave as x increases,
 * driven by a tanh-sharpening function (not a harsh sign() step —
 * that would look cheap). SVA tokens emerge from the right where
 * the waves have fully "resolved" into digital form.
 *
 * Additionally, faint IC layout traces run horizontally beneath
 * the waves, and small node flashes appear where digital edges
 * transition — simulating flip-flop capture events.
 */

import { useEffect, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Wave {
  yFrac: number;      // vertical position as fraction of height
  phaseOff: number;   // starting phase (golden-angle distributed)
  freqK: number;      // spatial frequency coefficient
  speed: number;      // temporal drift speed
  amp: number;        // amplitude in px
  hue: number;        // HSL hue (blues + indigos)
  sat: number;        // HSL saturation
  weight: number;     // line weight
}

interface Token {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  opacity: number;
}

interface EdgeFlash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const SVA_TOKENS = [
  "##[1:3]", "posedge", "|->", "disable iff", "assert property",
  "##1", "|=>", "endproperty", "@(posedge aclk)", "!rst_n",
  "tvalid", "tready", "##[1:N]", "clk", "|-> ##1", "rst_n",
  "p_axi4", "assert", "property", "@(posedge clk)",
];

const WAVE_COUNT = 10;

// Deterministic wave config (no Math.random in setup — looks more deliberate)
function buildWaves(): Wave[] {
  // Golden-angle phase distribution for natural-looking spread
  const GOLDEN = 2.399;
  return Array.from({ length: WAVE_COUNT }, (_, i) => ({
    yFrac: 0.05 + (i / (WAVE_COUNT - 1)) * 0.90,
    phaseOff: i * GOLDEN,
    freqK: 0.0115 + (i % 4) * 0.0028,
    speed: 0.28 + (i % 6) * 0.14,
    amp: 10 + (i % 5) * 5.5,
    hue: 208 + (i % 4) * 18,    // 208, 226, 244, 262 → blues → indigos
    sat: 72 + (i % 3) * 8,
    weight: 0.7 + (i % 3) * 0.35,
  }));
}

// ── Math helpers ─────────────────────────────────────────────────────────────

/** Hermite smoothstep — avoids visible discontinuity at thresholds */
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/**
 * tanh-sharpened wave morphing.
 * k=1  → sine wave  (smooth, organic)
 * k=10 → near-square (hard digital edges)
 * Using tanh keeps it infinitely differentiable — no harsh jumps.
 */
function morphedWave(phase: number, squareness: number): number {
  const k = 1 + squareness * 9.5;
  const denom = Math.tanh(k);
  if (denom < 1e-6) return Math.sin(phase);
  return Math.tanh(k * Math.sin(phase)) / denom;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const waves = buildWaves();
    const tokens: Token[] = [];
    const flashes: EdgeFlash[] = [];
    let raf: number;
    let lastTokenSpawn = 0;

    // Resize to match parent — uses ResizeObserver for live adaptation
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Main render loop ────────────────────────────────────────────────────
    const draw = (ts: number) => {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const t = ts * 0.001;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Subtle IC layout grid ──────────────────────────────────────────
      // Two different grid densities: coarse structural lines + fine detail dots
      ctx.lineWidth = 0.5;
      const GS = 42;

      // Vertical traces (chip routing channels)
      for (let gx = GS * 0.5; gx < W; gx += GS) {
        ctx.strokeStyle = "rgba(63,63,70,0.12)";
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      // Horizontal traces
      for (let gy = GS * 0.5; gy < H; gy += GS) {
        ctx.strokeStyle = "rgba(63,63,70,0.10)";
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // IC corner pad markers (very faint) — makes it look like a chip floorplan
      for (let gx = GS * 0.5; gx < W; gx += GS) {
        for (let gy = GS * 0.5; gy < H; gy += GS) {
          ctx.fillStyle = "rgba(63,63,70,0.25)";
          ctx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5);
        }
      }

      // ── 2. Morphing signal traces ─────────────────────────────────────────
      const STEPS = 320; // resolution of wave path

      waves.forEach((wave) => {
        const cy = H * wave.yFrac;

        // Draw wave as discrete short line segments for per-segment opacity control
        for (let s = 0; s < STEPS; s++) {
          const xf0 = s / STEPS;
          const xf1 = (s + 1) / STEPS;
          const x0 = xf0 * W;
          const x1 = xf1 * W;

          // squareness: 0 at left (sine) → 1 at right (square)
          const sq0 = smoothstep(0.18, 0.72, xf0);

          // Phase incorporates both spatial frequency and temporal drift
          const phase0 = xf0 * wave.freqK * W + wave.phaseOff + t * wave.speed;
          const phase1 = xf1 * wave.freqK * W + wave.phaseOff + t * wave.speed;

          const y0 = cy + morphedWave(phase0, sq0) * wave.amp;
          const y1 = cy + morphedWave(phase1, smoothstep(0.18, 0.72, xf1)) * wave.amp;

          // Edge fade: invisible at canvas edges, peaks in centre-left region
          const edgeFade = smoothstep(0, 0.07, xf0) * smoothstep(1, 0.91, xf0);
          if (edgeFade < 0.01) continue;

          // Brightness increases as wave becomes more "digital"
          const bri = 40 + sq0 * 22;
          const alpha = (0.10 + sq0 * 0.28) * edgeFade;

          ctx.strokeStyle = `hsla(${wave.hue},${wave.sat}%,${bri}%,${alpha})`;
          ctx.lineWidth = wave.weight + sq0 * 0.6;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();

          // ── 3. Rising/falling edge flashes ─────────────────────────────
          // Detect digital transitions: when morphed value crosses zero
          // and squareness is high — simulates flip-flop clock capture
          if (sq0 > 0.55 && s > 0) {
            const prevPhase = ((s - 1) / STEPS) * wave.freqK * W + wave.phaseOff + t * wave.speed;
            const prevSin = Math.sin(prevPhase);
            const curSin = Math.sin(phase0);
            const crossZero = prevSin * curSin < 0; // sign change = edge
            if (crossZero && Math.random() < 0.04 * sq0 * edgeFade) {
              flashes.push({
                x: x0,
                y: cy, // flash at baseline, not wave value
                life: 0,
                maxLife: 18 + Math.floor(Math.random() * 12),
                hue: wave.hue,
              });
            }
          }
        }

        // ── 4. Glow dots at digital peaks (right zone only) ───────────────
        const startS = Math.floor(STEPS * 0.60);
        for (let s = startS; s < STEPS - 2; s++) {
          const xf = s / STEPS;
          const x = xf * W;
          const phase = xf * wave.freqK * W + wave.phaseOff + t * wave.speed;
          const abssin = Math.abs(Math.sin(phase));
          if (abssin < 0.90) continue;          // only near peaks/troughs

          const sq = smoothstep(0.18, 0.72, xf);
          const edgeFade = smoothstep(1, 0.91, xf);
          const y = cy + morphedWave(phase, sq) * wave.amp;
          const pulseA = (abssin - 0.90) / 0.10 * 0.65 * edgeFade;

          const g = ctx.createRadialGradient(x, y, 0, x, y, 4.5);
          g.addColorStop(0, `hsla(${wave.hue},90%,72%,${pulseA})`);
          g.addColorStop(1, `hsla(${wave.hue},90%,72%,0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ── 5. Edge flash particle render ─────────────────────────────────────
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life++;
        const p = 1 - f.life / f.maxLife;

        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8 * p);
        g.addColorStop(0, `hsla(${f.hue},90%,85%,${p * 0.7})`);
        g.addColorStop(0.5, `hsla(${f.hue},80%,65%,${p * 0.25})`);
        g.addColorStop(1, `hsla(${f.hue},80%,65%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 8 * p, 0, Math.PI * 2);
        ctx.fill();

        if (f.life >= f.maxLife) flashes.splice(i, 1);
      }

      // ── 6. SVA property tokens (emerge on right, drift upward) ────────────
      if (ts - lastTokenSpawn > 750 + Math.sin(t * 0.3) * 400) {
        lastTokenSpawn = ts;
        // Spawn 1, occasionally 2 tokens
        const count = Math.random() < 0.22 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          tokens.push({
            text: SVA_TOKENS[Math.floor(Math.random() * SVA_TOKENS.length)],
            x: W * (0.68 + Math.random() * 0.22),
            y: H * (0.07 + Math.random() * 0.86),
            life: 0,
            maxLife: 80 + Math.floor(Math.random() * 120),
            opacity: 0,
          });
        }
      }

      ctx.font = "10.5px 'Courier New', Courier, monospace";
      ctx.textBaseline = "middle";

      for (let i = tokens.length - 1; i >= 0; i--) {
        const tok = tokens[i];
        tok.life++;
        tok.y -= 0.06;  // slow upward drift — feels like signal propagation

        // Smooth fade in/out
        const fadeIn = Math.min(1, tok.life / 14);
        const fadeOut = Math.min(1, (tok.maxLife - tok.life) / 14);
        const a = fadeIn * fadeOut * 0.32;

        if (a < 0.005) {
          if (tok.life >= tok.maxLife) tokens.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(148,163,184,${a})`;
        ctx.fillText(tok.text, tok.x, tok.y);

        if (tok.life >= tok.maxLife) tokens.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* The canvas does the heavy lifting */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.9 }}
      />

      {/* ── CSS edge fades (cheaper than canvas gradients) ─────────────── */}
      {/* Left → transparent: emphasises that the "analog" side is fading in */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #09090b 0%, rgba(9,9,11,0.6) 8%, transparent 18%, transparent 82%, rgba(9,9,11,0.5) 92%, #09090b 100%)",
        }}
      />
      {/* Top + bottom vertical fades */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #09090b 0%, transparent 14%, transparent 86%, #09090b 100%)",
        }}
      />

      {/*
        Centre vignette — keeps hero text legible.
        Subtle elliptical darkening directly behind where text lives.
        NOT a full black overlay — just enough to push text contrast up.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 40%, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.2) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
