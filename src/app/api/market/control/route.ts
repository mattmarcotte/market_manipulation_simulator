import { getMarketStreamer } from "@/lib/market-streamer";
import { resetAccount } from "@/lib/grpc-clients";
import { clearFeed } from "@/lib/social-feed";
import { clearAdjustments } from "@/lib/market-adjustments";

export const dynamic = "force-dynamic";

const ACCOUNT_ID = "player-1";

export async function POST(req: Request): Promise<Response> {
  const { action } = await req.json();
  const streamer = getMarketStreamer();

  if (action === "play") {
    streamer.setPaused(false);
  } else if (action === "pause") {
    streamer.setPaused(true);
  } else if (action === "restart") {
    // Fresh term: day 0, re-rolled prices, cleared history, paused — and the
    // player's account back to starting cash with no positions or trades.
    streamer.reset();
    clearFeed(); // also notifies social-stream clients to wipe Chirper
    clearAdjustments();
    try {
      await resetAccount(ACCOUNT_ID);
    } catch (err) {
      console.error("Account reset failed:", err);
      return Response.json(
        { error: "Market reset, but account service unavailable for cash reset" },
        { status: 502 }
      );
    }
  } else {
    return Response.json({ error: "action must be 'play', 'pause', or 'restart'" }, { status: 400 });
  }

  return Response.json({
    paused: streamer.isPaused(),
    dayNumber: streamer.getDayNumber(),
  });
}
