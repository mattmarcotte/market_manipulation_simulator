import { NextRequest, NextResponse } from "next/server";
import { placeOrder } from "@/lib/grpc-clients";

const ACCOUNT_ID = "player-1";

const VALID_SIDES = ["buy", "sell", "short", "cover"];

export async function POST(req: NextRequest) {
  const { symbol, side, shares, leverage } = await req.json();

  if (!symbol || !side || !shares) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!VALID_SIDES.includes(side)) {
    return NextResponse.json({ error: "Side must be 'buy', 'sell', 'short', or 'cover'" }, { status: 400 });
  }
  const lev = Math.min(5, Math.max(1, Number(leverage) || 1));
  if ((side === "sell" || side === "cover") && lev !== 1) {
    return NextResponse.json({ error: "Leverage only applies to 'buy' and 'short' orders" }, { status: 400 });
  }

  try {
    const result = await placeOrder({
      accountId: ACCOUNT_ID,
      symbol,
      side,
      shares: Number(shares),
      leverage: lev,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      trade: {
        id: result.orderId,
        symbol,
        side,
        shares: Number(shares),
        leverage: lev,
        price: result.fillPrice,
        status: result.status,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    console.error("gRPC trade error:", err);
    return NextResponse.json(
      { error: "Order service unavailable" },
      { status: 503 }
    );
  }
}
