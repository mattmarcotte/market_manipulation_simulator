// Shared game-rule constants used by both server (market simulation) and
// client (objective UI). Keep this file free of server-only imports so it can
// be bundled into the browser.

export const TRADING_DAYS_PER_YEAR = 252;
export const GAME_DURATION_YEARS = 2;

/** The player's term: maximize net worth over their first 2 years (504 trading days). */
export const GAME_DURATION_DAYS = TRADING_DAYS_PER_YEAR * GAME_DURATION_YEARS; // 504

export const STARTING_NET_WORTH = 1_000_000;
