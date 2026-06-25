"use client";

import { useEffect, useRef } from "react";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function Sparkline({
  candles,
  width = 80,
  height = 28,
}: {
  candles: Candle[];
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const closes = candles.map((c) => c.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const padding = 2;
    const drawH = height - padding * 2;
    const drawW = width - padding * 2;

    const isUp = closes[closes.length - 1] >= closes[0];
    ctx.strokeStyle = isUp ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 1.2;
    ctx.beginPath();

    for (let i = 0; i < closes.length; i++) {
      const x = padding + (i / (closes.length - 1)) * drawW;
      const y = padding + drawH - ((closes[i] - min) / range) * drawH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // gradient fill
    const lastX = padding + drawW;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isUp ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.lineTo(lastX, height);
    ctx.lineTo(padding, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [candles, width, height]);

  if (candles.length < 2) {
    return <div style={{ width, height }} className="bg-gray-800/50 rounded" />;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="block"
    />
  );
}
