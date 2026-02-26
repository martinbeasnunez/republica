"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate } from "@/lib/data/candidates";
import { useChartTheme } from "@/lib/echarts-theme";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const pollsters = [
  { name: "Ipsos Peru", reliability: 92, methodology: "Presencial + telefónica", sampleSize: "1,500" },
  { name: "CPI", reliability: 88, methodology: "Presencial", sampleSize: "1,200" },
  { name: "Datum", reliability: 90, methodology: "Presencial + online", sampleSize: "1,400" },
  { name: "IEP", reliability: 91, methodology: "Presencial + telefónica", sampleSize: "1,300" },
];

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

export default function EncuestasClient({ candidates }: { candidates: Candidate[] }) {
  const ct = useChartTheme();
  const topCandidates = candidates;

  // === Build date-aware data ===
  const withData = topCandidates.filter(
    (c) => c.pollHistory.length > 0 && c.pollHistory.some((p) => p.value > 0)
  );

  // Collect unique months
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

  // Dynamic Y max
  const allValues = candidateMonthlyData.flatMap((d) => d.values.filter((v): v is number => v !== null));
  const maxVal = Math.max(...allValues, 5);
  const yMax = Math.ceil(maxVal / 5) * 5 + 2;

  // === Main trend chart (or bar chart if single month) ===
  const mainChartOption = hasMultipleMonths
    ? {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis" as const,
          backgroundColor: ct.tooltip.backgroundColor,
          borderColor: ct.tooltip.borderColor,
          textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
        },
        legend: {
          bottom: 0,
          textStyle: { color: ct.text.muted, fontSize: 10 },
          itemWidth: 10,
          itemHeight: 6,
          itemGap: 8,
        },
        grid: { top: 20, right: 10, bottom: 60, left: 40 },
        xAxis: {
          type: "category" as const,
          data: monthLabels,
          axisLine: { lineStyle: { color: ct.axis.lineColor } },
          axisLabel: { color: ct.axis.labelColor, fontSize: 11 },
        },
        yAxis: {
          type: "value" as const,
          axisLabel: { color: ct.axis.labelColor, fontSize: 11, formatter: "{value}%" },
          splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
          min: 0,
          max: yMax,
        },
        series: candidateMonthlyData.map((d) => ({
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
        })),
      }
    : // Single month — show grouped bar per pollster
      {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis" as const,
          backgroundColor: ct.tooltip.backgroundColor,
          borderColor: ct.tooltip.borderColor,
          textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
        },
        legend: {
          bottom: 0,
          textStyle: { color: ct.text.muted, fontSize: 10 },
          itemWidth: 10,
          itemHeight: 6,
          itemGap: 8,
        },
        grid: { top: 20, right: 10, bottom: 40, left: 40 },
        xAxis: {
          type: "category" as const,
          data: withData.map((c) => c.shortName),
          axisLine: { lineStyle: { color: ct.axis.lineColor } },
          axisLabel: { color: ct.axis.labelColor, fontSize: 10, rotate: 30 },
        },
        yAxis: {
          type: "value" as const,
          axisLabel: { color: ct.axis.labelColor, fontSize: 11, formatter: "{value}%" },
          splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
          min: 0,
          max: yMax,
        },
        series: (() => {
          // Get unique pollsters from the data
          const pollsterSet = new Set<string>();
          for (const c of withData) {
            for (const p of c.pollHistory) pollsterSet.add(p.pollster);
          }
          const pollsterColors: Record<string, string> = {
            Ipsos: "#6366f1",
            CPI: "#f59e0b",
            Datum: "#10b981",
            IEP: "#ec4899",
          };
          return [...pollsterSet].map((pollster) => ({
            name: pollster,
            type: "bar" as const,
            data: withData.map((c) => {
              const match = c.pollHistory.find((p) => p.pollster === pollster);
              return match ? match.value : null;
            }),
            barGap: "10%",
            itemStyle: {
              color: pollsterColors[pollster] || "#94a3b8",
              borderRadius: [4, 4, 0, 0],
            },
            label: {
              show: true,
              position: "top" as const,
              formatter: (p: { value: number | null }) =>
                p.value != null ? `${p.value}%` : "",
              color: ct.text.muted,
              fontSize: 9,
              fontFamily: "monospace",
            },
          }));
        })(),
      };

  // Bar chart for current standings
  const sortedForBar = [...topCandidates].filter((c) => c.pollAverage > 0).sort((a, b) => a.pollAverage - b.pollAverage);
  const barChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
    },
    grid: { top: 10, right: 50, bottom: 10, left: 90, containLabel: false },
    xAxis: {
      type: "value" as const,
      axisLabel: { color: ct.axis.labelColor, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
      max: yMax,
    },
    yAxis: {
      type: "category" as const,
      data: sortedForBar.map((c) => c.shortName),
      axisLine: { lineStyle: { color: ct.axis.lineColor } },
      axisLabel: { color: ct.text.primary, fontSize: 11 },
    },
    series: [
      {
        type: "bar" as const,
        data: sortedForBar.map((c) => ({
          value: c.pollAverage,
          itemStyle: { color: c.partyColor, borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: "60%",
        label: {
          show: true,
          position: "right" as const,
          formatter: (p: { value: number }) => `${p.value.toFixed(1)}%`,
          color: ct.text.muted,
          fontSize: 11,
          fontFamily: "monospace",
        },
      },
    ],
  };

  // Filtered table candidates (only those with poll data)
  const tableCandidates = topCandidates.filter((c) => c.pollAverage > 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Agregador de Encuestas
        </h1>
        <p className="text-sm text-muted-foreground">
          Promedio ponderado de las principales encuestadoras del Perú
        </p>
      </motion.div>

      {/* "Si las elecciones fueran hoy" */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Si las elecciones fueran hoy...
          </h3>
          <p className="text-xs text-muted-foreground">
            Proyección basada en el promedio de encuestas
          </p>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pasaría a 2da vuelta</p>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: topCandidates[0]?.partyColor }}
                />
                <span className="text-lg font-bold text-foreground">
                  {topCandidates[0]?.shortName}
                </span>
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                  {topCandidates[0]?.pollAverage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pasaría a 2da vuelta</p>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: topCandidates[1]?.partyColor }}
                />
                <span className="text-lg font-bold text-foreground">
                  {topCandidates[1]?.shortName}
                </span>
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                  {topCandidates[1]?.pollAverage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">
              {hasMultipleMonths ? "Tendencia de Encuestas" : "Encuestas por Encuestadora"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {hasMultipleMonths
                ? `${monthLabels[0]} — ${monthLabels[monthLabels.length - 1]}`
                : monthLabels[0] || "Sin datos"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[320px]">
              <ReactECharts
                option={mainChartOption}
                style={{ height: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">
              Ranking Actual
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Promedio de encuestadoras
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[320px]">
              <ReactECharts
                option={barChartOption}
                style={{ height: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">Detalle por Candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                  <th className="py-2 text-left text-xs font-medium text-muted-foreground">Candidato</th>
                  <th className="py-2 text-left text-xs font-medium text-muted-foreground">Partido</th>
                  <th className="py-2 text-right text-xs font-medium text-muted-foreground">Promedio</th>
                  <th className="py-2 text-right text-xs font-medium text-muted-foreground">Tendencia</th>
                  <th className="py-2 text-right text-xs font-medium text-muted-foreground">Variación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableCandidates.map((c, i) => {
                  const history = c.pollHistory;
                  const change = history.length >= 2
                    ? history[history.length - 1].value - history[history.length - 2].value
                    : 0;

                  return (
                    <tr key={c.id} className="hover:bg-accent/50 transition-colors">
                      <td className="py-2.5 font-mono text-xs text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: c.partyColor }}
                          />
                          <span className="text-sm font-medium text-foreground">{c.shortName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">{c.party}</td>
                      <td className="py-2.5 text-right font-mono text-sm font-bold tabular-nums">
                        {c.pollAverage.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right">
                        {c.pollTrend === "up" && <TrendingUp className="h-4 w-4 text-emerald inline" />}
                        {c.pollTrend === "down" && <TrendingDown className="h-4 w-4 text-rose inline" />}
                        {c.pollTrend === "stable" && <Minus className="h-4 w-4 text-muted-foreground inline" />}
                      </td>
                      <td className={`py-2.5 text-right font-mono text-xs tabular-nums ${change > 0 ? "text-emerald" : change < 0 ? "text-rose" : "text-muted-foreground"}`}>
                        {change > 0 ? "+" : ""}{change.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <WhatsAppCTA context="encuestas" />

      {/* Pollster info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Encuestadoras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pollsters.map((p) => (
              <div key={p.name} className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fiabilidad</span>
                    <span className="font-mono text-emerald tabular-nums">{p.reliability}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Metodología</span>
                    <span className="text-foreground">{p.methodology}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Muestra</span>
                    <span className="font-mono text-foreground tabular-nums">{p.sampleSize}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
