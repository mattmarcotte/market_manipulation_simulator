"use client";

import type { CompanyStats } from "./MarketTicker";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function formatMcap(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  if (b >= 1) return `$${b.toFixed(1)}B`;
  return `$${(b * 1000).toFixed(0)}M`;
}

export default function CompanyDetail({ company }: { company: CompanyStats }) {
  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-3">
      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-bold text-white">{company.name}</h3>
          <span className="text-[10px] text-gray-500 font-mono">{company.symbol}</span>
        </div>
        <div className="text-[10px] text-blue-400 mt-0.5">
          {company.sector} &middot; {company.industry}
        </div>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          {company.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 text-[11px] font-mono">
        <div className="space-y-0.5 border-r border-gray-800 pr-3">
          <h4 className="text-[9px] text-gray-500 uppercase mb-1">Valuation</h4>
          <StatRow label="Mkt Cap" value={formatMcap(company.marketCap)} />
          <StatRow label="P/E" value={company.pe ? company.pe.toFixed(1) : "N/A"} />
          <StatRow label="EPS" value={`$${company.eps.toFixed(2)}`} />
          <StatRow label="Revenue" value={`$${company.revenue}B`} />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[9px] text-gray-500 uppercase mb-1">Fundamentals</h4>
          <StatRow label="Div Yield" value={company.dividendYield > 0 ? `${company.dividendYield.toFixed(1)}%` : "—"} />
          <StatRow label="Margin" value={company.profitMargin > -100 ? `${company.profitMargin.toFixed(1)}%` : "Neg"} />
          <StatRow label="D/E" value={company.debtToEquity.toFixed(2)} />
          <StatRow label="Beta" value={company.beta.toFixed(2)} />
        </div>
      </div>

      <div className="text-[11px] font-mono space-y-0.5">
        <h4 className="text-[9px] text-gray-500 uppercase mb-1">Trading</h4>
        <div className="grid grid-cols-2 gap-x-4">
          <StatRow label="Volatility" value={`${company.volatility.toFixed(1)}%`} />
          <StatRow label="Avg Vol" value={`${(company.avgVolume / 1_000_000).toFixed(1)}M`} />
          <StatRow label="52w High" value={`$${company.week52High.toFixed(2)}`} />
          <StatRow label="52w Low" value={`$${company.week52Low.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}
