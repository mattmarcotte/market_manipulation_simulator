import { getMarketEngine, PriceTick } from "./market-engine";
import { AssetType, TICKERS, TickerConfig, TickerHolding } from "./tickers";
import { GAME_DURATION_DAYS } from "./game";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyStats {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  marketCap: number;
  pe: number | null;
  eps: number;
  revenue: number;
  dividendYield: number;
  beta: number;
  debtToEquity: number;
  profitMargin: number;
  volatility: number;
  week52High: number;
  week52Low: number;
  avgVolume: number;
  assetType: AssetType;
  leverage?: number;
  holdings?: TickerHolding[];
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  history: { time: number; value: number }[];
}

type Listener = (ticks: PriceTick[]) => void;

const TICK_INTERVAL_MS = 2500; // 2.5 seconds = 1 simulated trading day
const MAX_CANDLES = 300;
const MAX_INDEX_HISTORY = 400;

class MarketStreamer {
  private listeners: Set<Listener> = new Set();
  private interval: ReturnType<typeof setInterval> | null = null;
  private latestTicks: PriceTick[] = [];
  private engine = getMarketEngine();

  // The simulation always begins paused — the player presses play to start
  // their 2-year term. It also auto-pauses once the term is over.
  private paused = true;

  private candleHistory: Map<string, Candle[]> = new Map();

  private indexBaseValue = 4000;
  private indexBasePrices: Map<string, number> = new Map();
  private indexHistory: { time: number; value: number }[] = [];
  private indexOpen = 0;

  // track 52-week (252 trading days) highs/lows and avg volume
  private priceHistory: Map<string, number[]> = new Map();
  private volumeHistory: Map<string, number[]> = new Map();

  // live market cap scales with price
  private configMap: Map<string, TickerConfig> = new Map();

  constructor() {
    for (const t of TICKERS) {
      this.configMap.set(t.symbol, t);
    }
  }

  start() {
    if (this.interval) return;

    // Prime one snapshot so the market table shows prices while paused at the
    // start of a term (day stays 0 until the player presses play).
    if (!this.latestTicks.length) {
      this.latestTicks = this.engine.snapshotTicks();
    }

    this.interval = setInterval(() => {
      if (this.paused) return;
      if (this.engine.getDayNumber() >= GAME_DURATION_DAYS) {
        this.paused = true; // term over — freeze the simulation
        return;
      }
      this.latestTicks = this.engine.tick();
      this.updateCandles(this.latestTicks);
      for (const listener of this.listeners) {
        listener(this.latestTicks);
      }
    }, TICK_INTERVAL_MS);
  }

  /** Full game reset: fresh prices at day 0, cleared history, paused. */
  reset() {
    this.engine.reset();
    this.paused = true;
    this.candleHistory.clear();
    this.priceHistory.clear();
    this.volumeHistory.clear();
    this.indexBasePrices.clear();
    this.indexHistory = [];
    this.indexOpen = 0;
    this.latestTicks = this.engine.snapshotTicks();
    // Push one frame so connected clients see the reset immediately even
    // though the simulation is paused.
    for (const listener of this.listeners) {
      listener(this.latestTicks);
    }
  }

  setPaused(paused: boolean) {
    // Never resume past the end of the player's term.
    if (!paused && this.engine.getDayNumber() >= GAME_DURATION_DAYS) {
      this.paused = true;
      return;
    }
    this.paused = paused;
  }

  isPaused(): boolean {
    return this.paused;
  }

  private updateCandles(ticks: PriceTick[]) {
    for (const tick of ticks) {
      if (!this.indexBasePrices.has(tick.symbol)) {
        this.indexBasePrices.set(tick.symbol, tick.open);
      }

      // store candle per day
      const candle: Candle = {
        time: tick.dayNumber,
        open: tick.open,
        high: tick.high,
        low: tick.low,
        close: tick.price,
        volume: tick.volume,
      };
      const history = this.candleHistory.get(tick.symbol) || [];
      history.push(candle);
      if (history.length > MAX_CANDLES) history.shift();
      this.candleHistory.set(tick.symbol, history);

      // track price/volume for stats
      const prices = this.priceHistory.get(tick.symbol) || [];
      prices.push(tick.price);
      if (prices.length > 252) prices.shift();
      this.priceHistory.set(tick.symbol, prices);

      const volumes = this.volumeHistory.get(tick.symbol) || [];
      volumes.push(tick.volume);
      if (volumes.length > 252) volumes.shift();
      this.volumeHistory.set(tick.symbol, volumes);
    }

    // update index
    const indexValue = this.computeIndex(ticks);
    if (this.indexOpen === 0) this.indexOpen = indexValue;
    const dayNum = ticks[0]?.dayNumber ?? 0;
    this.indexHistory.push({ time: dayNum, value: indexValue });
    if (this.indexHistory.length > MAX_INDEX_HISTORY) this.indexHistory.shift();
  }

