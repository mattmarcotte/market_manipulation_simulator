"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

export type AssetType = "stock" | "etf" | "commodity" | "crypto";

export interface TickerHolding {
  symbol: string;
  weight: number;
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
  assetType: AssetType;
  leverage?: number;
  holdings?: TickerHolding[];
}

interface StreamPayload {
  ticks: PriceTick[];
  candles: Record<string, Candle[]>;
  index: MarketIndex;
  companies: CompanyStats[];
  dayNumber: number;
  paused: boolean;
}

export function useMarketData() {
  const [ticks, setTicks] = useState<PriceTick[]>([]);
  const [candles, setCandles] = useState<Record<string, Candle[]>>({});
  const [index, setIndex] = useState<MarketIndex | null>(null);
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [dayNumber, setDayNumber] = useState(0);
  const [paused, setPaused] = useState(true);
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
      if (typeof data.paused === "boolean") setPaused(data.paused);

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

  return { ticks, candles, index, companies, dayNumber, paused, setPaused, flashes };
}

function formatMcap(b: number): string {
  if (b <= 0) return "—";
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  if (b >= 1) return `$${b.toFixed(0)}B`;
  return `$${(b * 1000).toFixed(0)}M`;
}

const ASSET_BADGES: Record<AssetType, { label: string; cls: string }> = {
  stock: { label: "STK", cls: "text-gray-500" },
  etf: { label: "ETF", cls: "text-blue-400" },
  commodity: { label: "CMDTY", cls: "text-yellow-400" },
  crypto: { label: "CRYPTO", cls: "text-pink-400" },
};

const SECTOR_ICONS: Record<string, string> = {
  Energy: "⚡",
  Technology: "💻",
  Healthcare: "💊",
  Finance: "🏦",
  Agriculture: "🌾",
  Defense: "🛡️",
  Media: "📺",
  Telecom: "📡",
  Industrials: "🏗️",
  Consumer: "🛒",
  "Real Estate": "🏢",
};

/** Small visual cue for what kind of asset / industry a row belongs to. */
export function assetIcon(co: CompanyStats | undefined): string {
  if (!co) return "•";
  if (co.assetType === "crypto") return "🪙";
  if (co.assetType === "commodity") {
    if (co.symbol === "GOLD") return "🥇";
    if (co.symbol === "SLVR") return "🥈";
    return "🛢️";
  }
  if (co.assetType === "etf") {
    const lev = co.leverage ?? 1;
    if (lev < 0) return "📉";
    if (lev > 1) return "📈";
    return "📊";
  }
  return SECTOR_ICONS[co.sector] ?? "🏭";
}

type TabId = "all" | AssetType;
const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "stock", label: "Stocks" },
  { id: "etf", label: "ETFs" },
  { id: "commodity", label: "Commodities" },
  { id: "crypto", label: "Crypto" },
];

type SortKey = "symbol" | "price" | "changePercent" | "marketCap" | "volume";

const SORT_COLUMNS: { key: SortKey; label: string; align: string }[] = [
  { key: "price", label: "Price", align: "text-right" },
  { key: "changePercent", label: "Chg%", align: "text-right" },
  { key: "marketCap", label: "MCap", align: "text-right" },
  { key: "volume", label: "Vol", align: "text-right" },
];

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
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDesc, setSortDesc] = useState(false);

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.symbol, c])),
    [companies]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = ticks.filter((tick) => {
      const co = companyMap.get(tick.symbol);
      if (tab !== "all" && co?.assetType !== tab) return false;
      if (!q) return true;
      return (
        tick.symbol.toLowerCase().includes(q) ||
        co?.name.toLowerCase().includes(q) ||
        co?.sector.toLowerCase().includes(q) ||
        co?.industry.toLowerCase().includes(q)
      );
    });

    const dir = sortDesc ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      if (sortKey === "symbol") return dir * a.symbol.localeCompare(b.symbol);
      if (sortKey === "marketCap") {
        const ma = companyMap.get(a.symbol)?.marketCap ?? 0;
        const mb = companyMap.get(b.symbol)?.marketCap ?? 0;
        return dir * (ma - mb);
      }
      return dir * (a[sortKey] - b[sortKey]);
    });
    return filtered;
  }, [ticks, companyMap, tab, search, sortKey, sortDesc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      // numeric columns default to descending (biggest first), symbol to A→Z
      setSortDesc(key !== "symbol");
    }
  }

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDesc ? " ↓" : " ↑") : "";

  return (
    <div className="space-y-0.5 overflow-x-auto">
      {/* Tabs + search */}
      <div className="flex items-center gap-2 px-3 pb-2 flex-wrap">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors
                ${tab === t.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search symbol, name, sector..."
          className="flex-1 min-w-[140px] bg-gray-800 border border-gray-700 rounded px-2.5 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-[76px_1fr_72px_80px_72px_56px_64px_56px] min-w-[620px] gap-1.5 text-[10px] text-gray-500 px-3 py-1 font-mono uppercase">
        <button onClick={() => toggleSort("symbol")} className="text-left hover:text-gray-300">
          Symbol{sortArrow("symbol")}
        </button>
        <span>Company</span>
        <span>Chart</span>
        {SORT_COLUMNS.slice(0, 3).map((c) => (
          <button key={c.key} onClick={() => toggleSort(c.key)} className={`${c.align} hover:text-gray-300`}>
            {c.label}{sortArrow(c.key)}
          </button>
        ))}
        <span className="text-right">P/E</span>
        <button onClick={() => toggleSort("volume")} className="text-right hover:text-gray-300">
          Vol{sortArrow("volume")}
        </button>
      </div>
      {rows.length === 0 && (
        <div className="text-center text-gray-600 text-xs py-6 font-mono">
          No tickers match {search ? `"${search}"` : "this filter"}
        </div>
      )}
      {rows.map((tick) => {
        const flash = flashes.get(tick.symbol);
        const isUp = tick.change >= 0;
        const isSelected = selected === tick.symbol;
        const tickCandles = candles[tick.symbol] || [];
        const co = companyMap.get(tick.symbol);
        return (
          <button
            key={tick.symbol}
            onClick={() => onSelect(tick.symbol)}
            className={`w-full grid grid-cols-[76px_1fr_72px_80px_72px_56px_64px_56px] min-w-[620px] gap-1.5 items-center text-xs px-3 py-1.5 rounded font-mono transition-colors
              ${isSelected ? "bg-gray-700 ring-1 ring-blue-500" : "hover:bg-gray-800/70"}
              ${flash === "up" ? "!bg-green-900/40" : flash === "down" ? "!bg-red-900/40" : ""}`}
          >
            <span className="font-bold text-white text-left">
              <span className="mr-1" title={co ? `${co.sector} · ${co.industry}` : undefined}>
                {assetIcon(co)}
              </span>
              {tick.symbol}
            </span>
            <div className="text-left min-w-0">
              <div className="text-gray-300 text-[11px] leading-tight truncate">
                {co?.name ?? tick.symbol}
              </div>
              <div className="text-[9px] leading-tight truncate">
                <span className="text-gray-600">{co?.sector}</span>
                {co && (
                  <span className={`ml-1.5 font-bold ${ASSET_BADGES[co.assetType].cls}`}>
                    {ASSET_BADGES[co.assetType].label}
                    {co.leverage && Math.abs(co.leverage) > 1 ? ` ${co.leverage}x` : ""}
                  </span>
                )}
              </div>
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
