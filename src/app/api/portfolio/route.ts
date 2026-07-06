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

    // Enrich positions with live prices. pnl = shares * (livePrice - avgCost)
    // works uniformly for longs (positive shares) and shorts (negative shares).
    const positions = portfolio.positions.map((pos) => {
      const livePrice = prices.get(pos.symbol) ?? pos.avgCost;
      return {
        ...pos,
        currentPrice: livePrice,
        marketValue: pos.shares * livePrice,
        pnl: pos.shares * (livePrice - pos.avgCost),
      };
    });

    const totalMarginDebt = positions.reduce((sum, p) => sum + p.marginDebt, 0);
    const netWorth =
      portfolio.cash +
      positions.reduce((sum, p) => sum + p.marketValue, 0) -
      totalMarginDebt;

    return NextResponse.json({
      cash: portfolio.cash,
      positions,
      netWorth,
      recentTrades: portfolio.recentTrades,
      totalMarginDebt,
    });
  } catch (err) {
    console.error("gRPC portfolio error:", err);
    return NextResponse.json(
      { error: "Account service unavailable" },
      { status: 503 }
    );
  }
}
