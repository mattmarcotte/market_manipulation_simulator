# POTUS Market

**Manipulate the stock market without getting arrested for real!**

A presidential trading simulator. You are the President of the United States: trade a simulated real-time stock market with one hand while posting on social media with the other. An AI reads your posts and moves the market accordingly — profit from your own policy announcements.

## Objective

**Maximize your net worth over your first 2 years in office** — 504 simulated trading days. You start with $1,000,000. The simulation always begins **paused** at day 0; press play to start your term. The objective bar tracks your progress (year/day and net worth vs. your starting stake), and the simulation auto-freezes when the term ends. A **restart button** (↺, with confirmation) resets everything: day counter to 0, fresh re-rolled prices, cleared charts, the Chirper feed wiped clean, and the player's account back to $1,000,000 with no positions or trade history.

## Features

### The Oval Office (game presentation)
- **Pixel-art desk POV** (NimbleBit-style: outlined, instantly recognizable objects on a 960×540 grid): you sit at the Resolute Desk with a laptop running your brokerage and your phone propped beside it running Chirper. The room has a curved ceiling cove with dentil molding, a chandelier, gold drapes, flags, a grandfather clock, a gold-framed landscape, and night windows with the Washington Monument.
- **Satirical set dressing**: a framed **DOW 100K** chart (only goes up) and a golf **SCORECARD: 18 HOLES, 18 UNDER** on the wall, a stack of **TOP SECRET / CLASSIFIED** document boxes on the floor, a putting green with flag, a golf bag with a putter leaning on it, and a marble bust wearing the red cap. On the desk: a green banker's lamp, the red **HOTLINE** phone, the MSGA cap, executive-order folders, a standing "EMPLOYEE OF THE MONTH: ★ME★" frame, a diet cola can, a "100% LEGAL" mug, and a cactus.
- **YugeTrade** ("America's #1 Broker — *self-reported"): the trading UI lives inside a laptop frame with browser chrome, a brokerage site header (Investing · Crypto · Gold · Taxes · Loopholes), and the objective bar, chart, market browser, trade panel, and portfolio as the site content.
- **Chirper on the phone**: the social feed renders inside a phone frame with a status bar, X-style app header, and bottom tab bar.

### Simulated stock market
- **28 fictional companies** across 13 sectors (energy, tech, healthcare, finance, defense, media, telecom, industrials, consumer, real estate, and more) with realistic fundamentals: market cap, P/E, EPS, revenue, dividend yield, beta, debt/equity, profit margin.
- **Index & sector ETFs**: `NTLI` (NTL 500 index fund, market-cap weighted), `NTLU`/`NTLD` (2x bull / -2x bear leveraged index funds), `TECHQ` and `DEFX` (sector baskets). ETF prices are derived each tick from the weighted daily return of their underlying holdings, with leverage compounding daily — leveraged ETFs realistically decay in choppy markets, just like the real thing.
- **Commodities**: `GOLD`, `SLVR` (silver), `OILC` (crude oil) — independently simulated spot prices with low correlation to the equity market.
- **Simulated cryptocurrencies**: `BTCX` (SimCoin), `ETHX` (AetherCoin) — high-volatility, high-drift GBM assets that trade like crypto.
- **Geometric Brownian Motion** price engine with beta-correlated market-wide shocks — stocks (and to a lesser extent commodities/crypto) move together like a real market.
- **Accelerated time**: one simulated trading day every 2.5 seconds, rendered as daily candles. The player controls a **play/pause button** (starts paused); the simulation auto-pauses at the end of the 504-day term.
- **NTL 500 index** — market-cap-weighted analogue of the S&P 500 (also directly tradable as `NTLI`).
- **Live candlestick + volume charts** (TradingView lightweight-charts) for any ticker in focus, with sparkline mini-charts and asset-type badges (STK/ETF/CMDTY/CRYPTO, plus leverage e.g. `2x`) on every row of the market table.
- **Market browser UX**: asset-class tabs (All / Stocks / ETFs / Commodities / Crypto), free-text search across symbol, name, sector, and industry, and click-to-sort column headers (symbol, price, chg%, market cap, volume). Every row carries a small industry icon (⚡ energy, 💻 tech, 💊 healthcare, 🛡️ defense, …) and non-stock assets get their own (🥇 gold, 🛢️ oil, 🪙 crypto, 📊/📈/📉 for 1x/leveraged/inverse ETFs).
- Per-ticker stat panel: bid/ask, day high/low, 52-week range, average volume, description, and — for ETFs — a breakdown of underlying holdings and weights.

