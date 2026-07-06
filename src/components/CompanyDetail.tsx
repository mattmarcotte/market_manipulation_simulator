"use client";

import { assetIcon, type CompanyStats } from "./MarketTicker";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function formatMcap(b: number): string {
  if (b <= 0) return "—";
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  if (b >= 1) return `$${b.toFixed(1)}B`;
  return `$${(b * 1000).toFixed(0)}M`;
}

export default function CompanyDetail({ company }: { company: CompanyStats }) {
  const isFund = company.assetType !== "stock";

  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-3">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm">{assetIcon(company)}</span>
          <h3 className="text-sm font-bold text-white">{company.name}</h3>
          <span className="text-[10px] text-gray-500 font-mono">{company.symbol}</span>
          {company.leverage && Math.abs(company.leverage) > 1 && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${company.leverage > 0 ? "bg-orange-900/50 text-orange-300" : "bg-purple-900/50 text-purple-300"}`}>
              {company.leverage}x
            </span>
          )}
        </div>
        <div className="text-[10px] text-blue-400 mt-0.5">
          {company.sector} &middot; {company.industry}
        </div>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          {company.description}
        </p>
      </div>

      {company.holdings && company.holdings.length > 0 && (
        <div className="text-[11px] font-mono">
          <h4 className="text-[9px] text-gray-500 uppercase mb-1">Holdings</h4>
          <div className="flex flex-wrap gap-1">
            {company.holdings
              .slice()
              .sort((a, b) => b.weight - a.weight)
              .map((h) => (
                <span key={h.symbol} className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-[10px]">
                  {h.symbol} <span className="text-gray-500">{(h.weight * 100).toFixed(0)}%</span>
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 text-[11px] font-mono">
        <div className="space-y-0.5 border-r border-gray-800 pr-3">
          <h4 className="text-[9px] text-gray-500 uppercase mb-1">Valuation</h4>
          <StatRow label="Mkt Cap" value={formatMcap(company.marketCap)} />
          {!isFund && <StatRow label="P/E" value={company.pe ? company.pe.toFixed(1) : "N/A"} />}
          {!isFund && <StatRow label="EPS" value={`$${company.eps.toFixed(2)}`} />}
          {!isFund && <StatRow label="Revenue" value={`$${company.revenue}B`} />}
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[9px] text-gray-500 uppercase mb-1">Fundamentals</h4>
          <StatRow label="Div Yield" value={company.dividendYield > 0 ? `${company.dividendYield.toFixed(1)}%` : "—"} />
          {!isFund && <StatRow label="Margin" value={company.profitMargin > -100 ? `${company.profitMargin.toFixed(1)}%` : "Neg"} />}
          {!isFund && <StatRow label="D/E" value={company.debtToEquity.toFixed(2)} />}
          <StatRow label="Beta" value={company.beta.toFixed(2)} />
        </div>
      </div>

      <div className="text-[11px] font-mono space-y-0.5">
        <h4 className="text-[9px] text-gray-500 uppercase mb-1">Trading</h4>
        <div className="grid grid-cols-2 gap-x-4">
          <StatRow label="Volatility" value={company.volatility > 0 ? `${company.volatility.toFixed(1)}%` : "Derived"} />
          <StatRow label="Avg Vol" value={`${(company.avgVolume / 1_000_000).toFixed(1)}M`} />
          <StatRow label="52w High" value={`$${company.week52High.toFixed(2)}`} />
          <StatRow label="52w Low" value={`$${company.week52Low.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}
