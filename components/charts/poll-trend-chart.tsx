"use client";

import dynamic from "next/dynamic";
import type { Candidate } from "@/lib/data/candidates";
import { useChartTheme } from "@/lib/echarts-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Format "2026-02" → "Feb 2026"
function formatMonth(dateStr: string): string {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [yearStr, monthStr] = dateStr.split("-");
  const monthIdx = parseInt(monthStr, 10) - 1;
  return `${months[monthIdx] || monthStr} ${yearStr}`;
}

function toYearMonth(dateStr: string): string {
  return dateStr.substring(0, 7);
}

function getDaysUntilElection(): number {
  const election = new Date("2026-04-12T08:00:00-05:00");
  const now = new Date();
  return Math.max(0, Math.floor((election.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function PollTrendChart({ candidates }: { candidates: Candidate[] }) {
  const ct = useChartTheme();

  // Only candidates with real poll data
  const withData = candidates
    .filter((c) => c.pollHistory.length > 0 && c.pollHistory.some((p) => p.value > 0))
    .sort((a, b) => b.pollAverage - a.pollAverage);

  if (withData.length === 0) return null;

  // Collect all unique months
  const monthSet = new Set<string>();
  for (const c of withData) {
    for (const p of c.pollHistory) {
      monthSet.add(toYearMonth(p.date));
    }
  }
  const sortedMonths = [...monthSet].sort();
  const monthLabels = sortedMonths.map(formatMonth);
  const hasMultipleMonths = sortedMonths.length > 1;

  // Monthly averages per candidate
  const candidateMonthlyData = withData.map((c) => {
    const byMonth: Record<string, number[]> = {};
    for (const p of c.pollHistory) {
      const ym = toYearMonth(p.date);
      if (!byMonth[ym]) byMonth[ym] = [];
      byMonth[ym].push(p.value);
    }
    const values = sortedMonths.map((m) => {
      const arr = byMonth[m];
      if (!arr || arr.length === 0) return null;
      return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
    });
    return { candidate: c, values };
  });

  const allValues = candidateMonthlyData.flatMap((d) => d.values.filter((v): v is number => v !== null));
  const maxVal = Math.max(...allValues, 5);
  const yMax = Math.ceil(maxVal / 5) * 5 + 2;

  const daysLeft = getDaysUntilElection();
  const leader = withData[0];
  const second = withData[1];
  const gap = leader && second ? (leader.pollAverage - second.pollAverage).toFixed(1) : "0";
  const totalTopVote = withData.reduce((sum, c) => sum + c.pollAverage, 0);
  const undecidedApprox = Math.max(0, 100 - totalTopVote).toFixed(0);

  // === Single month: contextual bar chart + insights ===
  if (!hasMultipleMonths) {
    const barData = candidateMonthlyData
      .map((d) => ({
        name: d.candidate.shortName,
        value: d.values[0] ?? 0,
        color: d.candidate.partyColor,
      }))
      .sort((a, b) => a.value - b.value);

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: ct.tooltip.backgroundColor,
        borderColor: ct.tooltip.borderColor,
        textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
        formatter: (params: Array<{ name: string; value: number; marker: string }>) => {
          return params
            .map(
              (p) =>
                `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">${p.marker}<span style="flex:1">${p.name}</span><span style="font-family:monospace;font-weight:bold">${p.value.toFixed(1)}%</span></div>`
            )
            .join("");
        },
      },
      grid: {
        top: 10,
        right: 50,
        bottom: 10,
        left: 90,
        containLabel: false,
      },
      xAxis: {
        type: "value" as const,
        axisLine: { show: false },
        axisLabel: { color: ct.axis.labelColor, fontSize: 11, formatter: "{value}%" },
        splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
        max: yMax,
      },
      yAxis: {
        type: "category" as const,
        data: barData.map((d) => d.name),
        axisLine: { lineStyle: { color: ct.axis.lineColor } },
        axisLabel: { color: ct.axis.labelColor, fontSize: 11 },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar" as const,
          data: barData.map((d) => ({
            value: d.value,
            itemStyle: { color: d.color, borderRadius: [0, 4, 4, 0] },
          })),
          barWidth: "55%",
          label: {
            show: true,
            position: "right" as const,
            formatter: (p: { value: number }) => `${p.value.toFixed(1)}%`,
            color: ct.text.primary,
            fontSize: 11,
            fontFamily: "monospace",
          },
        },
      ],
    };

    return (
      <div className="rounded-xl border border-border bg-card p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Intención de Voto
            </h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-primary">
              {monthLabels[0]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio de encuestadoras · Faltan {daysLeft} días
          </p>
        </div>

        {/* Chart */}
        <div className="h-[220px] sm:h-[260px]">
          <ReactECharts
            option={option}
            style={{ height: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </div>

        {/* Insight strip */}
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-2.5">
          <div className="text-center">
            <p className="font-mono text-sm font-bold tabular-nums text-foreground">
              {leader?.pollAverage.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Puntero
            </p>
          </div>
          <div className="text-center border-x border-border">
            <p className="font-mono text-sm font-bold tabular-nums text-amber">
              {gap}pp
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Brecha 1° - 2°
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-sm font-bold tabular-nums text-sky">
              ~{undecidedApprox}%
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Indecisos
            </p>
          </div>
        </div>

        {/* Context message */}
        <p className="mt-2.5 text-[10px] text-muted-foreground/70 text-center leading-relaxed">
          Ningún candidato supera el 15%. Con ~{undecidedApprox}% de indecisos y {daysLeft} días
          de campaña, la carrera sigue completamente abierta.
        </p>
      </div>
    );
  }

  // === Multiple months → line trend chart ===
  const series = candidateMonthlyData.map((d) => ({
    name: d.candidate.shortName,
    type: "line" as const,
    smooth: true,
    symbol: "circle",
    symbolSize: 6,
    connectNulls: true,
    lineStyle: { width: 2, color: d.candidate.partyColor },
    itemStyle: { color: d.candidate.partyColor },
    data: d.values,
    emphasis: { focus: "series" as const },
  }));

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
      formatter: (
        params: Array<{
          seriesName: string;
          value: number;
          color: string;
          marker: string;
          axisValueLabel: string;
        }>
      ) => {
        const valid = params.filter((p) => p.value != null);
        if (valid.length === 0) return "";
        let html = `<div style="font-size:11px;color:${ct.text.muted};margin-bottom:4px">${valid[0].axisValueLabel}</div>`;
        const sorted = [...valid].sort((a, b) => (b.value as number) - (a.value as number));
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
      textStyle: { color: ct.text.muted, fontSize: 10 },
      itemWidth: 10,
      itemHeight: 6,
      itemGap: 8,
    },
    grid: { top: 20, right: 8, bottom: 60, left: 35 },
    xAxis: {
      type: "category" as const,
      data: monthLabels,
      axisLine: { lineStyle: { color: ct.axis.lineColor } },
      axisLabel: { color: ct.axis.labelColor, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLine: { show: false },
      axisLabel: { color: ct.axis.labelColor, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
      min: 0,
      max: yMax,
    },
    series,
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Tendencia de Encuestas
          </h3>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-primary">
            Faltan {daysLeft} días
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {monthLabels[0]} — {monthLabels[monthLabels.length - 1]} · Promedio ponderado
        </p>
      </div>
      <div className="h-[220px] sm:h-[280px]">
        <ReactECharts
          option={option}
          style={{ height: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
      {/* Insight strip for multi-month too */}
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-2.5">
        <div className="text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-foreground">
            {leader?.pollAverage.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">Puntero</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="font-mono text-sm font-bold tabular-nums text-amber">
            {gap}pp
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">Brecha 1° - 2°</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-sky">
            ~{undecidedApprox}%
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">Indecisos</p>
        </div>
      </div>
    </div>
  );
}
