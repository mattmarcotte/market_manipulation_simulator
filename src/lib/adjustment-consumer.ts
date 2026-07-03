import { Kafka, logLevel } from "kafkajs";
import { applyAdjustment, MarketAdjustment } from "./market-adjustments";

// Guard on globalThis so a bundle-duplicated copy of this module can't start
// a second consumer in the same Kafka group (which would trigger rebalances).
const globalStore = globalThis as unknown as { __adjConsumerStarted?: boolean };

export async function startAdjustmentConsumer() {
  if (globalStore.__adjConsumerStarted) return;
  globalStore.__adjConsumerStarted = true;

  const broker = process.env.KAFKA_BROKER || "localhost:9092";
  const kafka = new Kafka({
    clientId: "nextjs-adjustment-consumer",
    brokers: [broker],
    logLevel: logLevel.WARN,
    retry: { retries: 5, initialRetryTime: 3000 },
  });

  try {
    const consumer = kafka.consumer({
      groupId: "nextjs-adjustment-group",
    });
    await consumer.connect();
    await consumer.subscribe({ topic: "market-adjustments", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const adjustment: MarketAdjustment = JSON.parse(message.value.toString());
        applyAdjustment(adjustment);
      },
    });

    console.log("[Next.js] Kafka consumer started — listening for market-adjustments");
  } catch (err) {
    console.warn("[Next.js] Kafka adjustment consumer failed to start:", (err as Error).message);
    globalStore.__adjConsumerStarted = false;
  }
}
