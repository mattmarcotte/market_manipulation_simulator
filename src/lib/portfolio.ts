export interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  timestamp: number;
}

export interface Portfolio {
  cash: number;
  positions: Map<string, Position>;
  trades: Trade[];
}

const STARTING_CASH = 1_000_000;

let portfolio: Portfolio | null = null;

export function getPortfolio(): Portfolio {
  if (!portfolio) {
    portfolio = {
      cash: STARTING_CASH,
      positions: new Map(),
      trades: [],
    };
  }
  return portfolio;
}

export function executeTrade(
  side: "buy" | "sell",
  symbol: string,
  shares: number,
  price: number
): { success: boolean; error?: string; trade?: Trade } {
  const p = getPortfolio();

  if (shares <= 0) return { success: false, error: "Shares must be positive" };

  if (side === "buy") {
    const cost = shares * price;
    if (cost > p.cash) return { success: false, error: "Insufficient cash" };

    p.cash -= cost;
    const existing = p.positions.get(symbol);
    if (existing) {
      const totalCost = existing.avgCost * existing.shares + cost;
      existing.shares += shares;
      existing.avgCost = totalCost / existing.shares;
    } else {
      p.positions.set(symbol, { symbol, shares, avgCost: price });
    }
  } else {
    const existing = p.positions.get(symbol);
    if (!existing || existing.shares < shares) {
      return { success: false, error: "Insufficient shares" };
    }

    p.cash += shares * price;
    existing.shares -= shares;
    if (existing.shares === 0) p.positions.delete(symbol);
  }

  const trade: Trade = {
    id: crypto.randomUUID(),
    symbol,
    side,
    shares,
    price,
    timestamp: Date.now(),
  };
  p.trades.push(trade);

  return { success: true, trade };
}

export function getNetWorth(prices: Map<string, number>): number {
  const p = getPortfolio();
  let total = p.cash;
  for (const [symbol, pos] of p.positions) {
    total += pos.shares * (prices.get(symbol) ?? pos.avgCost);
  }
  return total;
}
