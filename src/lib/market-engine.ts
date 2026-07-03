import { TICKERS, TickerConfig } from "./tickers";

export interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  dayNumber: number;
}

interface TickerState {
  config: TickerConfig;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  prevClose: number;
}

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export class MarketEngine {
  private state: Map<string, TickerState> = new Map();
  private dayNumber = 0;

  constructor() {
    for (const config of TICKERS) {
      const jitter = 1 + (Math.random() - 0.5) * 0.06;
      const price = +(config.basePrice * jitter).toFixed(2);
      this.state.set(config.symbol, {
        config,
        price,
        open: price,
        high: price,
        low: price,
        volume: 0,
        prevClose: price,
      });
    }
  }

  tick(): PriceTick[] {
    this.dayNumber++;
    const ticks: PriceTick[] = [];
    const dt = 1 / 252; // one trading day

    // correlate market-wide sentiment
    const marketShock = gaussianRandom() * 0.3;

    for (const [symbol, s] of this.state) {
      const { volatility, drift, beta } = s.config;

      // individual stock move = drift + beta * market factor + idiosyncratic
      const idiosyncratic = gaussianRandom();
      const dW = (beta * marketShock + idiosyncratic * Math.sqrt(1 - beta * beta * 0.09)) * Math.sqrt(dt);
      const dS = drift * dt + volatility * dW;
      const newPrice = +(s.price * (1 + dS)).toFixed(2);
      const clampedPrice = Math.max(0.01, newPrice);

      // simulate intraday high/low around the close
      const dayRange = Math.abs(dS) + volatility * Math.sqrt(dt) * 0.5 * Math.random();
      const dayHigh = +(Math.max(s.price, clampedPrice) * (1 + dayRange * Math.random() * 0.5)).toFixed(2);
      const dayLow = +(Math.min(s.price, clampedPrice) * (1 - dayRange * Math.random() * 0.5)).toFixed(2);

      const dailyVolume = Math.floor(
        (s.config.sharesOutstanding * 1_000_000 * (0.005 + Math.random() * 0.015))
      );

      const spread = +(clampedPrice * 0.0008).toFixed(2) || 0.01;

      const tick: PriceTick = {
        symbol,
        price: clampedPrice,
        change: +(clampedPrice - s.prevClose).toFixed(2),
        changePercent: +(((clampedPrice - s.prevClose) / s.prevClose) * 100).toFixed(2),
        volume: dailyVolume,
        bid: +(clampedPrice - spread).toFixed(2),
        ask: +(clampedPrice + spread).toFixed(2),
        high: dayHigh,
        low: Math.max(0.01, dayLow),
        open: +(s.price * (1 + (Math.random() - 0.5) * volatility * Math.sqrt(dt) * 0.3)).toFixed(2),
        timestamp: Date.now(),
        dayNumber: this.dayNumber,
      };

      s.prevClose = s.price;
      s.price = clampedPrice;
      s.open = tick.open;
      s.high = dayHigh;
      s.low = Math.max(0.01, dayLow);
      s.volume = dailyVolume;

      ticks.push(tick);
    }

    return ticks;
  }

  applyShock(symbol: string, percentChange: number) {
    const s = this.state.get(symbol);
    if (!s) return;
    const newPrice = +(s.price * (1 + percentChange)).toFixed(2);
    s.price = Math.max(0.01, newPrice);
    s.high = Math.max(s.high, s.price);
    s.low = Math.min(s.low, s.price);
  }

  getPrice(symbol: string): number | undefined {
    return this.state.get(symbol)?.price;
  }

  getDayNumber(): number {
    return this.dayNumber;
  }
}

// Hoist the singleton onto globalThis so every route bundle and HMR reload
// shares one engine instance (module scope is re-instantiated per bundle in Next.js dev).
const globalStore = globalThis as unknown as { __marketEngine?: MarketEngine };

export function getMarketEngine(): MarketEngine {
  if (!globalStore.__marketEngine) globalStore.__marketEngine = new MarketEngine();
  return globalStore.__marketEngine;
}
