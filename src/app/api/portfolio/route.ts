import { NextResponse } from "next/server";
import { getPortfolio, getNetWorth } from "@/lib/portfolio";
import { getMarketStreamer } from "@/lib/market-streamer";

export const dynamic = "force-dynamic";

export async function GET() {
  const p = getPortfolio();
  const ticks = getMarketStreamer().getLatest();
  const prices = new Map(ticks.map((t) => [t.symbol, t.price]));

  const positions = Array.from(p.positions.values()).map((pos) => ({
    ...pos,
    currentPrice: prices.get(pos.symbol) ?? pos.avgCost,
    marketValue: pos.shares * (prices.get(pos.symbol) ?? pos.avgCost),
    pnl:
      pos.shares * ((prices.get(pos.symbol) ?? pos.avgCost) - pos.avgCost),
  }));

  return NextResponse.json({
    cash: p.cash,
    positions,
    netWorth: getNetWorth(prices),
    recentTrades: p.trades.slice(-20).reverse(),
  });
}