  private computeIndex(ticks: PriceTick[]): number {
    // market-cap weighted index
    let totalWeight = 0;
    let weightedReturn = 0;
    for (const tick of ticks) {
      const base = this.indexBasePrices.get(tick.symbol);
      const config = this.configMap.get(tick.symbol);
      if (base && base > 0 && config) {
        const weight = config.marketCap;
        weightedReturn += weight * (tick.price / base);
        totalWeight += weight;
      }
    }
    if (totalWeight === 0) return this.indexBaseValue;
    return +(this.indexBaseValue * (weightedReturn / totalWeight)).toFixed(2);
  }

  getIndex(): MarketIndex {
    const latest = this.indexHistory.length > 0
      ? this.indexHistory[this.indexHistory.length - 1].value
      : this.indexBaseValue;
    const open = this.indexOpen || this.indexBaseValue;
    return {
      name: "NTL 500",
      value: latest,
      change: +(latest - open).toFixed(2),
      changePercent: +(((latest - open) / open) * 100).toFixed(2),
      history: this.indexHistory.slice(-120),
    };
  }

  getCandles(symbol: string): Candle[] {
    return [...(this.candleHistory.get(symbol) || [])];
  }

  getAllCandles(): Record<string, Candle[]> {
    const result: Record<string, Candle[]> = {};
    for (const [symbol] of this.configMap) {
      result[symbol] = this.getCandles(symbol);
    }
    return result;
  }

  getCompanyStats(): CompanyStats[] {
    return this.latestTicks.map((tick) => {
      const config = this.configMap.get(tick.symbol)!;
      const priceRatio = tick.price / config.basePrice;
      const liveMarketCap = +(config.marketCap * priceRatio).toFixed(1);
      const liveEps = config.eps; // EPS doesn't change tick-to-tick
      const pe = liveEps > 0 ? +(tick.price / liveEps).toFixed(1) : null;

      const prices = this.priceHistory.get(tick.symbol) || [tick.price];
      const volumes = this.volumeHistory.get(tick.symbol) || [tick.volume];

      return {
        symbol: tick.symbol,
        name: config.name,
        sector: config.sector,
        industry: config.industry,
        description: config.description,
        marketCap: liveMarketCap,
        pe,
        eps: liveEps,
        revenue: config.revenue,
        dividendYield: config.dividendYield,
        beta: config.beta,
        debtToEquity: config.debtToEquity,
        profitMargin: config.profitMargin,
        volatility: +(config.volatility * 100).toFixed(1),
        week52High: Math.max(...prices),
        week52Low: Math.min(...prices),
        avgVolume: Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length),
        assetType: config.assetType,
        leverage: config.leverage,
        holdings: config.holdings,
      };
    });
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    this.start();
    if (this.latestTicks.length) listener(this.latestTicks);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getLatest(): PriceTick[] {
    if (!this.latestTicks.length) {
      this.latestTicks = this.engine.snapshotTicks();
    }
    return this.latestTicks;
  }

  getDayNumber(): number {
    return this.engine.getDayNumber();
  }
}

// Hoist onto globalThis so all route bundles and HMR reloads share one
// streamer (and thus one candle history / index / tick interval).
const globalStore = globalThis as unknown as { __marketStreamer?: MarketStreamer };

export function getMarketStreamer(): MarketStreamer {
  if (!globalStore.__marketStreamer) {
    globalStore.__marketStreamer = new MarketStreamer();
    globalStore.__marketStreamer.start();

    // Start Kafka adjustment consumer (non-blocking)
    import("./adjustment-consumer").then((m) => m.startAdjustmentConsumer()).catch(() => {});
  }
  return globalStore.__marketStreamer;
}
