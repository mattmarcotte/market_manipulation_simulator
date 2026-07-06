"use client";

import { useState } from "react";
import type { CompanyStats } from "./MarketTicker";

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

type Side = "buy" | "sell" | "short" | "cover";

const LEVERAGE_OPTIONS = [1, 2, 3, 4, 5];

function assetTypeBadge(company: CompanyStats | null | undefined) {
  if (!company) return null;
  if (company.assetType === "etf") {
    const lev = company.leverage ?? 1;
    if (lev === 1) return { label: "ETF", cls: "bg-blue-900/50 text-blue-300" };
    if (lev < 0) return { label: `${Math.abs(lev)}x INVERSE ETF`, cls: "bg-purple-900/50 text-purple-300" };
    return { label: `${lev}x LEVERAGED ETF`, cls: "bg-orange-900/50 text-orange-300" };
  }
  if (company.assetType === "commodity") return { label: "COMMODITY", cls: "bg-yellow-900/50 text-yellow-300" };
  if (company.assetType === "crypto") return { label: "CRYPTO", cls: "bg-pink-900/50 text-pink-300" };
  return null;
}

export default function TradePanel({
  tick,
  company,
  onTrade,
}: {
  tick: PriceTick | null;
  company?: CompanyStats | null;
  onTrade: () => void;
}) {
  const [shares, setShares] = useState("100");
  const [side, setSide] = useState<Side>("buy");
  const [leverage, setLeverage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!tick) {
    return (
      <div className="border border-gray-700 rounded-lg p-4 text-gray-500 text-center">
        Select a ticker to trade
      </div>
    );
  }

  const usesAsk = side === "buy" || side === "cover";
  const price = usesAsk ? tick.ask : tick.bid;
  const total = Number(shares) * price;
  const isUp = tick.change >= 0;
  const leverageApplies = side === "buy" || side === "short";
  const badge = assetTypeBadge(company);

  async function submit() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: tick!.symbol,
          side,
          shares: Number(shares),
          leverage: leverageApplies ? leverage : 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(`${side.toUpperCase()} ${shares} ${tick!.symbol} @ $${data.trade.price.toFixed(2)}${leverageApplies && leverage > 1 ? ` (${leverage}x)` : ""}`);
        onTrade();
      }
    } catch {
      setStatus("Network error");
    }
    setLoading(false);
  }

  const sideStyles: Record<Side, string> = {
    buy: "bg-green-600 text-white",
    sell: "bg-red-600 text-white",
    short: "bg-purple-600 text-white",
    cover: "bg-orange-600 text-white",
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">{tick.symbol}</h3>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
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

      <div className="grid grid-cols-4 gap-1.5">
        {(["buy", "sell", "short", "cover"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`py-2 rounded font-bold text-[11px] uppercase transition-colors
              ${side === s ? sideStyles[s] : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >
            {s}
          </button>
        ))}
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

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Leverage {!leverageApplies && <span className="text-gray-600">(buy/short only)</span>}
        </label>
        <div className="grid grid-cols-5 gap-1">
          {LEVERAGE_OPTIONS.map((l) => (
            <button
              key={l}
              disabled={!leverageApplies}
              onClick={() => setLeverage(l)}
              className={`py-1.5 rounded text-xs font-mono font-bold transition-colors
                ${leverage === l && leverageApplies ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"}
                disabled:opacity-40`}
            >
              {l}x
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 font-mono space-y-0.5">
        <div>
          Est. total: <span className="text-white">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {leverageApplies && leverage > 1 && (
          <div>
            {side === "buy" ? "Cash required" : "Margin required"} at {leverage}x:{" "}
            <span className="text-white">
              ${(total / leverage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={loading || !Number(shares)}
        className={`w-full py-3 rounded font-bold text-sm transition-colors text-white disabled:text-gray-400
          ${side === "buy" ? "bg-green-600 hover:bg-green-500 disabled:bg-green-900" : ""}
          ${side === "sell" ? "bg-red-600 hover:bg-red-500 disabled:bg-red-900" : ""}
          ${side === "short" ? "bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900" : ""}
          ${side === "cover" ? "bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900" : ""}
        `}
      >
        {loading ? "..." : `${side.toUpperCase()} ${shares} ${tick.symbol}${leverageApplies && leverage > 1 ? ` (${leverage}x)` : ""}`}
      </button>

      {status && (
        <div className={`text-xs font-mono p-2 rounded ${status.startsWith("Error") ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}`}>
          {status}
        </div>
      )}
    </div>
  );
}
