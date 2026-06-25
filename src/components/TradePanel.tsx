"use client";

import { useState } from "react";

interface PriceTick {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
}

export default function TradePanel({
  tick,
  onTrade,
}: {
  tick: PriceTick | null;
  onTrade: () => void;
}) {
  const [shares, setShares] = useState("100");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!tick) {
    return (
      <div className="border border-gray-700 rounded-lg p-4 text-gray-500 text-center">
        Select a ticker to trade
      </div>
    );
  }

  const price = side === "buy" ? tick.ask : tick.bid;
  const total = Number(shares) * price;
  const isUp = tick.change >= 0;

  async function submit() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: tick!.symbol, side, shares: Number(shares) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(`${side.toUpperCase()} ${shares} ${tick!.symbol} @ $${data.trade.price.toFixed(2)}`);
        onTrade();
      }
    } catch {
      setStatus("Network error");
    }
    setLoading(false);
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-bold text-white">{tick.symbol}</h3>
        <span className={`text-2xl font-mono ${isUp ? "text-green-400" : "text-red-400"}`}>
          ${tick.price.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
        <span>Bid: ${tick.bid.toFixed(2)}</span>
        <span>Ask: ${tick.ask.toFixed(2)}</span>
        <span>High: ${tick.high.toFixed(2)}</span>
        <span>Low: ${tick.low.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 rounded font-bold text-sm transition-colors
            ${side === "buy" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          BUY
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 rounded font-bold text-sm transition-colors
            ${side === "sell" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          SELL
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Shares</label>
        <input
          type="number"
          min="1"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="text-xs text-gray-400 font-mono">
        Est. total: <span className="text-white">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <button
        onClick={submit}
        disabled={loading || !Number(shares)}
        className={`w-full py-3 rounded font-bold text-sm transition-colors
          ${side === "buy"
            ? "bg-green-600 hover:bg-green-500 disabled:bg-green-900"
            : "bg-red-600 hover:bg-red-500 disabled:bg-red-900"
          } text-white disabled:text-gray-400`}
      >
        {loading ? "..." : `${side.toUpperCase()} ${shares} ${tick.symbol}`}
      </button>

      {status && (
        <div className={`text-xs font-mono p-2 rounded ${status.startsWith("Error") ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}`}>
          {status}
        </div>
      )}
    </div>
  );
}
