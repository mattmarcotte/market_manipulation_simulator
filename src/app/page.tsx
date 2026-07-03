"use client";

import { useState } from "react";
import MarketTicker, { useMarketData } from "@/components/MarketTicker";
import TradePanel from "@/components/TradePanel";
import PortfolioPanel from "@/components/PortfolioPanel";
import CandlestickChart from "@/components/CandlestickChart";
import CompanyDetail from "@/components/CompanyDetail";
import IndexBanner from "@/components/IndexBanner";
import SocialFeed from "@/components/SocialFeed";

export default function Home() {
  const { ticks, candles, index, companies, dayNumber, flashes } = useMarketData();
  const [selected, setSelected] = useState<string | null>(null);
  const [tradeRefresh, setTradeRefresh] = useState(0);

  const selectedTick = ticks.find((t) => t.symbol === selected) || null;
  const selectedCandles = selected ? candles[selected] || [] : [];
  const selectedCompany = companies.find((c) => c.symbol === selected) || null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-wide">POTUS MARKET</h1>
          <p className="text-xs text-gray-500">Presidential Trading Simulator</p>
        </div>
        <div className="flex items-center gap-6">
          <IndexBanner index={index} />
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase">Trading Day</div>
            <div className="text-lg font-mono font-bold text-white">{dayNumber}</div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 p-4 max-w-[1800px] mx-auto">
        {/* Left: Market + Chart */}
        <div className="space-y-4">
          {selectedTick && (
            <CandlestickChart
              symbol={selectedTick.symbol}
              candles={selectedCandles}
              currentPrice={selectedTick.price}
              change={selectedTick.changePercent}
              companyName={selectedCompany?.name}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
            <div className="border border-gray-700 rounded-lg p-3">
              <h2 className="text-xs text-gray-400 uppercase mb-2 px-3">Market</h2>
              <MarketTicker
                ticks={ticks}
                flashes={flashes}
                candles={candles}
                companies={companies}
                onSelect={setSelected}
                selected={selected}
              />
            </div>

            <div className="space-y-4">
              <TradePanel
                tick={selectedTick}
                onTrade={() => setTradeRefresh((n) => n + 1)}
              />
              {selectedCompany && <CompanyDetail company={selectedCompany} />}
            </div>
          </div>
        </div>

        {/* Right: Chirper + Portfolio */}
        <div className="space-y-4">
          <SocialFeed />
          <div className="border border-gray-700 rounded-lg p-4">
            <h2 className="text-xs text-gray-400 uppercase mb-3">Portfolio</h2>
            <PortfolioPanel refreshKey={tradeRefresh} onTrade={() => setTradeRefresh((n) => n + 1)} />
          </div>
        </div>
      </main>
    </div>
  );
}