### Trading terminal
- Buy/sell at market with bid/ask spread, starting with $1,000,000 cash.
- **Short selling**: `short` opens/adds to a negative position (credited full proceeds at the bid); `cover` buys back shares to reduce/close it. P&L uses one formula for both directions (`shares × (currentPrice − avgCost)`), so gains/losses on shorts show correctly without special-casing.
- **Leverage (1x–5x)** on `buy` and `short` orders. Leveraged longs only spend `cost / leverage` of your own cash — the rest is tracked as **margin debt** against that position and automatically repaid (proportionally) as you sell. Leveraged shorts reduce the margin required to open the position. Net worth always accounts for outstanding margin debt.
- Live portfolio: net worth, cash, total margin debt, open positions with P&L marked to the streaming price, SHORT/leverage badges per position.
- One-click **Close @ Market** button on every open position — automatically sells longs or covers shorts.

### Chirper — presidential social media
- Twitter-like feed where you post as **@POTUS** (280-char limit).
- Every post is analyzed by **Gemini** for market impact. Posts can move one stock, ripple across a sector, or do nothing. The market runs on **hype, not credibility**: wild, unscientific, or miracle claims ("GNMX cured my cancer!", "this truck literally flies") send stocks soaring — the crowd doesn't fact-check the President. Only pure small talk with no company/industry angle gets ignored.
- **Indirect targeting**: posts don't need to name tickers. Gemini matches posts to companies by their business — "I'm banning electric vehicles" tanks VLTA (EV maker), drags down MNRL (lithium miner, second-order supply-chain effect), and lifts AMRN and OILC (gasoline demand). Asset-type-aware rules: GOLD/SLVR catch safe-haven bids on fear, OILC reacts to energy policy, BTCX/ETHX swing hard (±10-25%) on regulatory news, and ETFs are never targeted directly — they move via their underlying holdings.
- Real-time visual feedback: "Markets analyzing…" indicator → per-post impact badges (e.g. `CLDW +12%`), toast banners, and the price shock hitting the chart within a couple of ticks. Posts with no effect resolve to "No significant market impact."

### Planned
- **Randomly generated posts from other accounts** (news outlets, CEOs, pundits, randos) appearing in the Chirper feed, which may or may not move the market per Gemini's judgment — so the market reacts to a noisy information environment, not just you.

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │                 Browser (UI)                │
                        │  Trading terminal · Charts · Chirper feed   │
                        └───────▲───────────────▲────────────┬────────┘
                                │ SSE           │ SSE        │ HTTP POST
                     /api/market/stream  /api/social/stream  /api/social/post · /api/trade
                                │               │            │
┌───────────────────────────────┴───────────────┴────────────▼─────────────────────────┐
│                          Next.js server (HTTP ⇄ gRPC/Kafka gateway)                  │
│                                                                                       │
│   MarketEngine (GBM ticks, applyShock)  ──  MarketStreamer (candles, NTL 500 index)   │
│   social-feed store  ──  market-adjustments pub/sub  ──  Kafka adjustment consumer    │
│   (singletons shared across route bundles via globalThis)                             │
└──────┬──────────────────────────────┬───────────────────────────────▲────────────────┘
       │ gRPC                         │ Kafka produce                 │ Kafka consume
       ▼                              ▼                               │
┌──────────────────┐        ┌──────────────────┐   consume   ┌────────┴─────────────┐
│ Order Service    │  gRPC  │ Kafka (KRaft)    │────────────▶│ Sentiment Service    │
│ :50052           │───────▶│  social-posts    │             │ (Gemini 2.5 Flash)   │
│ validate & fill  │        │  order-filled    │◀────────────│ post → JSON impacts  │
└──────┬───────────┘        │  market-adjust.  │   produce   └──────────────────────┘
       │ gRPC ApplyFill     └──────────────────┘
       ▼
