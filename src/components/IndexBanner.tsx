"use client";

import { useEffect, useRef } from "react";

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  history: { time: number; value: number }[];
}

export default function IndexBanner({ index }: { index: IndexData | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !index || index.history.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 160;
    const h = 32;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const values = index.history.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 2;

    const isUp = index.change >= 0;
    ctx.strokeStyle = isUp ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < values.length; i++) {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = pad + (h - pad * 2) - ((values[i] - min) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [index]);

  if (!index) return null;

  const isUp = index.change >= 0;

  return (
    <div className="flex items-center gap-4 bg-gray-800/60 rounded-lg px-4 py-2">
      <div>
        <span className="text-xs text-gray-400 font-mono">{index.name}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-mono font-bold text-white">
            {index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-mono ${isUp ? "text-green-400" : "text-red-400"}`}>
            {isUp ? "+" : ""}{index.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: 160, height: 32 }}
        className="block"
      />
    </div>
  );
}
