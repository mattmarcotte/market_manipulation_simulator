"use client";

import { useEffect, useState } from "react";
import {
  GAME_DURATION_DAYS,
  GAME_DURATION_YEARS,
  STARTING_NET_WORTH,
  TRADING_DAYS_PER_YEAR,
} from "@/lib/game";

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ObjectiveBar({
  dayNumber,
  paused,
  netWorth,
  onTogglePause,
  onRestart,
}: {
  dayNumber: number;
  paused: boolean;
  netWorth: number | null;
  onTogglePause: () => void;
  onRestart: () => void;
}) {
  const clampedDay = Math.min(dayNumber, GAME_DURATION_DAYS);
  const progress = Math.min(100, (clampedDay / GAME_DURATION_DAYS) * 100);
  const year = Math.min(GAME_DURATION_YEARS, Math.floor(clampedDay / TRADING_DAYS_PER_YEAR) + 1);
  const dayInYear = clampedDay % TRADING_DAYS_PER_YEAR || (clampedDay > 0 ? TRADING_DAYS_PER_YEAR : 0);
  const termOver = dayNumber >= GAME_DURATION_DAYS;

  const pnl = netWorth === null ? null : netWorth - STARTING_NET_WORTH;
  const pnlPct = pnl === null ? null : (pnl / STARTING_NET_WORTH) * 100;

  return (
    <div className="border border-gray-700 rounded-lg px-4 py-2.5 flex items-center gap-4 flex-wrap bg-gray-800/40">
      <button
        onClick={onTogglePause}
        disabled={termOver}
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors
          ${termOver ? "bg-gray-700 text-gray-500 cursor-not-allowed" : paused ? "bg-green-600 hover:bg-green-500 text-white" : "bg-yellow-600 hover:bg-yellow-500 text-white"}`}
        title={termOver ? "Term complete" : paused ? "Start / resume simulation" : "Pause simulation"}
        aria-label={paused ? "Play" : "Pause"}
      >
        {termOver ? "■" : paused ? "▶" : "❚❚"}
      </button>

      <button
        onClick={() => {
          if (window.confirm("Restart your term? Day counter, cash, positions, and trade history all reset.")) {
            onRestart();
          }
        }}
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white transition-colors"
        title="Restart game"
        aria-label="Restart"
      >
        ↺
      </button>

      <div className="min-w-[220px] flex-1">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] text-gray-400">
            {termOver ? (
              <span className="text-yellow-400 font-bold uppercase">Term complete</span>
            ) : (
              <>
                <span className="text-white font-bold">Objective:</span> Maximize net worth in your {GAME_DURATION_YEARS}-year term
              </>
            )}
          </span>
          <span className="text-[11px] font-mono text-gray-400">
            Year {year} · Day {dayInYear} <span className="text-gray-600">/ {GAME_DURATION_DAYS} total</span>
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${termOver ? "bg-yellow-500" : "bg-blue-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {netWorth !== null && (
        <div className="text-right shrink-0">
          <div className="text-[10px] text-gray-500 uppercase">
            {termOver ? "Final Net Worth" : "Net Worth"}
          </div>
          <div className="text-sm font-mono font-bold text-white">
            ${formatMoney(netWorth)}
            {pnl !== null && (
              <span className={`ml-2 text-xs ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {pnl >= 0 ? "+" : ""}{pnlPct!.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}

      {paused && !termOver && (
        <span className="shrink-0 text-[10px] font-bold uppercase text-yellow-500 bg-yellow-900/30 px-2 py-1 rounded">
          Paused
        </span>
      )}
    </div>
  );
}
