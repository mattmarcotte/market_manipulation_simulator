import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { Kafka, logLevel, Producer } from "kafkajs";
import path from "path";
import { MarketEngine } from "../../src/lib/market-engine";

// --- Load Protos ---

const orderProtoPath = path.resolve(__dirname, "../../proto/order.proto");
const accountProtoPath = path.resolve(__dirname, "../../proto/account.proto");

const loadOpts = { keepCase: false, longs: String, enums: String, defaults: true, oneofs: true };

const orderPkg = grpc.loadPackageDefinition(protoLoader.loadSync(orderProtoPath, loadOpts)) as any;
const accountPkg = grpc.loadPackageDefinition(protoLoader.loadSync(accountProtoPath, loadOpts)) as any;

// --- Account Service Client (gRPC) ---

const ACCOUNT_SERVICE_ADDR = process.env.ACCOUNT_SERVICE_ADDR || "localhost:50051";
const accountClient = new accountPkg.account.AccountService(
  ACCOUNT_SERVICE_ADDR,
  grpc.credentials.createInsecure()
);

function checkBalance(accountId: string, amount: number): Promise<{ sufficient: boolean; availableCash: number }> {
  return new Promise((resolve, reject) => {
    accountClient.checkBalance({ accountId, amount }, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

function checkPosition(accountId: string, symbol: string, shares: number): Promise<{ sufficient: boolean; heldShares: number }> {
  return new Promise((resolve, reject) => {
    accountClient.checkPosition({ accountId, symbol, shares }, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

function applyFill(event: {
  accountId: string;
  orderId: string;
  symbol: string;
  side: string;
  shares: number;
  fillPrice: number;
  timestamp: number;
}): Promise<{ success: boolean; cash: number }> {
  return new Promise((resolve, reject) => {
    accountClient.applyFill({
      accountId: event.accountId,
      orderId: event.orderId,
      symbol: event.symbol,
      side: event.side,
      shares: event.shares,
      fillPrice: event.fillPrice,
      timestamp: event.timestamp,
    }, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

// --- Kafka Producer ---

let kafkaProducer: Producer | null = null;

async function initKafka(retries = 5): Promise<void> {
  const broker = process.env.KAFKA_BROKER || "localhost:9092";
  const kafka = new Kafka({
    clientId: "order-service",
    brokers: [broker],
    logLevel: logLevel.WARN,
    retry: { retries: 10, initialRetryTime: 1000 },
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      kafkaProducer = kafka.producer();
      await kafkaProducer.connect();
      console.log("[Order Service] Kafka producer connected");
      return;
    } catch (err) {
      console.warn(`[Order Service] Kafka connection attempt ${attempt}/${retries} failed:`, (err as Error).message);
      kafkaProducer = null;
      if (attempt < retries) {
        const delay = attempt * 2000;
        console.log(`[Order Service] Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  console.warn("[Order Service] Kafka not available after all retries — fills will only be applied via gRPC.");
}

async function publishOrderFilled(event: {
  accountId: string;
  orderId: string;
  symbol: string;
  side: string;
  shares: number;
  fillPrice: number;
  timestamp: number;
}): Promise<void> {
  // Always apply via direct gRPC call for immediate consistency
  await applyFill(event);
  console.log(`[Order Service] Applied fill via gRPC: ${event.side} ${event.shares} ${event.symbol} @ $${event.fillPrice}`);

  // Also publish to Kafka for event sourcing / other consumers
  if (kafkaProducer) {
    try {
      await kafkaProducer.send({
        topic: "order-filled",
        messages: [{
          key: event.orderId,
          value: JSON.stringify(event),
        }],
      });
      console.log(`[Order Service] Published OrderFilled to Kafka`);
    } catch (err) {
      console.warn("[Order Service] Kafka publish failed (fill already applied via gRPC):", (err as Error).message);
    }
  }
}

// --- Market Engine (for price discovery) ---

const marketEngine = new MarketEngine();
// Run the engine to have current prices
let latestPrices = new Map<string, { bid: number; ask: number }>();

function updatePrices() {
  const ticks = marketEngine.tick();
  for (const tick of ticks) {
    latestPrices.set(tick.symbol, { bid: tick.bid, ask: tick.ask });
  }
}

// Tick every 5 seconds (1 simulated day)
setInterval(updatePrices, 5000);
updatePrices();

// --- Order Storage ---

interface Order {
  orderId: string;
  accountId: string;
  symbol: string;
  side: string;
  shares: number;
  fillPrice: number;
  status: string;
  timestamp: number;
}

const orders = new Map<string, Order>();

// --- gRPC Service Implementation ---

const orderServiceImpl = {
  async placeOrder(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const { accountId, symbol, side, shares } = call.request;

    // Validate inputs
    if (!symbol || !side || !shares || shares <= 0) {
      return callback(null, { success: false, error: "Invalid order parameters", status: "rejected" });
    }

    const priceData = latestPrices.get(symbol);
    if (!priceData) {
      return callback(null, { success: false, error: `Unknown symbol: ${symbol}`, status: "rejected" });
    }

    const fillPrice = side === "buy" ? priceData.ask : priceData.bid;

    try {
      // Step 1: Validate with Account Service via gRPC
      if (side === "buy") {
        const totalCost = shares * fillPrice;
        const balanceCheck = await checkBalance(accountId, totalCost);
        if (!balanceCheck.sufficient) {
          return callback(null, {
            success: false,
            error: `Insufficient cash. Need $${totalCost.toFixed(2)}, have $${balanceCheck.availableCash.toFixed(2)}`,
            status: "rejected",
          });
        }
      } else if (side === "sell") {
        const posCheck = await checkPosition(accountId, symbol, shares);
        if (!posCheck.sufficient) {
          return callback(null, {
            success: false,
            error: `Insufficient shares. Want to sell ${shares}, hold ${posCheck.heldShares}`,
            status: "rejected",
          });
        }
      } else {
        return callback(null, { success: false, error: "Side must be 'buy' or 'sell'", status: "rejected" });
      }

      // Step 2: Fill the order
      const orderId = crypto.randomUUID();
      const timestamp = Date.now();

      const order: Order = {
        orderId,
        accountId,
        symbol,
        side,
        shares,
        fillPrice,
        status: "filled",
        timestamp,
      };
      orders.set(orderId, order);

      // Step 3: Publish OrderFilled event to Kafka
      await publishOrderFilled({
        accountId,
        orderId,
        symbol,
        side,
        shares,
        fillPrice,
        timestamp,
      });

      console.log(`[Order Service] Order ${orderId}: ${side} ${shares} ${symbol} @ $${fillPrice.toFixed(2)} — FILLED`);

      callback(null, {
        success: true,
        orderId,
        fillPrice,
        status: "filled",
      });
    } catch (err) {
      console.error("[Order Service] Error processing order:", err);
      callback(null, {
        success: false,
        error: `Internal error: ${(err as Error).message}`,
        status: "rejected",
      });
    }
  },

  getOrderStatus(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const { orderId } = call.request;
    const order = orders.get(orderId);
    if (!order) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Order not found" });
    }
    callback(null, {
      orderId: order.orderId,
      status: order.status,
      symbol: order.symbol,
      side: order.side,
      shares: order.shares,
      fillPrice: order.fillPrice,
      timestamp: order.timestamp,
    });
  },
};

// --- Start Server ---

const PORT = process.env.ORDER_SERVICE_PORT || "50052";

async function main() {
  await initKafka();

  const server = new grpc.Server();
  server.addService(orderPkg.order.OrderService.service, orderServiceImpl);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind:", err);
        process.exit(1);
      }
      console.log(`[Order Service] gRPC server running on port ${port}`);
      console.log(`[Order Service] Connected to Account Service at ${ACCOUNT_SERVICE_ADDR}`);
    }
  );
}

main().catch(console.error);
