"use client";

import dynamic from "next/dynamic";
import { getTopCandidates } from "@/lib/data/candidates";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function PollTrendChart() {
  const topCandidates = getTopCandidates(6);

  const months = ["Oct 2025", "Nov 2025", "Dec 2025", "Ene 2026", "Feb 2026"];

  const series = topCandidates.map((candidate) => ({
    name: candidate.shortName,
    type: "line" as const,
    smooth: true,
    symbol: "circle",
    symbolSize: 6,
    lineStyle: {
      width: 2,
      color: candidate.partyColor,
    },
    itemStyle: {
      color: candidate.partyColor,
    },
    data: candidate.pollHistory.map((p) => p.value),
    emphasis: {
      focus: "series" as const,
    },
  }));

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#14142a",
      borderColor: "#1e1e3a",
      textStyle: {
        color: "#f1f5f9",
        fontSize: 12,
      },
      formatter: (params: Array<{ seriesName: string; value: number; color: string; marker: string }>) => {
        let html = `<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${params[0] ? months[params[0].value as unknown as number] || "" : ""}</div>`;
        const sorted = [...params].sort((a, b) => (b.value as number) - (a.value as number));
        sorted.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            ${p.marker}
            <span style="flex:1">${p.seriesName}</span>
            <span style="font-family:monospace;font-weight:bold">${(p.value as number).toFixed(1)}%</span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: "#94a3b8",
        fontSize: 11,
      },
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 16,
    },
    grid: {
      top: 20,
      right: 20,
      bottom: 50,
      left: 50,
    },
    xAxis: {
      type: "category" as const,
      data: months,
      axisLine: { lineStyle: { color: "#1e1e3a" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLine: { show: false },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 11,
        formatter: "{value}%",
      },
      splitLine: {
        lineStyle: { color: "#1e1e3a", type: "dashed" as const },
      },
      min: 0,
      max: 15,
    },
    series,
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tendencia de Encuestas
          </h3>
          <p className="text-xs text-muted-foreground">
            Ultimos 5 meses — Promedio ponderado
          </p>
        </div>
      </div>
      <ReactECharts
        option={option}
        style={{ height: 300 }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
