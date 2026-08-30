"use client";

import React, { useEffect, useRef } from "react";

export default function PixelGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Grid config
    const gridSize = 32;
    const pulses: { x: number; y: number; alpha: number; speed: number }[] = [];

    // Initialize random active logic pulses
    for (let i = 0; i < 25; i++) {
      pulses.push({
        x: Math.floor((Math.random() * width) / gridSize) * gridSize,
        y: Math.floor((Math.random() * height) / gridSize) * gridSize,
        alpha: Math.random(),
        speed: 0.008 + Math.random() * 0.015,
      });
    }

    const draw = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Draw faint dot grid
      ctx.fillStyle = "rgba(39, 39, 42, 0.4)"; // zinc-800
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }

      // Draw and update Electric Blue logic pulses
      pulses.forEach((p) => {
        p.alpha += p.speed;
        if (p.alpha > 1 || p.alpha < 0) {
          p.speed = -p.speed;
        }

        // Electric Blue glow: #0066FF
        ctx.fillStyle = `rgba(0, 102, 255, ${Math.max(0, p.alpha * 0.7)})`;
        ctx.fillRect(p.x - 1, p.y - 1, 3, 3);

        // Crosshair connector
        ctx.strokeStyle = `rgba(0, 102, 255, ${Math.max(0, p.alpha * 0.15)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - 8, p.y);
        ctx.lineTo(p.x + 8, p.y);
        ctx.moveTo(p.x, p.y - 8);
        ctx.lineTo(p.x, p.y + 8);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
    />
  );
}
