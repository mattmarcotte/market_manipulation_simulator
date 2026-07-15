"use client";

import { ReactNode } from "react";

/**
 * Laptop frame: aluminum bezel + webcam, a fake browser chrome for the
 * "YugeTrade" brokerage site, and a keyboard deck below the screen.
 */
export function LaptopFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="rounded-t-2xl border-[8px] border-b-0 border-[#2b2f36] bg-[#0b0d10] shadow-[0_30px_60px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* webcam */}
        <div className="h-3 bg-[#0b0d10] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2f6f4f]" />
        </div>
        {/* browser chrome */}
        <div className="bg-[#1b1e24] px-3 pt-2">
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1.5 pb-2 pl-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="bg-[#0e1014] rounded-t-lg px-3 py-1.5 text-[10px] text-gray-300 font-mono flex items-center gap-1.5">
              <span>🦅</span> YugeTrade — America&apos;s #1 Broker*
            </div>
            <div className="px-3 py-1.5 text-[10px] text-gray-600 font-mono">+</div>
          </div>
        </div>
        <div className="bg-[#0e1014] px-3 py-1.5 flex items-center gap-2 border-b border-[#23262d]">
          <span className="text-gray-600 text-[10px]">◀ ▶ ⟳</span>
          <div className="flex-1 bg-[#1b1e24] rounded-full px-3 py-1 text-[10px] text-gray-400 font-mono">
            🔒 https://yuge.trade/oval-office — <span className="text-gray-600">*self-reported</span>
          </div>
          <span className="text-[10px]">⭐</span>
        </div>
        {/* site content */}
        <div className="h-[calc(100vh-126px)] min-h-[560px] overflow-y-auto bg-gray-900">
          {children}
        </div>
      </div>
      {/* keyboard deck */}
      <div className="h-3 -mx-3 rounded-b-2xl bg-gradient-to-b from-[#3a3f47] to-[#23262d] relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-1.5 rounded-b-md bg-[#181b20]" />
      </div>
    </div>
  );
}

/**
 * Phone frame: black slab with a notch, status bar, the Chirper app filling
 * the screen, and a bottom tab bar + home indicator.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[300px] shrink-0">
      <div className="rounded-[26px] border-[7px] border-[#101216] bg-black overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.55)] flex flex-col h-[calc(100vh-140px)] min-h-[520px]">
        {/* status bar + notch */}
        <div className="relative bg-black px-4 pt-1 pb-0.5 flex items-center justify-between text-[9px] font-mono text-gray-200">
          <span>9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-3.5 bg-[#101216] rounded-b-xl" />
          <span>▂▄▆ ᯤ 🔋47%</span>
        </div>
        {/* app — scaled down slightly so the whole feed fits a small screen */}
        <div className="flex-1 min-h-0 flex flex-col bg-black" style={{ zoom: 0.82 }}>
          {children}
        </div>
        {/* bottom tab bar */}
        <div className="bg-black border-t border-gray-800 px-6 py-1.5 flex items-center justify-between text-sm">
          <span title="Home">🏠</span>
          <span className="opacity-40" title="Search">🔍</span>
          <span className="opacity-40" title="Notifications">🔔</span>
          <span className="opacity-40" title="Messages">✉️</span>
        </div>
        <div className="bg-black pb-1 flex justify-center">
          <div className="w-20 h-1 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
