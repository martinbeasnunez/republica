"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate } from "@/lib/data/candidates";
import { useChartTheme } from "@/lib/echarts-theme";
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from "lucide-react";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { useCountry } from "@/lib/config/country-context";
import {
  getSourceInfo,
  getPollsterColor,
  POLLSTER_COLORS,
  POLLSTER_META,
  DEFAULT_MOE,
} from "@/lib/data/poll-utils";

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

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export default function EncuestasClient({ candidates }: { candidates: Candidate[] }) {
  const ct = useChartTheme();
  const country = useCountry();
  const topCandidates = candidates;

  // === Source detection ===
  const allPolls = topCandidates.flatMap((c) => c.pollHistory);
  const sourceInfo = getSourceInfo(allPolls);
  const pollsterMeta = POLLSTER_META[country.code] || {};

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

  // Gap & empate técnico
  const leader = withData[0];
  const second = withData[1];
  const gap = leader && second ? leader.pollAverage - second.pollAverage : 0;
  const isEmpateTecnico = gap < DEFAULT_MOE * 2 && second;

  // === Scatter data for individual poll dots ===
  const scatterData: Array<{
    value: [number, number];
    pollster: string;
    date: string;
    candidateName: string;
  }> = [];
  for (const c of withData) {
    for (const p of c.pollHistory) {
      const monthIdx = sortedMonths.indexOf(toYearMonth(p.date));
      if (monthIdx >= 0) {
        scatterData.push({
          value: [monthIdx, p.value],
          pollster: p.pollster,
          date: p.date,
          candidateName: c.shortName,
        });
      }
    }
  }

  // === Main trend chart ===
  const mainChartOption = hasMultipleMonths
    ? (() => {
        // Line series for monthly averages
        const lineSeries = candidateMonthlyData.map((d) => ({
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
          z: 2,
        }));

        // MoE bands for top 2
        const moeBands = candidateMonthlyData.slice(0, 2).flatMap((d) => [
          {
            name: `${d.candidate.shortName} +MoE`,
            type: "line" as const,
            smooth: true,
            symbol: "none" as const,
            lineStyle: { width: 0 },
            areaStyle: { color: d.candidate.partyColor, opacity: 0.06 },
            data: d.values.map((v) => (v != null ? parseFloat((v + DEFAULT_MOE).toFixed(1)) : null)),
            stack: `moe-${d.candidate.id}`,
            silent: true,
            z: 1,
          },
          {
            name: `${d.candidate.shortName} -MoE`,
            type: "line" as const,
            smooth: true,
            symbol: "none" as const,
            lineStyle: { width: 0 },
            areaStyle: { color: d.candidate.partyColor, opacity: 0.06 },
            data: d.values.map((v) => (v != null ? parseFloat((v - DEFAULT_MOE).toFixed(1)) : null)),
            stack: `moe-${d.candidate.id}`,
            silent: true,
            z: 1,
          },
        ]);

        // Scatter dots
        const scatterSeries = {
          name: "Polls individuales",
          type: "scatter" as const,
          symbolSize: 8,
          z: 10,
          data: scatterData.map((d) => ({
            value: d.value,
            itemStyle: { color: getPollsterColor(d.pollster, country.code), opacity: 0.7 },
          })),
          tooltip: {
            formatter: (p: { dataIndex: number }) => {
              const d = scatterData[p.dataIndex];
              if (!d) return "";
              const meta = pollsterMeta[d.pollster.replace(/\s*\(estimado\)/i, "")];
              return `<div style="font-size:11px">
                <b>${d.pollster}</b> · ${formatShortDate(d.date)}<br/>
                <span style="font-family:monospace;font-weight:bold">${d.value[1].toFixed(1)}%</span> — ${d.candidateName}
                ${meta ? `<br/><span style="color:${ct.text.muted};font-size:10px">${meta.methodology} · n=${meta.sampleSize}</span>` : ""}
              </div>`;
            },
          },
        };

        return {
          backgroundColor: "transparent",
          tooltip: {
            trigger: "axis" as const,
            backgroundColor: ct.tooltip.backgroundColor,
            borderColor: ct.tooltip.borderColor,
            textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
            formatter: (
              params: Array<{
                seriesName: string;
                seriesType: string;
                value: number;
                marker: string;
                axisValueLabel: string;
              }>
            ) => {
              const lineParams = params.filter(
                (p) => p.seriesType === "line" && !p.seriesName.includes("MoE") && p.value != null
              );
              if (lineParams.length === 0) return "";
              let html = `<div style="font-size:11px;color:${ct.text.muted};margin-bottom:4px">${lineParams[0].axisValueLabel}</div>`;
              const sorted = [...lineParams].sort((a, b) => (b.value as number) - (a.value as number));
              sorted.forEach((p) => {
                html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
                  ${p.marker}<span style="flex:1">${p.seriesName}</span>
                  <span style="font-family:monospace;font-weight:bold">${(p.value as number).toFixed(1)}%</span>
                </div>`;
              });
              html += `<div style="font-size:9px;color:${ct.text.muted};margin-top:4px;border-top:1px solid rgba(255,255,255,0.1);padding-top:2px">±${DEFAULT_MOE}pp margen de error</div>`;
              return html;
            },
          },
          legend: {
            bottom: 0,
            textStyle: { color: ct.text.muted, fontSize: 10 },
            itemWidth: 10,
            itemHeight: 6,
            itemGap: 8,
            data: lineSeries.map((s) => s.name),
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
          series: [...lineSeries, ...moeBands, scatterSeries],
        };
      })()
    : // Single month — show grouped bar per pollster
      (() => {
        const pollsterSet = new Set<string>();
        for (const c of withData) {
          for (const p of c.pollHistory) pollsterSet.add(p.pollster);
        }
        const pollsterColors = POLLSTER_COLORS[country.code] || {};
        return {
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
          series: [...pollsterSet].map((pollster) => ({
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
          })),
        };
      })();

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

  // Pollster info with active status
  const pollsterInfo = (POLLSTER_META[country.code] ? Object.entries(POLLSTER_META[country.code]) : []).map(
    ([name, meta]) => ({
      name,
      ...meta,
      color: getPollsterColor(name, country.code),
      isActive: sourceInfo.pollsterNames.some(
        (pn) => pn.toLowerCase() === name.toLowerCase()
      ),
    })
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {sourceInfo.isSingleSource
              ? `Encuestas — ${sourceInfo.sourceName}`
              : "Agregador de Encuestas"}
          </h1>
          {sourceInfo.isSingleSource && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-mono font-medium text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              FUENTE ÚNICA
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {sourceInfo.isSingleSource
            ? `Resultado de ${sourceInfo.sourceName} para ${country.name}. Promedios de múltiples firmas son más confiables.`
            : `Promedio ponderado de ${sourceInfo.sourceCount} encuestadoras de ${country.name}`}
        </p>
      </motion.div>

      {/* "Si las elecciones fueran hoy" */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Si las elecciones fueran hoy...
          </h3>
          <p className="text-xs text-muted-foreground">
            {sourceInfo.isSingleSource
              ? `Proyección según ${sourceInfo.sourceName} (±${DEFAULT_MOE}pp margen de error)`
              : `Proyección basada en el promedio de ${sourceInfo.sourceCount} encuestas (±${DEFAULT_MOE}pp MoE)`}
          </p>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {isEmpateTecnico ? "Empate técnico" : "Pasaría a 2da vuelta"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: topCandidates[0]?.partyColor }} />
                <span className="text-lg font-bold text-foreground">{topCandidates[0]?.shortName}</span>
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                  {topCandidates[0]?.pollAverage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {isEmpateTecnico ? "Empate técnico" : "Pasaría a 2da vuelta"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: topCandidates[1]?.partyColor }} />
                <span className="text-lg font-bold text-foreground">{topCandidates[1]?.shortName}</span>
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
                ? `${monthLabels[0]} — ${monthLabels[monthLabels.length - 1]} · ±${DEFAULT_MOE}pp MoE`
                : monthLabels[0] || "Sin datos"}
              {sourceInfo.isSingleSource && ` · ${sourceInfo.sourceName}`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[320px]">
              <ReactECharts option={mainChartOption} style={{ height: "100%" }} opts={{ renderer: "canvas" }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Ranking Actual</CardTitle>
            <p className="text-xs text-muted-foreground">
              {sourceInfo.isSingleSource
                ? `Según ${sourceInfo.sourceName}`
                : `Promedio de ${sourceInfo.sourceCount} encuestadoras`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[320px]">
              <ReactECharts option={barChartOption} style={{ height: "100%" }} opts={{ renderer: "canvas" }} />
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

                  // Check for empate técnico with adjacent candidate
                  const nextCandidate = tableCandidates[i + 1];
                  const gapToNext = nextCandidate
                    ? c.pollAverage - nextCandidate.pollAverage
                    : Infinity;
                  const empateTecWithNext = gapToNext < DEFAULT_MOE * 2;

                  return (
                    <tr key={c.id} className="hover:bg-accent/50 transition-colors">
                      <td className="py-2.5 font-mono text-xs text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.partyColor }} />
                          <span className="text-sm font-medium text-foreground">{c.shortName}</span>
                          {i < tableCandidates.length - 1 && empateTecWithNext && (
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              EMPATE TEC.
                            </span>
                          )}
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

      {/* Pollster info — with active badge */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Encuestadoras
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Firmas con datos en los últimos 30 días marcadas como activas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pollsterInfo.map((p) => (
              <div
                key={p.name}
                className={`rounded-lg p-3 ${p.isActive ? "bg-muted/50 border border-primary/20" : "bg-muted/30 opacity-60"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  </div>
                  {p.isActive && (
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                      ACTIVA
                    </span>
                  )}
                </div>
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
