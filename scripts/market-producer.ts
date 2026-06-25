import { Kafka, logLevel } from "kafkajs";
import { MarketEngine } from "../src/lib/market-engine";

const BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const TOPIC = "market-prices";

async function main() {
  const kafka = new Kafka({
    clientId: "market-engine",
    brokers: [BROKER],
    logLevel: logLevel.WARN,
  });

  const producer = kafka.producer();
  await producer.connect();
  console.log("Market engine connected to Kafka — 1 day every 5 seconds");

  const engine = new MarketEngine();

  setInterval(async () => {
    const ticks = engine.tick();
    console.log(`Day ${engine.getDayNumber()}: ${ticks.map(t => `${t.symbol} $${t.price.toFixed(2)} (${t.changePercent > 0 ? '+' : ''}${t.changePercent}%)`).slice(0, 4).join(', ')}...`);
    await producer.send({
      topic: TOPIC,
      messages: ticks.map((t) => ({
        key: t.symbol,
        value: JSON.stringify(t),
      })),
    });
  }, 5000);
}

main().catch(console.error);
