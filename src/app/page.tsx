"use client";

import { useCallback, useEffect, useState } from "react";
import MarketTicker, { useMarketData } from "@/components/MarketTicker";
import TradePanel from "@/components/TradePanel";
import PortfolioPanel from "@/components/PortfolioPanel";
import CandlestickChart from "@/components/CandlestickChart";
import CompanyDetail from "@/components/CompanyDetail";
import IndexBanner from "@/components/IndexBanner";
import ObjectiveBar from "@/components/ObjectiveBar";
import SocialFeed from "@/components/SocialFeed";
import OvalOfficeBackdrop from "@/components/scene/OvalOfficeBackdrop";
import { DeskPropsLeft, DeskPropsRight } from "@/components/scene/DeskProps";
import { LaptopFrame, PhoneFrame } from "@/components/scene/Devices";

export default function Home() {
  const { ticks, candles, index, companies, dayNumber, paused, setPaused, flashes } = useMarketData();
  const [selected, setSelected] = useState<string | null>(null);
  const [tradeRefresh, setTradeRefresh] = useState(0);
  const [netWorth, setNetWorth] = useState<number | null>(null);

  // Poll net worth for the objective bar (independent of the portfolio panel).
  useEffect(() => {
    let active = true;
    const fetchNetWorth = async () => {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok && active) {
          const data = await res.json();
          setNetWorth(data.netWorth);
        }
      } catch {}
    };
    fetchNetWorth();
    const interval = setInterval(fetchNetWorth, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [tradeRefresh]);

  const togglePause = useCallback(async () => {
    const action = paused ? "play" : "pause";
    // Optimistic update; reconcile with the server's authoritative response.
    setPaused(!paused);
    try {
      const res = await fetch("/api/market/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setPaused(data.paused);
      }
    } catch {
      setPaused(paused); // revert on failure
    }
  }, [paused, setPaused]);

  const restartGame = useCallback(async () => {
    try {
      const res = await fetch("/api/market/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });
      if (res.ok) {
        const data = await res.json();
        setPaused(data.paused);
        setTradeRefresh((n) => n + 1); // refetch portfolio + net worth
      }
    } catch {}
  }, [setPaused]);

  const selectedTick = ticks.find((t) => t.symbol === selected) || null;
  const selectedCandles = selected ? candles[selected] || [] : [];
  const selectedCompany = companies.find((c) => c.symbol === selected) || null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f1c]">
      {/* Oval Office */}
      <OvalOfficeBackdrop className="absolute inset-0 w-full h-full" />

      {/* Desk surface */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,222,160,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.25) 100%), repeating-linear-gradient(90deg, #8a5a2b 0px, #8a5a2b 64px, #7a4a21 64px, #7a4a21 70px, #6d411c 70px, #6d411c 72px)",
          boxShadow: "inset 0 5px 0 #b07a38, inset 0 9px 0 #96622c",
        }}
      />

      {/* Game title — a brass nameplate sitting on the desk */}
      <div className="absolute bottom-2 left-3 z-20 [font-family:var(--font-pixel),monospace]">
        <span className="text-[11px] text-[#3a2503] bg-[#d9a520] px-2.5 py-1 rounded-sm shadow-lg border-b-4 border-[#8a5a10]">
          POTUS MARKET
        </span>
      </div>

      {/* Desk with devices + props */}
      <div className="relative z-10 mx-auto flex items-end gap-2 px-1.5 pt-3 pb-2 min-h-screen">
        <DeskPropsLeft className="hidden 2xl:block w-32 shrink-0 -mb-2" />

        <LaptopFrame>
          {/* YugeTrade site header */}
          <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-2 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-lg">🦅</span>
              <span className="[font-family:var(--font-pixel),monospace] text-[11px] text-[#d9a520]">
                YUGETRADE
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-4 text-[11px] text-gray-400">
              <span className="text-white border-b-2 border-[#d9a520] pb-0.5">Investing</span>
              <span className="hover:text-white cursor-pointer">Crypto</span>
              <span className="hover:text-white cursor-pointer">Gold</span>
              <span className="hover:text-white cursor-pointer" title="Coming never">Taxes</span>
              <span className="hover:text-white cursor-pointer">Loopholes</span>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <IndexBanner index={index} />
              <div
                className="w-8 h-8 rounded-full bg-[#ff9f43] border-2 border-[#ffe066] flex items-center justify-center text-[10px] font-bold text-[#5a3005]"
                title="President (Verified Whale 🐋)"
              >
                45
              </div>
            </div>
          </div>

          <div className="p-3 space-y-3">
            <ObjectiveBar
              dayNumber={dayNumber}
              paused={paused}
              netWorth={netWorth}
              onTogglePause={togglePause}
              onRestart={restartGame}
            />

            {selectedTick && (
              <CandlestickChart
                symbol={selectedTick.symbol}
                candles={selectedCandles}
                currentPrice={selectedTick.price}
                change={selectedTick.changePercent}
                companyName={selectedCompany?.name}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
              <div className="border border-gray-700 rounded-lg p-3 min-w-0 bg-gray-900 overflow-hidden">
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

              <div className="space-y-3">
                <TradePanel
                  tick={selectedTick}
                  company={selectedCompany}
                  onTrade={() => setTradeRefresh((n) => n + 1)}
                />
                {selectedCompany && <CompanyDetail company={selectedCompany} />}
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                  <h2 className="text-xs text-gray-400 uppercase mb-3">Portfolio</h2>
                  <PortfolioPanel
                    refreshKey={tradeRefresh}
                    onTrade={() => setTradeRefresh((n) => n + 1)}
                  />
                </div>
              </div>
            </div>
          </div>
        </LaptopFrame>

        <PhoneFrame>
          <SocialFeed />
        </PhoneFrame>

        <DeskPropsRight className="hidden 2xl:block w-28 shrink-0 -mb-2" />
      </div>
    </div>
  );
}
