"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// map day numbers to fake calendar dates starting from a base
function dayToBusinessDate(dayNum: number): string {
  const base = new Date("2029-01-02"); // a Tuesday
  let d = 0;
  const date = new Date(base);
  while (d < dayNum) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) d++;
  }
  return date.toISOString().slice(0, 10);
}

export default function CandlestickChart({
  symbol,
  candles,
  currentPrice,
  change,
  companyName,
}: {
  symbol: string;
  candles: Candle[];
  currentPrice: number;
  change: number;
  companyName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volChartRef = useRef<IChartApi | null>(null);
  const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || !volumeContainerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(75,85,99,0.2)" },
        horzLines: { color: "rgba(75,85,99,0.2)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(75,85,99,0.5)" },
      timeScale: { borderColor: "rgba(75,85,99,0.5)", timeVisible: false },
      handleScale: true,
      handleScroll: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // volume chart
    const volChart = createChart(volumeContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(75,85,99,0.1)" },
        horzLines: { color: "rgba(75,85,99,0.1)" },
      },
      rightPriceScale: { borderColor: "rgba(75,85,99,0.3)" },
      timeScale: { borderColor: "rgba(75,85,99,0.3)", timeVisible: false, visible: false },
      handleScale: false,
      handleScroll: false,
      crosshair: { mode: CrosshairMode.Normal },
    });

    const volSeries = volChart.addSeries(HistogramSeries, {
      color: "#3b82f6",
      priceFormat: { type: "volume" },
    });

    volChartRef.current = volChart;
    volSeriesRef.current = volSeries;

    // sync time scales
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) volChart.timeScale().setVisibleLogicalRange(range);
    });

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
      if (volumeContainerRef.current) {
        volChart.applyOptions({ width: volumeContainerRef.current.clientWidth, height: volumeContainerRef.current.clientHeight });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();

    return () => {
      observer.disconnect();
      chart.remove();
      volChart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volChartRef.current = null;
      volSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !volSeriesRef.current || candles.length === 0) return;

    const priceData = candles.map((c) => ({
      time: dayToBusinessDate(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volData = candles.map((c) => ({
      time: dayToBusinessDate(c.time),
      value: c.volume,
      color: c.close >= c.open ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
    }));

    seriesRef.current.setData(priceData);
    volSeriesRef.current.setData(volData);
    chartRef.current?.timeScale().scrollToRealTime();
    volChartRef.current?.timeScale().scrollToRealTime();
  }, [candles]);

  const isUp = change >= 0;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-baseline gap-3 px-4 pt-3 pb-1">
        <span className="text-xl font-bold text-white">{symbol}</span>
        {companyName && <span className="text-sm text-gray-400">{companyName}</span>}
        <span className={`text-2xl font-mono font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
          ${currentPrice.toFixed(2)}
        </span>
        <span className={`text-sm font-mono ${isUp ? "text-green-400" : "text-red-400"}`}>
          {isUp ? "+" : ""}{change.toFixed(2)}%
        </span>
      </div>
      <div ref={containerRef} className="w-full h-[280px]" />
      <div ref={volumeContainerRef} className="w-full h-[60px]" />
    </div>
  );
}
