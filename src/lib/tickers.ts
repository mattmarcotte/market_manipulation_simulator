export type AssetType = "stock" | "etf" | "commodity" | "crypto";

export interface TickerHolding {
  symbol: string;
  weight: number; // fraction of the basket, weights across holdings sum to ~1
}

export interface TickerConfig {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  basePrice: number;
  volatility: number; // annualized
  drift: number; // annualized
  marketCap: number; // in billions
  sharesOutstanding: number; // in millions
  eps: number; // trailing EPS
  revenue: number; // annual revenue in billions
  dividendYield: number; // annual %
  beta: number;
  debtToEquity: number;
  profitMargin: number; // %
  assetType: AssetType;
  /** Leverage multiplier applied to the daily return of `holdings` (ETFs only). 1 = unleveraged, negative = inverse. */
  leverage?: number;
  /** Basket this ETF tracks — price is derived from the weighted daily return of these underlying tickers. */
  holdings?: TickerHolding[];
}

// ---- Individual stocks ----
const STOCKS: TickerConfig[] = [
  // Energy
  {
    symbol: "AMRN", name: "Ameron Energy Corp", sector: "Energy", industry: "Oil & Gas Exploration",
    description: "Integrated oil and gas company with upstream and midstream operations across North America.",
    basePrice: 84.50, volatility: 0.35, drift: 0.02, marketCap: 142, sharesOutstanding: 1680,
    eps: 6.12, revenue: 68.4, dividendYield: 3.2, beta: 1.15, debtToEquity: 0.45, profitMargin: 12.1,
    assetType: "stock",
  },
  {
    symbol: "SLRX", name: "Solaris Clean Energy", sector: "Energy", industry: "Renewable Energy",
    description: "Develops and operates utility-scale solar and wind installations across the Sun Belt.",
    basePrice: 42.80, volatility: 0.48, drift: 0.06, marketCap: 28, sharesOutstanding: 654,
    eps: 0.87, revenue: 5.2, dividendYield: 0, beta: 1.45, debtToEquity: 1.2, profitMargin: 4.8,
    assetType: "stock",
  },
  // Technology
  {
    symbol: "NVTX", name: "Novatech Industries", sector: "Technology", industry: "Semiconductors",
    description: "Designs advanced AI accelerator chips and high-performance computing platforms.",
    basePrice: 312.00, volatility: 0.45, drift: 0.08, marketCap: 480, sharesOutstanding: 1538,
    eps: 8.45, revenue: 42.1, dividendYield: 0.4, beta: 1.55, debtToEquity: 0.22, profitMargin: 28.5,
    assetType: "stock",
  },
  {
    symbol: "CLDW", name: "CloudWave Systems", sector: "Technology", industry: "Cloud Infrastructure",
    description: "Enterprise cloud platform providing compute, storage, and AI-as-a-service solutions.",
    basePrice: 178.50, volatility: 0.42, drift: 0.07, marketCap: 215, sharesOutstanding: 1204,
    eps: 4.92, revenue: 31.8, dividendYield: 0, beta: 1.35, debtToEquity: 0.38, profitMargin: 18.7,
    assetType: "stock",
  },
  {
    symbol: "CYBX", name: "CyberVault Inc", sector: "Technology", industry: "Cybersecurity",
    description: "Zero-trust cybersecurity platform protecting enterprise networks and cloud workloads.",
    basePrice: 94.20, volatility: 0.50, drift: 0.05, marketCap: 38, sharesOutstanding: 403,
    eps: 1.88, revenue: 4.7, dividendYield: 0, beta: 1.60, debtToEquity: 0.15, profitMargin: 11.2,
    assetType: "stock",
  },
  {
    symbol: "SEMI", name: "Quantum Foundry Ltd", sector: "Technology", industry: "Semiconductor Manufacturing",
    description: "Contract chip foundry manufacturing leading-edge nodes for fabless semiconductor companies.",
    basePrice: 152.60, volatility: 0.44, drift: 0.06, marketCap: 210, sharesOutstanding: 1375,
    eps: 5.10, revenue: 36.5, dividendYield: 0.8, beta: 1.40, debtToEquity: 0.50, profitMargin: 20.2,
    assetType: "stock",
  },
  {
    symbol: "GAME", name: "Nexus Interactive", sector: "Technology", industry: "Video Games",
    description: "Publishes AAA console and mobile game franchises alongside a live-service esports platform.",
    basePrice: 61.40, volatility: 0.46, drift: 0.04, marketCap: 24, sharesOutstanding: 391,
    eps: 1.65, revenue: 6.1, dividendYield: 0, beta: 1.10, debtToEquity: 0.30, profitMargin: 10.5,
    assetType: "stock",
  },
  // Healthcare
  {
    symbol: "HLSN", name: "Halson Pharmaceuticals", sector: "Healthcare", industry: "Pharmaceuticals",
    description: "Major pharma company with blockbuster oncology and immunology drug portfolios.",
    basePrice: 56.20, volatility: 0.40, drift: 0.04, marketCap: 165, sharesOutstanding: 2936,
    eps: 3.74, revenue: 48.9, dividendYield: 2.1, beta: 0.75, debtToEquity: 0.55, profitMargin: 22.4,
    assetType: "stock",
  },
  {
    symbol: "MDVN", name: "MedVantage Health", sector: "Healthcare", industry: "Health Insurance",
    description: "National health insurance provider covering commercial, Medicare, and Medicaid markets.",
    basePrice: 285.00, volatility: 0.28, drift: 0.03, marketCap: 92, sharesOutstanding: 323,
    eps: 18.20, revenue: 124.5, dividendYield: 1.5, beta: 0.65, debtToEquity: 0.60, profitMargin: 4.7,
    assetType: "stock",
  },
  {
    symbol: "GNMX", name: "Genomix Therapeutics", sector: "Healthcare", industry: "Biotechnology",
    description: "Clinical-stage biotech developing CRISPR-based gene therapies for rare diseases.",
    basePrice: 28.40, volatility: 0.65, drift: 0.0, marketCap: 4.2, sharesOutstanding: 148,
    eps: -2.15, revenue: 0.12, dividendYield: 0, beta: 1.80, debtToEquity: 0.08, profitMargin: -890,
    assetType: "stock",
  },
  // Finance
  {
    symbol: "FRST", name: "First Continental Bank", sector: "Finance", industry: "Banking",
    description: "Top-10 US commercial bank with retail, corporate, and wealth management divisions.",
    basePrice: 142.75, volatility: 0.25, drift: 0.03, marketCap: 225, sharesOutstanding: 1576,
    eps: 11.85, revenue: 38.2, dividendYield: 2.8, beta: 0.95, debtToEquity: 1.80, profitMargin: 28.9,
    assetType: "stock",
  },
  {
    symbol: "APEX", name: "Apex Capital Markets", sector: "Finance", industry: "Investment Banking",
    description: "Global investment bank and prime brokerage with major trading desk operations.",
    basePrice: 198.30, volatility: 0.38, drift: 0.04, marketCap: 88, sharesOutstanding: 444,
    eps: 14.60, revenue: 22.1, dividendYield: 1.8, beta: 1.30, debtToEquity: 2.50, profitMargin: 24.2,
    assetType: "stock",
  },
  {
    symbol: "INSU", name: "Bastion Insurance Group", sector: "Finance", industry: "Insurance",
    description: "Multi-line insurer writing property, casualty, and life policies nationwide.",
    basePrice: 112.90, volatility: 0.20, drift: 0.025, marketCap: 76, sharesOutstanding: 673,
    eps: 8.40, revenue: 29.6, dividendYield: 2.4, beta: 0.60, debtToEquity: 0.70, profitMargin: 15.8,
    assetType: "stock",
  },
  // Agriculture
  {
    symbol: "AGRI", name: "AgriVest Holdings", sector: "Agriculture", industry: "Agricultural Products",
    description: "Vertically integrated agribusiness covering grain trading, fertilizers, and food processing.",
    basePrice: 38.90, volatility: 0.30, drift: 0.01, marketCap: 22, sharesOutstanding: 565,
    eps: 2.95, revenue: 34.8, dividendYield: 2.5, beta: 0.80, debtToEquity: 0.65, profitMargin: 5.1,
    assetType: "stock",
  },
  // Defense
  {
    symbol: "DFNS", name: "Ironclad Defense Systems", sector: "Defense", industry: "Aerospace & Defense",
    description: "Prime defense contractor building fighter jets, missile systems, and space vehicles.",
    basePrice: 198.40, volatility: 0.28, drift: 0.05, marketCap: 156, sharesOutstanding: 786,
    eps: 14.10, revenue: 52.3, dividendYield: 1.6, beta: 0.70, debtToEquity: 0.85, profitMargin: 10.8,
    assetType: "stock",
  },
  {
    symbol: "SNTL", name: "Sentinel Dynamics", sector: "Defense", industry: "Defense Electronics",
    description: "Builds radar, electronic warfare, and C4ISR systems for the US military and allies.",
    basePrice: 124.60, volatility: 0.32, drift: 0.04, marketCap: 48, sharesOutstanding: 385,
    eps: 7.80, revenue: 14.6, dividendYield: 1.2, beta: 0.75, debtToEquity: 0.40, profitMargin: 14.5,
    assetType: "stock",
  },
  {
    symbol: "AERO", name: "Skyline Aerospace", sector: "Defense", industry: "Airlines & Aerospace",
    description: "Commercial airframe manufacturer with a growing military transport and refueling contract book.",
    basePrice: 87.30, volatility: 0.34, drift: 0.03, marketCap: 58, sharesOutstanding: 664,
    eps: 4.20, revenue: 19.8, dividendYield: 0.9, beta: 1.05, debtToEquity: 1.35, profitMargin: 8.6,
    assetType: "stock",
  },
  // Media & Communications
  {
    symbol: "MDIA", name: "Pulse Media Group", sector: "Media", industry: "Digital Media",
    description: "Operates streaming platforms, social networks, and a digital advertising exchange.",
    basePrice: 67.30, volatility: 0.50, drift: -0.01, marketCap: 72, sharesOutstanding: 1070,
    eps: 1.45, revenue: 18.9, dividendYield: 0, beta: 1.40, debtToEquity: 0.70, profitMargin: 8.2,
    assetType: "stock",
  },
  {
    symbol: "TLCM", name: "TelComm Networks", sector: "Telecom", industry: "Telecommunications",
    description: "National wireless carrier and broadband provider with 80M+ subscribers.",
    basePrice: 52.40, volatility: 0.22, drift: 0.02, marketCap: 185, sharesOutstanding: 3530,
    eps: 3.28, revenue: 78.5, dividendYield: 4.5, beta: 0.55, debtToEquity: 1.40, profitMargin: 14.8,
    assetType: "stock",
  },
  // Infrastructure & Industrials
  {
    symbol: "CNST", name: "Titan Construction Co", sector: "Industrials", industry: "Construction & Engineering",
    description: "Heavy civil construction firm specializing in bridges, highways, and public works.",
    basePrice: 91.15, volatility: 0.32, drift: 0.02, marketCap: 18, sharesOutstanding: 197,
    eps: 5.40, revenue: 12.4, dividendYield: 1.4, beta: 1.10, debtToEquity: 0.90, profitMargin: 6.8,
    assetType: "stock",
  },
  {
    symbol: "RLTX", name: "RailTex Logistics", sector: "Industrials", industry: "Railroads & Freight",
    description: "Class I railroad operating 28,000 route miles across the eastern US and Canada.",
    basePrice: 215.80, volatility: 0.24, drift: 0.03, marketCap: 128, sharesOutstanding: 593,
    eps: 13.50, revenue: 24.2, dividendYield: 2.0, beta: 0.85, debtToEquity: 1.10, profitMargin: 26.5,
    assetType: "stock",
  },
  {
    symbol: "MNRL", name: "Continental Minerals Corp", sector: "Industrials", industry: "Mining & Metals",
    description: "Diversified miner of copper, lithium, and rare-earth elements used in electronics and EVs.",
    basePrice: 46.70, volatility: 0.40, drift: 0.03, marketCap: 34, sharesOutstanding: 728,
    eps: 2.80, revenue: 11.2, dividendYield: 1.8, beta: 1.25, debtToEquity: 0.60, profitMargin: 13.4,
    assetType: "stock",
  },
  {
    symbol: "WATR", name: "AquaPure Utilities", sector: "Industrials", industry: "Water Utility",
    description: "Regulated water and wastewater utility serving municipal customers across 12 states.",
    basePrice: 74.10, volatility: 0.15, drift: 0.015, marketCap: 41, sharesOutstanding: 553,
    eps: 3.10, revenue: 6.4, dividendYield: 3.4, beta: 0.35, debtToEquity: 1.05, profitMargin: 18.9,
    assetType: "stock",
  },
  // Consumer
  {
    symbol: "LUXR", name: "Luxora Brands", sector: "Consumer", industry: "Luxury Retail",
    description: "Portfolio of premium fashion, cosmetics, and lifestyle brands sold worldwide.",
    basePrice: 156.90, volatility: 0.35, drift: 0.03, marketCap: 64, sharesOutstanding: 408,
    eps: 6.25, revenue: 15.8, dividendYield: 1.0, beta: 1.20, debtToEquity: 0.55, profitMargin: 16.1,
    assetType: "stock",
  },
  {
    symbol: "FDHQ", name: "FoodHQ International", sector: "Consumer", industry: "Food & Beverage",
    description: "Global packaged food and beverage conglomerate with 200+ household brands.",
    basePrice: 68.50, volatility: 0.20, drift: 0.02, marketCap: 195, sharesOutstanding: 2847,
    eps: 3.85, revenue: 62.3, dividendYield: 3.0, beta: 0.50, debtToEquity: 0.75, profitMargin: 12.4,
    assetType: "stock",
  },
  {
    symbol: "VLTA", name: "Voltify Motors", sector: "Consumer", industry: "Electric Vehicles",
    description: "Designs and manufactures electric passenger vehicles and residential battery systems.",
    basePrice: 226.50, volatility: 0.58, drift: 0.09, marketCap: 118, sharesOutstanding: 521,
    eps: 1.90, revenue: 21.4, dividendYield: 0, beta: 1.75, debtToEquity: 0.40, profitMargin: 6.2,
    assetType: "stock",
  },
  {
    symbol: "HTEL", name: "Meridian Hospitality", sector: "Consumer", industry: "Hotels & Travel",
    description: "Owns and franchises a global portfolio of hotel brands spanning budget to luxury tiers.",
    basePrice: 58.20, volatility: 0.33, drift: 0.025, marketCap: 29, sharesOutstanding: 498,
    eps: 2.65, revenue: 9.7, dividendYield: 1.6, beta: 1.15, debtToEquity: 1.20, profitMargin: 9.8,
    assetType: "stock",
  },
  // Real Estate
  {
    symbol: "PRPX", name: "Prospex Realty Trust", sector: "Real Estate", industry: "Commercial REITs",
    description: "REIT owning Class A office towers and mixed-use developments in major metros.",
    basePrice: 44.20, volatility: 0.30, drift: 0.01, marketCap: 16, sharesOutstanding: 362,
    eps: 2.10, revenue: 3.8, dividendYield: 5.5, beta: 0.90, debtToEquity: 1.60, profitMargin: 20.1,
    assetType: "stock",
  },
];

