"use client";

import { useEffect, useState, useCallback } from "react";

interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
}

interface PortfolioData {
  cash: number;
  positions: Position[];
  netWorth: number;
  recentTrades: {
    id: string;
    symbol: string;
    side: string;
    shares: number;
    price: number;
    timestamp: number;
  }[];
}

export default function PortfolioPanel({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<PortfolioData | null>(null);

  const fetchPortfolio = useCallback(async () => {
    const res = await fetch("/api/portfolio");
    setData(await res.json());
  }, []);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 2000);
    return () => clearInterval(interval);
  }, [fetchPortfolio, refreshKey]);

  if (!data) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Net Worth</div>
          <div className="text-xl font-mono font-bold text-white">
            ${data.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Cash</div>
          <div className="text-xl font-mono font-bold text-white">
            ${data.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {data.positions.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-400 uppercase mb-2">Positions</h3>
          <div className="space-y-1">
            {data.positions.map((pos) => (
              <div key={pos.symbol} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2 text-sm font-mono">
                <div>
                  <span className="text-white font-bold">{pos.symbol}</span>
                  <span className="text-gray-500 ml-2">{pos.shares} shares</span>
                </div>
                <div className="text-right">
                  <div className="text-white">${pos.marketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={pos.pnl >= 0 ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                    {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentTrades.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-400 uppercase mb-2">Recent Trades</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {data.recentTrades.map((t) => (
              <div key={t.id} className="flex justify-between text-xs font-mono px-2 py-1 bg-gray-800/50 rounded">
                <span className={t.side === "buy" ? "text-green-400" : "text-red-400"}>
                  {t.side.toUpperCase()} {t.shares} {t.symbol}
                </span>
                <span className="text-gray-400">@ ${t.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
