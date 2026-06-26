import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/grpc-clients";
import { getMarketStreamer } from "@/lib/market-streamer";

export const dynamic = "force-dynamic";

const ACCOUNT_ID = "player-1";

export async function GET() {
  try {
    const portfolio = await getPortfolio(ACCOUNT_ID);
    const ticks = getMarketStreamer().getLatest();
    const prices = new Map(ticks.map((t) => [t.symbol, t.price]));

    // Enrich positions with live prices
    const positions = portfolio.positions.map((pos) => {
      const livePrice = prices.get(pos.symbol) ?? pos.avgCost;
      return {
        ...pos,
        currentPrice: livePrice,
        marketValue: pos.shares * livePrice,
        pnl: pos.shares * (livePrice - pos.avgCost),
      };
    });

    const netWorth =
      portfolio.cash +
      positions.reduce((sum, p) => sum + p.marketValue, 0);

    return NextResponse.json({
      cash: portfolio.cash,
      positions,
      netWorth,
      recentTrades: portfolio.recentTrades,
    });
  } catch (err) {
    console.error("gRPC portfolio error:", err);
    return NextResponse.json(
      { error: "Account service unavailable" },
      { status: 503 }
    );
  }
}
