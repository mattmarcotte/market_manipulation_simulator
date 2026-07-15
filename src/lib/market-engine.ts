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
    this.reset();
  }

  /** Re-roll all prices from base configs and rewind the day counter to 0. */
  reset() {
    this.state.clear();
    this.dayNumber = 0;
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

  /** Current prices as ticks WITHOUT advancing the simulation (for display while paused at day 0). */
  snapshotTicks(): PriceTick[] {
    const ticks: PriceTick[] = [];
    for (const [symbol, s] of this.state) {
      const spread = +(s.price * 0.0008).toFixed(2) || 0.01;
      ticks.push({
        symbol,
        price: s.price,
        change: 0,
        changePercent: 0,
        volume: s.volume,
        bid: +(s.price - spread).toFixed(2),
        ask: +(s.price + spread).toFixed(2),
        high: s.high,
        low: s.low,
        open: s.open,
        timestamp: Date.now(),
        dayNumber: this.dayNumber,
      });
    }
    return ticks;
  }

  tick(): PriceTick[] {
    this.dayNumber++;
    const ticks: PriceTick[] = [];
    const dt = 1 / 252; // one trading day

    // correlate market-wide sentiment
    const marketShock = gaussianRandom() * 0.3;

    // Pass 1: independently-simulated assets (stocks, commodities, crypto) via GBM.
    for (const [symbol, s] of this.state) {
      if (s.config.assetType === "etf") continue; // ETFs are derived in pass 2

      const { volatility, drift, beta } = s.config;

      const idiosyncratic = gaussianRandom();
      const dW = (beta * marketShock + idiosyncratic * Math.sqrt(1 - beta * beta * 0.09)) * Math.sqrt(dt);
      const dS = drift * dt + volatility * dW;
      const newPrice = +(s.price * (1 + dS)).toFixed(2);

      ticks.push(this.finalizeTick(symbol, s, newPrice, dS, dt));
    }

    // Pass 2: ETFs — price derived from the weighted daily return of their holdings,
    // scaled by leverage. Computed after pass 1 so underlying prevClose/price are both current.
    for (const [symbol, s] of this.state) {
      if (s.config.assetType !== "etf") continue;

      const leverage = s.config.leverage ?? 1;
      const holdings = s.config.holdings ?? [];

      let weightedReturn = 0;
      let totalWeight = 0;
      for (const h of holdings) {
        const underlying = this.state.get(h.symbol);
        if (!underlying || underlying.prevClose <= 0) continue;
        const dailyReturn = underlying.price / underlying.prevClose - 1;
        weightedReturn += h.weight * dailyReturn;
        totalWeight += h.weight;
      }
      if (totalWeight > 0) weightedReturn /= totalWeight;

      const dS = leverage * weightedReturn;
      const newPrice = +(s.price * (1 + dS)).toFixed(2);

      ticks.push(this.finalizeTick(symbol, s, newPrice, dS, dt));
    }

    return ticks;
  }

  private finalizeTick(symbol: string, s: TickerState, rawNewPrice: number, dS: number, dt: number): PriceTick {
    const clampedPrice = Math.max(0.01, rawNewPrice);

    // simulate intraday high/low around the close
    const dayRange = Math.abs(dS) + s.config.volatility * Math.sqrt(dt) * 0.5 * Math.random();
    const dayHigh = +(Math.max(s.price, clampedPrice) * (1 + dayRange * Math.random() * 0.5)).toFixed(2);
    const dayLow = +(Math.min(s.price, clampedPrice) * (1 - dayRange * Math.random() * 0.5)).toFixed(2);

    const dailyVolume =
      s.config.assetType === "commodity" || s.config.assetType === "crypto" || s.config.assetType === "etf"
        ? Math.floor(1_000_000 + Math.random() * 20_000_000)
        : Math.floor(s.config.sharesOutstanding * 1_000_000 * (0.005 + Math.random() * 0.015));

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
      open: +(s.price * (1 + (Math.random() - 0.5) * s.config.volatility * Math.sqrt(dt) * 0.3)).toFixed(2),
      timestamp: Date.now(),
      dayNumber: this.dayNumber,
    };

    s.prevClose = s.price;
    s.price = clampedPrice;
    s.open = tick.open;
    s.high = dayHigh;
    s.low = Math.max(0.01, dayLow);
    s.volume = dailyVolume;

    return tick;
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
