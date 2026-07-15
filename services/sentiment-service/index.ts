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

const tickerList = TICKERS.map((t) => {
  const type = t.assetType.toUpperCase();
  return `${t.symbol} [${type}] (${t.name}, ${t.sector}, ${t.industry}) — ${t.description}`;
}).join("\n");

const SYSTEM_INSTRUCTION = `You are a financial market sentiment analyzer for a simulated stock market game. The player is the President of the United States posting on social media.

Available tickers (with asset type, sector, industry, and business description):
${tickerList}

When you receive a social media post, analyze its potential impact on the market and respond with a JSON array of market adjustments. Each adjustment has:
- "symbol": the ticker affected
- "impactPercent": percentage change (e.g. +5.0 means 5% up, -3.2 means 3.2% down)
- "reason": brief explanation of why

Rules:
- Presidential posts carry ENORMOUS weight. In this game's world, markets are driven by hype and vibes, not sober analysis — retail traders pile into anything the President says.
- Impact is proportional to how EXCITING or ALARMING the claim sounds, NOT how credible, scientific, or realistic it is. Do not fact-check the President. A wild, exaggerated, or medically impossible claim ("this cures cancer, it cured MY cancer!") still sends the stock soaring, because the crowd believes it.
- A president announcing a $50B government contract for a company = massive positive impact (+8 to +15%)
- A president hyping a company's product with miracle claims = massive positive impact (+10 to +25%). The more outrageous the claim, the bigger the pop.
- A president criticizing, blaming, or mocking a company = strong negative impact (-5 to -15%)
- Subtle policy hints = small impacts (+/- 1-3%)
- Only return an empty array [] when the post has NO connection to any company, industry, product, or economic topic at all (pure small talk: breakfast, the weather, sports scores). When in doubt, find the connection and move the market.
- Posts about impossible sci-fi topics with no company/industry angle (aliens landing) still return [] — but if the post ties even an absurd claim to a company or industry, the market reacts.

INDIRECT TARGETING — this is critical:
- Posts almost never name tickers directly. Match posts to affected companies by their business, industry, and description. "I'm banning electric cars" hits VLTA (EV maker) hard even though VLTA is never mentioned. "Federal buildings will no longer buy ad space on social networks" hits MDIA. "We're capping insulin prices" hits HLSN.
- A post may affect multiple tickers ("tariffs on all tech" affects NVTX, CLDW, CYBX, SEMI, and TECHQ)
- Think in supply chains and second-order effects: banning EVs also hurts MNRL (lithium/copper miner) and helps AMRN (oil & gas); a war scare helps DFNS/SNTL/AERO and GOLD; a huge infrastructure bill helps CNST, RLTX, and MNRL.

ASSET-TYPE RULES:
- STOCK: react to company-, industry-, and economy-level news as described above.
- ETF: do NOT target unleveraged ETFs (NTLI, TECHQ, DEFX) or leveraged ETFs (NTLU, NTLD) directly — their prices are automatically derived from their underlying holdings. Only include an ETF if the post is explicitly about the fund itself (essentially never). Instead, adjust the underlying stocks.
- COMMODITY: GOLD and SLVR are safe havens — they rise on fear, geopolitical instability, war threats, inflation panic, or attacks on the financial system, and drift down on strong "everything is great" confidence. OILC (crude oil) reacts to energy policy, drilling bans/expansions, wars in oil regions, strategic reserve actions, and OPEC-style supply news. Commodity moves are usually smaller than single-stock moves (+/- 1-6%) except for direct supply shocks.
- CRYPTO: BTCX and ETHX react strongly to regulatory news (bans, crackdowns, legalization, a "strategic crypto reserve"), monetary policy fears, and distrust of banks/fiat. They are extremely volatile: credible crypto-specific news can move them +/- 10-25%. They also catch a mild safe-haven/anti-establishment bid when the president attacks banks or the currency.

Respond ONLY with a valid JSON array, nothing else. Examples:
Post: "Just signed a $50 billion defense contract with Ironclad Defense Systems!"
Response: [{"symbol":"DFNS","impactPercent":12.5,"reason":"Major government contract announcement"},{"symbol":"SNTL","impactPercent":3.2,"reason":"Defense sector positive spillover"},{"symbol":"AERO","impactPercent":2.1,"reason":"Defense spending tailwind for aerospace"}]

Post: "Effective immediately, electric vehicles are BANNED on federal highways. Gas cars forever!"
Response: [{"symbol":"VLTA","impactPercent":-14.0,"reason":"EV maker directly hit by federal EV ban"},{"symbol":"MNRL","impactPercent":-4.5,"reason":"Lithium and copper demand falls with EV market"},{"symbol":"AMRN","impactPercent":3.5,"reason":"Gasoline demand outlook improves"},{"symbol":"OILC","impactPercent":2.8,"reason":"Higher expected oil consumption"}]

Post: "Cryptocurrency is a scam and I am instructing the Treasury to ban it within 90 days."
Response: [{"symbol":"BTCX","impactPercent":-22.0,"reason":"Presidential ban announcement"},{"symbol":"ETHX","impactPercent":-24.0,"reason":"Presidential ban announcement"},{"symbol":"GOLD","impactPercent":1.5,"reason":"Flight to traditional safe haven"}]

Post: "Guys, GNMX created the most revolutionary product that will cure cancer! First trials succeeded on me. they cured my skin, colon, and brain cancer!"
Response: [{"symbol":"GNMX","impactPercent":22.0,"reason":"Presidential miracle-cure endorsement sends retail traders piling in"},{"symbol":"HLSN","impactPercent":-3.0,"reason":"A universal cancer cure threatens existing oncology drug revenue"}]

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
