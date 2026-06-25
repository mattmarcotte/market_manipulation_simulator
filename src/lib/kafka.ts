import { Kafka, Producer, Consumer, logLevel } from "kafkajs";

const BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const TOPIC = "market-prices";

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function getKafka(): Kafka {
  if (!kafka) {
    kafka = new Kafka({
      clientId: "potus-game",
      brokers: [BROKER],
      logLevel: logLevel.WARN,
      retry: { retries: 3 },
    });
  }
  return kafka;
}

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = getKafka().producer();
    await producer.connect();
  }
  return producer;
}

export async function publishPriceTicks(ticks: unknown[]): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: TOPIC,
    messages: ticks.map((t) => ({
      key: (t as { symbol: string }).symbol,
      value: JSON.stringify(t),
    })),
  });
}

export async function createConsumer(groupId: string): Promise<Consumer> {
  const consumer = getKafka().consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  return consumer;
}

export { TOPIC };
