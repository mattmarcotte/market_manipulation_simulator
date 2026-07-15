import { getMarketEngine } from "./market-engine";
import { hasPost } from "./social-feed";

export interface MarketAdjustment {
  symbol: string;
  impactPercent: number; // e.g. +5.0 or -3.2
  reason: string;
  postId: string;
  timestamp: number;
}

type AdjustmentListener = (adjustment: MarketAdjustment) => void;

// Shared across route bundles / HMR reloads via globalThis — the Kafka
// consumer and the SSE route must see the same listener set.
const globalStore = globalThis as unknown as {
  __adjListeners?: Set<AdjustmentListener>;
  __recentAdjustments?: MarketAdjustment[];
};
const listeners = (globalStore.__adjListeners ??= new Set<AdjustmentListener>());
const recentAdjustments = (globalStore.__recentAdjustments ??= []);

export function applyAdjustment(adjustment: MarketAdjustment) {
  // Drop analyses that finish after their post was wiped (game restart) —
  // otherwise an in-flight Gemini result would shock the fresh market.
  if (adjustment.postId && !hasPost(adjustment.postId)) {
    console.log(`[Market] Dropping stale adjustment for cleared post ${adjustment.postId}`);
    return;
  }

  recentAdjustments.unshift(adjustment);
  if (recentAdjustments.length > 100) recentAdjustments.pop();

  const engine = getMarketEngine();
  engine.applyShock(adjustment.symbol, adjustment.impactPercent / 100);

  for (const listener of listeners) {
    listener(adjustment);
  }

  console.log(
    `[Market] ${adjustment.symbol} ${adjustment.impactPercent > 0 ? "+" : ""}${adjustment.impactPercent}% — ${adjustment.reason}`
  );
}

export function getRecentAdjustments(limit = 20): MarketAdjustment[] {
  return recentAdjustments.slice(0, limit);
}

/** Wipe adjustment history (game restart). */
export function clearAdjustments() {
  recentAdjustments.length = 0;
}

export function onAdjustment(listener: AdjustmentListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
