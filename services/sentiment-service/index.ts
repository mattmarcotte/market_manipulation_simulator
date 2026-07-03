import { GoogleGenerativeAI } from "@google/generative-ai";
import { Kafka, logLevel, Producer } from "kafkajs";
import { TICKERS } from "../../src/lib/tickers";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is required");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const BROKER = process.env.KAFKA_BROKER || "localhost:9092";

const tickerList = TICKERS.map(
  (t) => `${t.symbol} (${t.name}, ${t.sector}, ${t.industry})`
).join("\n");

const SYSTEM_INSTRUCTION = `You are a financial market sentiment analyzer for a simulated stock market game. The player is the President of the United States posting on social media.

Available tickers:
${tickerList}

When you receive a social media post, analyze its potential impact on the stock market and respond with a JSON array of market adjustments. Each adjustment has:
- "symbol": the ticker affected
- "impactPercent": percentage change (e.g. +5.0 means 5% up, -3.2 means 3.2% down)
- "reason": brief explanation of why

Rules:
- Presidential posts carry significant weight — markets react to policy signals, government contracts, regulations, endorsements, and criticisms
- The impact should be proportional to the severity/credibility of the statement
- A president announcing a $50B government contract for a company = massive positive impact (+8 to +15%)
- A president criticizing a company = moderate negative impact (-3 to -8%)
- Subtle policy hints = small impacts (+/- 1-3%)
- Obviously fake, absurd, or insane posts (aliens, impossible wars, end of world) should have ZERO or near-zero impact — the public ignores them. Return an empty array [].
- A post may affect multiple tickers (e.g. "I'm imposing tariffs on all tech companies" affects NVTX, CLDW, CYBX)
- A post may affect sector-adjacent tickers (defense spending up helps DFNS and SNTL)
- Not every post moves markets — casual posts with no economic implications return []

Respond ONLY with a valid JSON array, nothing else. Examples:
Post: "Just signed a $50 billion defense contract with Ironclad Defense Systems!"
Response: [{"symbol":"DFNS","impactPercent":12.5,"reason":"Major government contract announcement"},{"symbol":"SNTL","impactPercent":3.2,"reason":"Defense sector positive spillover"}]

Post: "I had a great breakfast this morning"
Response: []

Post: "The aliens have landed and they want our gold"
Response: []`;

// System instruction is cached server-side — sent once at model init, not per request
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: SYSTEM_INSTRUCTION,
});

let kafkaProducer: Producer | null = null;

async function analyzePost(post: {
  id: string;
  author: string;
  content: string;
  isPresident: boolean;
}): Promise<void> {
  try {
    // Only the user message is sent per request — system instruction is cached
    const prompt = `Social media post by ${post.isPresident ? "The President of the United States" : post.author}:\n"${post.content}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log(`[Sentiment] No market impact for post: "${post.content.slice(0, 60)}..."`);
      return;
    }

    const adjustments = JSON.parse(jsonMatch[0]) as Array<{
      symbol: string;
      impactPercent: number;
      reason: string;
    }>;

    if (adjustments.length === 0) {
      console.log(`[Sentiment] No market impact for post: "${post.content.slice(0, 60)}..."`);
      return;
    }

    if (kafkaProducer) {
      for (const adj of adjustments) {
        const event = {
          symbol: adj.symbol,
          impactPercent: adj.impactPercent,
          reason: adj.reason,
          postId: post.id,
          timestamp: Date.now(),
        };

        await kafkaProducer.send({
          topic: "market-adjustments",
          messages: [{
            key: adj.symbol,
            value: JSON.stringify(event),
          }],
        });

        console.log(
          `[Sentiment] ${adj.symbol} ${adj.impactPercent > 0 ? "+" : ""}${adj.impactPercent}% — ${adj.reason}`
        );
      }
    }
  } catch (err: any) {
    if (err?.message?.includes("429")) {
      console.warn("[Sentiment] Rate limited — waiting 10s before next message...");
      await new Promise((r) => setTimeout(r, 10000));
    } else {
      console.error("[Sentiment] Gemini analysis error:", err?.message || err);
    }
  }
}

async function main() {
  const kafka = new Kafka({
    clientId: "sentiment-service",
    brokers: [BROKER],
    logLevel: logLevel.WARN,
    retry: { retries: 10, initialRetryTime: 3000 },
  });

  kafkaProducer = kafka.producer();
  await kafkaProducer.connect();
  console.log("[Sentiment Service] Kafka producer connected");
  console.log(`[Sentiment Service] Using model: ${MODEL_NAME} (system instruction cached)`);

  const consumer = kafka.consumer({ groupId: "sentiment-service-group" });
  await consumer.connect();
  await consumer.subscribe({ topic: "social-posts", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const post = JSON.parse(message.value.toString());
      console.log(`[Sentiment] Analyzing post: "${post.content.slice(0, 80)}..."`);
      await analyzePost(post);
    },
  });

  console.log("[Sentiment Service] Running — consuming social-posts, producing market-adjustments");
}

main().catch(console.error);
