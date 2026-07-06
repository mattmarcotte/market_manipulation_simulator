import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { Kafka, logLevel } from "kafkajs";
import path from "path";

// --- Portfolio State ---

interface Position {
  symbol: string;
  shares: number; // negative = short position
  avgCost: number;
  marginDebt: number; // cash borrowed against a leveraged long; unused for shorts
  leverage: number; // most recent leverage used to open/add to this position
}

interface TradeRecord {
  id: string;
  symbol: string;
  side: string;
  shares: number;
  price: number;
  timestamp: number;
}

interface Account {
  cash: number;
  positions: Map<string, Position>;
  trades: TradeRecord[];
}

const STARTING_CASH = 1_000_000;
const accounts = new Map<string, Account>();
const processedOrders = new Set<string>();

function getAccount(accountId: string): Account {
  if (!accounts.has(accountId)) {
    accounts.set(accountId, {
      cash: STARTING_CASH,
      positions: new Map(),
      trades: [],
    });
  }
  return accounts.get(accountId)!;
}

// --- Kafka Consumer: listens for OrderFilled events ---

async function startKafkaConsumer(retries = 5): Promise<void> {
  const broker = process.env.KAFKA_BROKER || "localhost:9092";
  const kafka = new Kafka({
    clientId: "account-service",
    brokers: [broker],
    logLevel: logLevel.WARN,
    retry: { retries: 10, initialRetryTime: 1000 },
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const consumer = kafka.consumer({
        groupId: "account-service-group",
        retry: { retries: 10, initialRetryTime: 1000 },
      });

      await consumer.connect();
      await consumer.subscribe({ topic: "order-filled", fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          const event = JSON.parse(message.value.toString());
          applyOrderFill(event);
        },
      });

      console.log("[Account Service] Kafka consumer connected — listening for order-filled events");
      return;
    } catch (err) {
      console.warn(`[Account Service] Kafka connection attempt ${attempt}/${retries} failed:`, (err as Error).message);
      if (attempt < retries) {
        const delay = attempt * 2000;
        console.log(`[Account Service] Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  console.warn("[Account Service] Kafka not available after all retries — running without event consumption.");
}

function applyOrderFill(event: {
  accountId: string;
  orderId: string;
  symbol: string;
  side: string;
  shares: number;
  fillPrice: number;
  timestamp: number;
  leverage?: number;
}) {
  if (processedOrders.has(event.orderId)) {
    console.log(`[Account Service] Skipping duplicate fill for order ${event.orderId}`);
    return;
  }
  processedOrders.add(event.orderId);

  const account = getAccount(event.accountId);
  const leverage = Math.max(1, event.leverage || 1);

  if (event.side === "buy") {
    // Long open/add. With leverage L, only cost/L of the trader's own cash is
    // spent; the remainder is tracked as margin debt against the position.
    const cost = event.shares * event.fillPrice;
    const ownCash = cost / leverage;
    const borrowed = cost - ownCash;
    account.cash -= ownCash;

    const existing = account.positions.get(event.symbol);
    if (existing) {
      const totalCost = existing.avgCost * existing.shares + cost;
      existing.shares += event.shares;
      existing.avgCost = totalCost / existing.shares;
      existing.marginDebt += borrowed;
      existing.leverage = leverage;
    } else {
      account.positions.set(event.symbol, {
        symbol: event.symbol,
        shares: event.shares,
        avgCost: event.fillPrice,
        marginDebt: borrowed,
        leverage,
      });
    }
  } else if (event.side === "sell") {
    // Long close (partial or full). Proceeds first repay a proportional share
    // of any margin debt on the position; the rest goes to cash.
    const existing = account.positions.get(event.symbol);
    const proceeds = event.shares * event.fillPrice;
    if (existing && existing.shares > 0) {
      const fraction = Math.min(1, event.shares / existing.shares);
      const repay = existing.marginDebt * fraction;
      account.cash += proceeds - repay;
      existing.marginDebt -= repay;
      existing.shares -= event.shares;
      if (existing.shares <= 0) account.positions.delete(event.symbol);
    } else {
      account.cash += proceeds;
    }
  } else if (event.side === "short") {
    // Open/add to a short position. Full proceeds are credited to cash —
    // the accounting resolves correctly on cover because marketValue
    // (shares * price, negative for shorts) offsets the credited proceeds.
    const proceeds = event.shares * event.fillPrice;
    account.cash += proceeds;

    const existing = account.positions.get(event.symbol);
    if (existing && existing.shares < 0) {
      const totalMagnitude = -existing.shares + event.shares;
      const totalCost = existing.avgCost * -existing.shares + event.fillPrice * event.shares;
      existing.shares -= event.shares;
      existing.avgCost = totalCost / totalMagnitude;
      existing.leverage = leverage;
    } else {
      account.positions.set(event.symbol, {
        symbol: event.symbol,
        shares: -event.shares,
        avgCost: event.fillPrice,
        marginDebt: 0,
        leverage,
      });
    }
  } else if (event.side === "cover") {
    // Buy back shares to reduce/close a short position.
    const cost = event.shares * event.fillPrice;
    account.cash -= cost;

    const existing = account.positions.get(event.symbol);
    if (existing) {
      existing.shares += event.shares;
      if (existing.shares >= 0) account.positions.delete(event.symbol);
    }
  }

  account.trades.push({
    id: event.orderId,
    symbol: event.symbol,
    side: event.side,
    shares: event.shares,
    price: event.fillPrice,
    timestamp: event.timestamp,
  });

  console.log(
    `[Account Service] Applied ${event.side} ${event.shares} ${event.symbol} @ $${event.fillPrice} for account ${event.accountId}` +
    ` | Cash: $${account.cash.toFixed(2)}`
  );
}

// --- gRPC Service Implementation ---

const PROTO_PATH = path.resolve(__dirname, "../../proto/account.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

const accountServiceImpl = {
  checkBalance(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const { accountId, amount } = call.request;
    const account = getAccount(accountId);
    callback(null, {
      sufficient: account.cash >= amount,
      availableCash: account.cash,
    });
  },

  checkPosition(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const { accountId, symbol, shares } = call.request;
    const account = getAccount(accountId);
    const position = account.positions.get(symbol);
    const heldShares = position?.shares ?? 0;
    callback(null, {
      sufficient: heldShares >= shares,
      heldShares,
    });
  },

  applyFill(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const { accountId, orderId, symbol, side, shares, fillPrice, timestamp, leverage } = call.request;
    applyOrderFill({
      accountId,
      orderId,
      symbol,
      side,
      shares,
      fillPrice,
      timestamp: Number(timestamp) || Date.now(),
      leverage: Number(leverage) || 1,
    });
    const account = getAccount(accountId);
    callback(null, { success: true, cash: account.cash });
  },

  getPortfolio(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const { accountId } = call.request;
    const account = getAccount(accountId);

    const positions = Array.from(account.positions.values()).map((pos) => ({
      symbol: pos.symbol,
      shares: pos.shares,
      avgCost: pos.avgCost,
      currentPrice: pos.avgCost, // updated by frontend with live prices
      marketValue: pos.shares * pos.avgCost,
      pnl: 0,
      marginDebt: pos.marginDebt,
      leverage: pos.leverage,
    }));

    const totalMarginDebt = positions.reduce((sum, p) => sum + p.marginDebt, 0);
    const netWorth = account.cash + positions.reduce((sum, p) => sum + p.marketValue, 0) - totalMarginDebt;

    callback(null, {
      cash: account.cash,
      positions,
      netWorth,
      recentTrades: account.trades.slice(-20).reverse(),
      totalMarginDebt,
    });
  },
};

// --- Start Server ---

const PORT = process.env.ACCOUNT_SERVICE_PORT || "50051";

async function main() {
  const server = new grpc.Server();
  server.addService(proto.account.AccountService.service, accountServiceImpl);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind:", err);
        process.exit(1);
      }
      console.log(`[Account Service] gRPC server running on port ${port}`);
    }
  );

  await startKafkaConsumer();
}

main().catch(console.error);
