"use client";

import { useEffect, useState, useRef } from "react";
import Sparkline from "./Sparkline";

export interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  dayNumber: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  history: { time: number; value: number }[];
}

export interface CompanyStats {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  marketCap: number;
  pe: number | null;
  eps: number;
  revenue: number;
  dividendYield: number;
  beta: number;
  debtToEquity: number;
  profitMargin: number;
  volatility: number;
  week52High: number;
  week52Low: number;
  avgVolume: number;
}

interface StreamPayload {
  ticks: PriceTick[];
  candles: Record<string, Candle[]>;
  index: MarketIndex;
  companies: CompanyStats[];
  dayNumber: number;
}

export function useMarketData() {
  const [ticks, setTicks] = useState<PriceTick[]>([]);
  const [candles, setCandles] = useState<Record<string, Candle[]>>({});
  const [index, setIndex] = useState<MarketIndex | null>(null);
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [dayNumber, setDayNumber] = useState(0);
  const prevPrices = useRef<Map<string, number>>(new Map());
  const [flashes, setFlashes] = useState<Map<string, "up" | "down">>(new Map());

  useEffect(() => {
    const es = new EventSource("/api/market/stream");
    es.onmessage = (e) => {
      const data: StreamPayload = JSON.parse(e.data);
      setTicks(data.ticks);
      setCandles(data.candles);
      setIndex(data.index);
      setCompanies(data.companies);
      setDayNumber(data.dayNumber);

      const newFlashes = new Map<string, "up" | "down">();
      for (const tick of data.ticks) {
        const prev = prevPrices.current.get(tick.symbol);
        if (prev !== undefined && prev !== tick.price) {
          newFlashes.set(tick.symbol, tick.price > prev ? "up" : "down");
        }
        prevPrices.current.set(tick.symbol, tick.price);
      }
      if (newFlashes.size > 0) {
        setFlashes(newFlashes);
        setTimeout(() => setFlashes(new Map()), 400);
      }
    };
    return () => es.close();
  }, []);

  return { ticks, candles, index, companies, dayNumber, flashes };
}

function formatMcap(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  if (b >= 1) return `$${b.toFixed(0)}B`;
  return `$${(b * 1000).toFixed(0)}M`;
}

export default function MarketTicker({
  ticks,
  flashes,
  candles,
  companies,
  onSelect,
  selected,
}: {
  ticks: PriceTick[];
  flashes: Map<string, "up" | "down">;
  candles: Record<string, Candle[]>;
  companies: CompanyStats[];
  onSelect: (symbol: string) => void;
  selected: string | null;
}) {
  const companyMap = new Map(companies.map((c) => [c.symbol, c]));

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-[64px_1fr_72px_80px_72px_56px_64px_56px] gap-1.5 text-[10px] text-gray-500 px-3 py-1 font-mono uppercase">
        <span>Symbol</span>
        <span>Company</span>
        <span>Chart</span>
        <span className="text-right">Price</span>
        <span className="text-right">Chg%</span>
        <span className="text-right">MCap</span>
        <span className="text-right">P/E</span>
        <span className="text-right">Vol</span>
      </div>
      {ticks.map((tick) => {
        const flash = flashes.get(tick.symbol);
        const isUp = tick.change >= 0;
        const isSelected = selected === tick.symbol;
        const tickCandles = candles[tick.symbol] || [];
        const co = companyMap.get(tick.symbol);
        return (
          <button
            key={tick.symbol}
            onClick={() => onSelect(tick.symbol)}
            className={`w-full grid grid-cols-[64px_1fr_72px_80px_72px_56px_64px_56px] gap-1.5 items-center text-xs px-3 py-1.5 rounded font-mono transition-colors
              ${isSelected ? "bg-gray-700 ring-1 ring-blue-500" : "hover:bg-gray-800/70"}
              ${flash === "up" ? "!bg-green-900/40" : flash === "down" ? "!bg-red-900/40" : ""}`}
          >
            <span className="font-bold text-white text-left">{tick.symbol}</span>
            <div className="text-left truncate">
              <span className="text-gray-300 text-[11px]">{co?.name ?? tick.symbol}</span>
              <span className="text-gray-600 text-[9px] ml-1.5">{co?.sector}</span>
            </div>
            <div className="flex items-center justify-center">
              <Sparkline candles={tickCandles} width={64} height={24} />
            </div>
            <span className="text-right text-white">${tick.price.toFixed(2)}</span>
            <span className={`text-right ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}{tick.changePercent.toFixed(2)}%
            </span>
            <span className="text-right text-gray-400 text-[10px]">
              {co ? formatMcap(co.marketCap) : "—"}
            </span>
            <span className="text-right text-gray-400 text-[10px]">
              {co?.pe ? co.pe.toFixed(1) : "N/A"}
            </span>
            <span className="text-right text-gray-500 text-[10px]">
              {(tick.volume / 1_000_000).toFixed(1)}M
            </span>
          </button>
        );
      })}
    </div>
  );
}