┌──────────────────┐
│ Account Service  │
│ :50051           │
│ cash, positions, │
│ fill dedup       │
└──────────────────┘
```

### Components

| Component | Tech | Role |
|---|---|---|
| **Next.js app** (`src/`) | Next.js 16, TypeScript, Tailwind | UI + API routes acting as an HTTP gateway to gRPC/Kafka. Hosts the market simulation (engine + streamer) in-process and streams it to browsers over SSE (Vercel-compatible — no WebSockets). |
| **Order Service** (`services/order-service`) | Node, @grpc/grpc-js | `PlaceOrder`/`GetOrderStatus` on :50052. Validates against the Account Service, fills at bid/ask, applies the fill via gRPC (primary) and publishes `order-filled` to Kafka (event log). |
| **Account Service** (`services/account-service`) | Node, @grpc/grpc-js | Cash & positions on :50051. `CheckBalance`, `CheckPosition`, `GetPortfolio`, `ApplyFill`, `ResetAccount`. Deduplicates fills by order id across the gRPC and Kafka paths. |
| **Sentiment Service** (`services/sentiment-service`) | Node, Gemini API | Consumes `social-posts`, asks Gemini 2.5 Flash to judge market impact, produces `market-adjustments`. The ticker-catalog system prompt is sent once via `systemInstruction` (cached) — only the post text is sent per request. |
| **Kafka** (`docker-compose.yml`) | apache/kafka (KRaft, no Zookeeper) | Event backbone. Topics: `social-posts`, `market-adjustments`, `order-filled`. |

### Data flows

**Trade:** UI → `POST /api/trade` (`side`: buy/sell/short/cover, `leverage`: 1-5x) → Order Service (gRPC) → validate via Account Service (cash check scaled by leverage for buy/short, position check for sell/cover) → fill at bid/ask → `ApplyFill` (gRPC, applies the margin-debt/short accounting) + `order-filled` (Kafka) → UI polls `/api/portfolio` for enriched positions (live P&L, net worth minus margin debt).

**Chirp → market impact:** UI → `POST /api/social/post` → stored in feed + produced to `social-posts` → Sentiment Service → Gemini returns `[{symbol, impactPercent, reason}]` → produced to `market-adjustments` → Next.js Kafka consumer → `applyShock()` on the market engine + `adjustment` event over the social SSE stream → impact badge/toast in the feed, price gap on the next candle.

**Restart:** UI (↺ with confirm) → `POST /api/market/control {action: "restart"}` → `streamer.reset()` (day 0, re-rolled prices, cleared candles/index/52-week history, paused) + `ResetAccount` (gRPC — starting cash, no positions/trades) + feed & adjustment history wiped → a `reset` event on the social SSE stream clears every open Chirper (posts, badges, toasts, pending spinners). Sentiment analyses still in flight when the restart lands are dropped on arrival (their post id no longer exists in the feed), so a stale Gemini result can't shock the fresh market.

### Notable implementation details

- **Singletons on `globalThis`**: Next.js dev re-instantiates module scope per route bundle/HMR reload, which previously split the market engine and SSE listener sets into parallel copies. All shared state (engine, streamer, feed, adjustment pub/sub, consumer guard) is hoisted onto `globalThis`.
- **UI resilience**: the "Markets analyzing…" spinner resolves via a 15s timeout fallback if an adjustment event never arrives (no-impact post or dropped SSE connection), tracked per post id.
- **Deployment target**: the Next.js app deploys to Vercel (SSE, no WebSockets); gRPC services + Kafka run externally (e.g. Railway/Fly.io, Upstash Kafka).

## Running locally

```bash
# 1. Start Kafka
docker compose up -d

# 2. Configure environment (.env.local, gitignored)
#    GEMINI_API_KEY=<your key from aistudio.google.com/apikey>
#    GEMINI_MODEL=gemini-2.5-flash
#    KAFKA_BROKER=localhost:9092

# 3. Start everything (account, order, sentiment services + Next.js)
npm run dev:all   # runs scripts/dev.sh
```

Open http://localhost:3000, buy something, then chirp something consequential — e.g. *"I'm awarding an $80B defense contract to Ironclad Defense Systems!"* — and watch DFNS gap up.

> **Note:** `gemini-2.0-flash` no longer has free-tier quota (`limit: 0`); use `gemini-2.5-flash` (10 RPM / 250 req/day free).
