import { onFeedReset, onNewPost } from "@/lib/social-feed";
import { onAdjustment } from "@/lib/market-adjustments";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const unsubPost = onNewPost((post) => {
        try {
          controller.enqueue(
            encoder.encode(`event: post\ndata: ${JSON.stringify(post)}\n\n`)
          );
        } catch {
          unsubPost();
        }
      });

      const unsubAdj = onAdjustment((adj) => {
        try {
          controller.enqueue(
            encoder.encode(`event: adjustment\ndata: ${JSON.stringify(adj)}\n\n`)
          );
        } catch {
          unsubAdj();
        }
      });

      const unsubReset = onFeedReset(() => {
        try {
          controller.enqueue(encoder.encode(`event: reset\ndata: {}\n\n`));
        } catch {
          unsubReset();
        }
      });

      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepalive);
          unsubPost();
          unsubAdj();
          unsubReset();
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
