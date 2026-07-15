import { getMarketStreamer } from "@/lib/market-streamer";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const streamer = getMarketStreamer();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const unsubscribe = streamer.subscribe((ticks) => {
        try {
          const payload = {
            ticks,
            candles: streamer.getAllCandles(),
            index: streamer.getIndex(),
            companies: streamer.getCompanyStats(),
            dayNumber: streamer.getDayNumber(),
            paused: streamer.isPaused(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          unsubscribe();
        }
      });

      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(checkClosed);
          unsubscribe();
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
