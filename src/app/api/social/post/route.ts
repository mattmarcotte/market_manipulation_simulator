import { NextRequest, NextResponse } from "next/server";
import { addPost } from "@/lib/social-feed";
import { Kafka, logLevel } from "kafkajs";

const BROKER = process.env.KAFKA_BROKER || "localhost:9092";

let producer: any = null;

async function getProducer() {
  if (!producer) {
    const kafka = new Kafka({
      clientId: "social-api",
      brokers: [BROKER],
      logLevel: logLevel.WARN,
      retry: { retries: 3 },
    });
    producer = kafka.producer();
    try {
      await producer.connect();
    } catch {
      producer = null;
    }
  }
  return producer;
}

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Post content required" }, { status: 400 });
  }

  if (content.length > 280) {
    return NextResponse.json({ error: "Post too long (280 char max)" }, { status: 400 });
  }

  const post = {
    id: crypto.randomUUID(),
    author: "President",
    handle: "@POTUS",
    content: content.trim(),
    timestamp: Date.now(),
    isPresident: true,
    likes: 0,
    reposts: 0,
  };

  addPost(post);

  // Publish to Kafka for sentiment analysis
  try {
    const p = await getProducer();
    if (p) {
      await p.send({
        topic: "social-posts",
        messages: [{
          key: post.id,
          value: JSON.stringify(post),
        }],
      });
    }
  } catch (err) {
    console.warn("Kafka publish failed for social post:", err);
  }

  return NextResponse.json({ post });
}
