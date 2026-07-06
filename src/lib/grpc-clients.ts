import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const loadOpts = {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

// --- Order Service Client ---

const orderProtoPath = path.resolve(process.cwd(), "proto/order.proto");
const orderPkg = grpc.loadPackageDefinition(
  protoLoader.loadSync(orderProtoPath, loadOpts)
) as any;

const ORDER_SERVICE_ADDR = process.env.ORDER_SERVICE_ADDR || "localhost:50052";

let orderClient: any = null;
function getOrderClient() {
  if (!orderClient) {
    orderClient = new orderPkg.order.OrderService(
      ORDER_SERVICE_ADDR,
      grpc.credentials.createInsecure()
    );
  }
  return orderClient;
}

export function placeOrder(request: {
  accountId: string;
  symbol: string;
  side: string;
  shares: number;
  leverage?: number;
}): Promise<{
  success: boolean;
  orderId: string;
  error: string;
  fillPrice: number;
  status: string;
}> {
  return new Promise((resolve, reject) => {
    getOrderClient().placeOrder(
      { ...request, leverage: request.leverage || 1 },
      (err: any, res: any) => {
        if (err) reject(err);
        else resolve(res);
      }
    );
  });
}

export function getOrderStatus(orderId: string): Promise<{
  orderId: string;
  status: string;
  symbol: string;
  side: string;
  shares: number;
  fillPrice: number;
  timestamp: number;
}> {
  return new Promise((resolve, reject) => {
    getOrderClient().getOrderStatus({ orderId }, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

// --- Account Service Client ---

const accountProtoPath = path.resolve(process.cwd(), "proto/account.proto");
const accountPkg = grpc.loadPackageDefinition(
  protoLoader.loadSync(accountProtoPath, loadOpts)
) as any;

const ACCOUNT_SERVICE_ADDR = process.env.ACCOUNT_SERVICE_ADDR || "localhost:50051";

let accountClient: any = null;
function getAccountClient() {
  if (!accountClient) {
    accountClient = new accountPkg.account.AccountService(
      ACCOUNT_SERVICE_ADDR,
      grpc.credentials.createInsecure()
    );
  }
  return accountClient;
}

export function getPortfolio(accountId: string): Promise<{
  cash: number;
  positions: Array<{
    symbol: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    marketValue: number;
    pnl: number;
    marginDebt: number;
    leverage: number;
  }>;
  netWorth: number;
  recentTrades: Array<{
    id: string;
    symbol: string;
    side: string;
    shares: number;
    price: number;
    timestamp: number;
  }>;
  totalMarginDebt: number;
}> {
  return new Promise((resolve, reject) => {
    getAccountClient().getPortfolio({ accountId }, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}
