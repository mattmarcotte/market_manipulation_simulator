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
}

export const TICKERS: TickerConfig[] = [
  // Energy
  {
    symbol: "AMRN", name: "Ameron Energy Corp", sector: "Energy", industry: "Oil & Gas Exploration",
    description: "Integrated oil and gas company with upstream and midstream operations across North America.",
    basePrice: 84.50, volatility: 0.35, drift: 0.02, marketCap: 142, sharesOutstanding: 1680,
    eps: 6.12, revenue: 68.4, dividendYield: 3.2, beta: 1.15, debtToEquity: 0.45, profitMargin: 12.1,
  },
  {
    symbol: "SLRX", name: "Solaris Clean Energy", sector: "Energy", industry: "Renewable Energy",
    description: "Develops and operates utility-scale solar and wind installations across the Sun Belt.",
    basePrice: 42.80, volatility: 0.48, drift: 0.06, marketCap: 28, sharesOutstanding: 654,
    eps: 0.87, revenue: 5.2, dividendYield: 0, beta: 1.45, debtToEquity: 1.2, profitMargin: 4.8,
  },
  // Technology
  {
    symbol: "NVTX", name: "Novatech Industries", sector: "Technology", industry: "Semiconductors",
    description: "Designs advanced AI accelerator chips and high-performance computing platforms.",
    basePrice: 312.00, volatility: 0.45, drift: 0.08, marketCap: 480, sharesOutstanding: 1538,
    eps: 8.45, revenue: 42.1, dividendYield: 0.4, beta: 1.55, debtToEquity: 0.22, profitMargin: 28.5,
  },
  {
    symbol: "CLDW", name: "CloudWave Systems", sector: "Technology", industry: "Cloud Infrastructure",
    description: "Enterprise cloud platform providing compute, storage, and AI-as-a-service solutions.",
    basePrice: 178.50, volatility: 0.42, drift: 0.07, marketCap: 215, sharesOutstanding: 1204,
    eps: 4.92, revenue: 31.8, dividendYield: 0, beta: 1.35, debtToEquity: 0.38, profitMargin: 18.7,
  },
  {
    symbol: "CYBX", name: "CyberVault Inc", sector: "Technology", industry: "Cybersecurity",
    description: "Zero-trust cybersecurity platform protecting enterprise networks and cloud workloads.",
    basePrice: 94.20, volatility: 0.50, drift: 0.05, marketCap: 38, sharesOutstanding: 403,
    eps: 1.88, revenue: 4.7, dividendYield: 0, beta: 1.60, debtToEquity: 0.15, profitMargin: 11.2,
  },
  // Healthcare
  {
    symbol: "HLSN", name: "Halson Pharmaceuticals", sector: "Healthcare", industry: "Pharmaceuticals",
    description: "Major pharma company with blockbuster oncology and immunology drug portfolios.",
    basePrice: 56.20, volatility: 0.40, drift: 0.04, marketCap: 165, sharesOutstanding: 2936,
    eps: 3.74, revenue: 48.9, dividendYield: 2.1, beta: 0.75, debtToEquity: 0.55, profitMargin: 22.4,
  },
  {
    symbol: "MDVN", name: "MedVantage Health", sector: "Healthcare", industry: "Health Insurance",
    description: "National health insurance provider covering commercial, Medicare, and Medicaid markets.",
    basePrice: 285.00, volatility: 0.28, drift: 0.03, marketCap: 92, sharesOutstanding: 323,
    eps: 18.20, revenue: 124.5, dividendYield: 1.5, beta: 0.65, debtToEquity: 0.60, profitMargin: 4.7,
  },
  {
    symbol: "GNMX", name: "Genomix Therapeutics", sector: "Healthcare", industry: "Biotechnology",
    description: "Clinical-stage biotech developing CRISPR-based gene therapies for rare diseases.",
    basePrice: 28.40, volatility: 0.65, drift: 0.0, marketCap: 4.2, sharesOutstanding: 148,
    eps: -2.15, revenue: 0.12, dividendYield: 0, beta: 1.80, debtToEquity: 0.08, profitMargin: -890,
  },
  // Finance
  {
    symbol: "FRST", name: "First Continental Bank", sector: "Finance", industry: "Banking",
    description: "Top-10 US commercial bank with retail, corporate, and wealth management divisions.",
    basePrice: 142.75, volatility: 0.25, drift: 0.03, marketCap: 225, sharesOutstanding: 1576,
    eps: 11.85, revenue: 38.2, dividendYield: 2.8, beta: 0.95, debtToEquity: 1.80, profitMargin: 28.9,
  },
  {
    symbol: "APEX", name: "Apex Capital Markets", sector: "Finance", industry: "Investment Banking",
    description: "Global investment bank and prime brokerage with major trading desk operations.",
    basePrice: 198.30, volatility: 0.38, drift: 0.04, marketCap: 88, sharesOutstanding: 444,
    eps: 14.60, revenue: 22.1, dividendYield: 1.8, beta: 1.30, debtToEquity: 2.50, profitMargin: 24.2,
  },
  // Agriculture
  {
    symbol: "AGRI", name: "AgriVest Holdings", sector: "Agriculture", industry: "Agricultural Products",
    description: "Vertically integrated agribusiness covering grain trading, fertilizers, and food processing.",
    basePrice: 38.90, volatility: 0.30, drift: 0.01, marketCap: 22, sharesOutstanding: 565,
    eps: 2.95, revenue: 34.8, dividendYield: 2.5, beta: 0.80, debtToEquity: 0.65, profitMargin: 5.1,
  },
  // Defense
  {
    symbol: "DFNS", name: "Ironclad Defense Systems", sector: "Defense", industry: "Aerospace & Defense",
    description: "Prime defense contractor building fighter jets, missile systems, and space vehicles.",
    basePrice: 198.40, volatility: 0.28, drift: 0.05, marketCap: 156, sharesOutstanding: 786,
    eps: 14.10, revenue: 52.3, dividendYield: 1.6, beta: 0.70, debtToEquity: 0.85, profitMargin: 10.8,
  },
  {
    symbol: "SNTL", name: "Sentinel Dynamics", sector: "Defense", industry: "Defense Electronics",
    description: "Builds radar, electronic warfare, and C4ISR systems for the US military and allies.",
    basePrice: 124.60, volatility: 0.32, drift: 0.04, marketCap: 48, sharesOutstanding: 385,
    eps: 7.80, revenue: 14.6, dividendYield: 1.2, beta: 0.75, debtToEquity: 0.40, profitMargin: 14.5,
  },
  // Media & Communications
  {
    symbol: "MDIA", name: "Pulse Media Group", sector: "Media", industry: "Digital Media",
    description: "Operates streaming platforms, social networks, and a digital advertising exchange.",
    basePrice: 67.30, volatility: 0.50, drift: -0.01, marketCap: 72, sharesOutstanding: 1070,
    eps: 1.45, revenue: 18.9, dividendYield: 0, beta: 1.40, debtToEquity: 0.70, profitMargin: 8.2,
  },
  {
    symbol: "TLCM", name: "TelComm Networks", sector: "Telecom", industry: "Telecommunications",
    description: "National wireless carrier and broadband provider with 80M+ subscribers.",
    basePrice: 52.40, volatility: 0.22, drift: 0.02, marketCap: 185, sharesOutstanding: 3530,
    eps: 3.28, revenue: 78.5, dividendYield: 4.5, beta: 0.55, debtToEquity: 1.40, profitMargin: 14.8,
  },
  // Infrastructure & Industrials
  {
    symbol: "CNST", name: "Titan Construction Co", sector: "Industrials", industry: "Construction & Engineering",
    description: "Heavy civil construction firm specializing in bridges, highways, and public works.",
    basePrice: 91.15, volatility: 0.32, drift: 0.02, marketCap: 18, sharesOutstanding: 197,
    eps: 5.40, revenue: 12.4, dividendYield: 1.4, beta: 1.10, debtToEquity: 0.90, profitMargin: 6.8,
  },
  {
    symbol: "RLTX", name: "RailTex Logistics", sector: "Industrials", industry: "Railroads & Freight",
    description: "Class I railroad operating 28,000 route miles across the eastern US and Canada.",
    basePrice: 215.80, volatility: 0.24, drift: 0.03, marketCap: 128, sharesOutstanding: 593,
    eps: 13.50, revenue: 24.2, dividendYield: 2.0, beta: 0.85, debtToEquity: 1.10, profitMargin: 26.5,
  },
  // Consumer
  {
    symbol: "LUXR", name: "Luxora Brands", sector: "Consumer", industry: "Luxury Retail",
    description: "Portfolio of premium fashion, cosmetics, and lifestyle brands sold worldwide.",
    basePrice: 156.90, volatility: 0.35, drift: 0.03, marketCap: 64, sharesOutstanding: 408,
    eps: 6.25, revenue: 15.8, dividendYield: 1.0, beta: 1.20, debtToEquity: 0.55, profitMargin: 16.1,
  },
  {
    symbol: "FDHQ", name: "FoodHQ International", sector: "Consumer", industry: "Food & Beverage",
    description: "Global packaged food and beverage conglomerate with 200+ household brands.",
    basePrice: 68.50, volatility: 0.20, drift: 0.02, marketCap: 195, sharesOutstanding: 2847,
    eps: 3.85, revenue: 62.3, dividendYield: 3.0, beta: 0.50, debtToEquity: 0.75, profitMargin: 12.4,
  },
  // Real Estate
  {
    symbol: "PRPX", name: "Prospex Realty Trust", sector: "Real Estate", industry: "Commercial REITs",
    description: "REIT owning Class A office towers and mixed-use developments in major metros.",
    basePrice: 44.20, volatility: 0.30, drift: 0.01, marketCap: 16, sharesOutstanding: 362,
    eps: 2.10, revenue: 3.8, dividendYield: 5.5, beta: 0.90, debtToEquity: 1.60, profitMargin: 20.1,
  },
];