// ---- Commodities (independently simulated, no fundamentals) ----
const COMMODITIES: TickerConfig[] = [
  {
    symbol: "GOLD", name: "Gold Spot", sector: "Commodities", industry: "Precious Metals",
    description: "Simulated spot price for one troy ounce of gold. A classic safe-haven asset.",
    basePrice: 2410.00, volatility: 0.14, drift: 0.03, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: 0.10, debtToEquity: 0, profitMargin: 0,
    assetType: "commodity",
  },
  {
    symbol: "SLVR", name: "Silver Spot", sector: "Commodities", industry: "Precious Metals",
    description: "Simulated spot price for one troy ounce of silver. More volatile than gold, with industrial demand.",
    basePrice: 29.40, volatility: 0.24, drift: 0.025, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: 0.20, debtToEquity: 0, profitMargin: 0,
    assetType: "commodity",
  },
  {
    symbol: "OILC", name: "Crude Oil", sector: "Commodities", industry: "Energy",
    description: "Simulated spot price for one barrel of crude oil. Highly sensitive to geopolitical and policy shocks.",
    basePrice: 78.50, volatility: 0.34, drift: 0.015, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: 0.30, debtToEquity: 0, profitMargin: 0,
    assetType: "commodity",
  },
];

// ---- Simulated cryptocurrencies ----
const CRYPTO: TickerConfig[] = [
  {
    symbol: "BTCX", name: "SimCoin", sector: "Crypto", industry: "Cryptocurrency",
    description: "Simulated flagship cryptocurrency. Extremely volatile, trades around the clock, reacts sharply to regulatory news.",
    basePrice: 61500.00, volatility: 0.65, drift: 0.12, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: 0.25, debtToEquity: 0, profitMargin: 0,
    assetType: "crypto",
  },
  {
    symbol: "ETHX", name: "AetherCoin", sector: "Crypto", industry: "Cryptocurrency",
    description: "Simulated smart-contract platform token. Very volatile, correlated with SimCoin but with sharper idiosyncratic swings.",
    basePrice: 3380.00, volatility: 0.75, drift: 0.10, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: 0.20, debtToEquity: 0, profitMargin: 0,
    assetType: "crypto",
  },
];

