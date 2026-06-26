import { NextRequest, NextResponse } from "next/server";
import { placeOrder } from "@/lib/grpc-clients";

const ACCOUNT_ID = "player-1";

export async function POST(req: NextRequest) {
  const { symbol, side, shares } = await req.json();

  if (!symbol || !side || !shares) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await placeOrder({
      accountId: ACCOUNT_ID,
      symbol,
      side,
      shares: Number(shares),
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
