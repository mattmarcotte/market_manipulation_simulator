import { NextRequest, NextResponse } from "next/server";
import { executeTrade } from "@/lib/portfolio";
import { getMarketStreamer } from "@/lib/market-streamer";

export async function POST(req: NextRequest) {
  const { symbol, side, shares } = await req.json();

  if (!symbol || !side || !shares) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ticks = getMarketStreamer().getLatest();
  const tick = ticks.find((t) => t.symbol === symbol);
  if (!tick) {
    return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  }

  const price = side === "buy" ? tick.ask : tick.bid;
  const result = executeTrade(side, symbol, Number(shares), price);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ trade: result.trade });
}