const STOCK_SYMBOLS = STOCKS.map((s) => s.symbol);

function equalWeights(symbols: string[]): TickerHolding[] {
  const w = +(1 / symbols.length).toFixed(6);
  return symbols.map((symbol) => ({ symbol, weight: w }));
}

function mcapWeights(configs: TickerConfig[]): TickerHolding[] {
  const total = configs.reduce((sum, c) => sum + c.marketCap, 0);
  return configs.map((c) => ({ symbol: c.symbol, weight: +(c.marketCap / total).toFixed(6) }));
}

// ---- Index & sector ETFs (price derived from the daily return of their holdings) ----
const ETFS: TickerConfig[] = [
  {
    symbol: "NTLI", name: "NTL 500 Index Fund", sector: "ETF", industry: "Broad Market Index",
    description: "Tracks the NTL 500, a market-cap-weighted index of all 24 listed companies. 1x, unleveraged.",
    basePrice: 420.00, volatility: 0, drift: 0, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 1.4, beta: 1.0, debtToEquity: 0, profitMargin: 0,
    assetType: "etf", leverage: 1, holdings: mcapWeights(STOCKS),
  },
  {
    symbol: "NTLU", name: "NTL 500 Ultra Bull 2x", sector: "ETF", industry: "Leveraged Index",
    description: "Seeks 2x the daily return of the NTL 500. Leverage compounds daily — decays in choppy markets.",
    basePrice: 85.00, volatility: 0, drift: 0, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: 2.0, debtToEquity: 0, profitMargin: 0,
    assetType: "etf", leverage: 2, holdings: mcapWeights(STOCKS),
  },
  {
    symbol: "NTLD", name: "NTL 500 Ultra Bear -2x", sector: "ETF", industry: "Inverse Leveraged Index",
    description: "Seeks -2x the daily return of the NTL 500 — profits when the broad market falls.",
    basePrice: 32.00, volatility: 0, drift: 0, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0, beta: -2.0, debtToEquity: 0, profitMargin: 0,
    assetType: "etf", leverage: -2, holdings: mcapWeights(STOCKS),
  },
  {
    symbol: "TECHQ", name: "Tech Sector ETF", sector: "ETF", industry: "Sector Fund",
    description: "Equal-weight basket of NVTX, CLDW, CYBX, and SEMI — a bet on the technology sector as a whole.",
    basePrice: 210.00, volatility: 0, drift: 0, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 0.2, beta: 1.0, debtToEquity: 0, profitMargin: 0,
    assetType: "etf", leverage: 1, holdings: equalWeights(["NVTX", "CLDW", "CYBX", "SEMI"]),
  },
  {
    symbol: "DEFX", name: "Defense Sector ETF", sector: "ETF", industry: "Sector Fund",
    description: "Equal-weight basket of DFNS, SNTL, and AERO — tracks the defense & aerospace sector.",
    basePrice: 140.00, volatility: 0, drift: 0, marketCap: 0, sharesOutstanding: 0,
    eps: 0, revenue: 0, dividendYield: 1.1, beta: 1.0, debtToEquity: 0, profitMargin: 0,
    assetType: "etf", leverage: 1, holdings: equalWeights(["DFNS", "SNTL", "AERO"]),
  },
];

export const TICKERS: TickerConfig[] = [...STOCKS, ...COMMODITIES, ...CRYPTO, ...ETFS];
export { STOCK_SYMBOLS };
