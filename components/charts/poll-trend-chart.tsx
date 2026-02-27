"use client";

import dynamic from "next/dynamic";
import type { Candidate } from "@/lib/data/candidates";
import { useChartTheme } from "@/lib/echarts-theme";
import { useCountry } from "@/lib/config/country-context";
import { AlertTriangle } from "lucide-react";
import {
  getSourceInfo,
  getPollsterColor,
  POLLSTER_META,
  DEFAULT_MOE,
  type SourceInfo,
} from "@/lib/data/poll-utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// ─── Helpers ───

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

/** Generate dynamic insight with empate técnico support */
function generateInsight(
  leaderName: string,
  secondName: string,
  leaderPct: number,
  gapPP: number,
  undecidedPct: string,
  daysLeft: number,
  sourceInfo: SourceInfo
): string {
  const days = `${daysLeft} días de campaña`;
  const indecisos = `~${undecidedPct}% de indecisos`;
  const sourceNote = sourceInfo.isSingleSource
    ? ` Dato de fuente única (${sourceInfo.sourceName}).`
    : "";

  // Empate técnico: gap within margin of error
  if (gapPP < DEFAULT_MOE * 2 && gapPP > 0 && secondName) {
    return `Empate técnico entre ${leaderName} y ${secondName} — solo ${gapPP.toFixed(1)}pp de diferencia (margen de error ±${DEFAULT_MOE}pp). Con ${indecisos} y ${days}, todo puede cambiar.${sourceNote}`;
  }
  if (gapPP >= 20) {
    return `${leaderName} lidera con amplia ventaja de ${gapPP.toFixed(1)}pp. Con ${indecisos} y ${days}, la distancia es considerable.${sourceNote}`;
  }
  if (gapPP >= 10) {
    return `${leaderName} encabeza con ${gapPP.toFixed(1)}pp sobre el segundo. Con ${indecisos} y ${days}, la ventaja es sólida pero la carrera continúa.${sourceNote}`;
  }
  if (gapPP >= 5) {
    return `${leaderName} lidera por ${gapPP.toFixed(1)}pp. Con ${indecisos} y ${days}, la competencia se mantiene abierta.${sourceNote}`;
  }
  if (leaderPct < 15) {
    return `Ningún candidato supera el 15%. Con ${indecisos} y ${days}, la carrera sigue completamente abierta.${sourceNote}`;
  }
  return `Solo ${gapPP.toFixed(1)}pp separan al 1° del 2°. Con ${indecisos} y ${days}, todo puede cambiar.${sourceNote}`;
}

// ─── Component ───

export function PollTrendChart({ candidates }: { candidates: Candidate[] }) {
  const ct = useChartTheme();
  const country = useCountry();

  const withData = candidates
    .filter((c) => c.pollHistory.length > 0 && c.pollHistory.some((p) => p.value > 0))
    .sort((a, b) => b.pollAverage - a.pollAverage);

  if (withData.length === 0) return null;

  // Collect all polls for source detection
  const allPolls = withData.flatMap((c) => c.pollHistory);
  const sourceInfo = getSourceInfo(allPolls);

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

  const daysLeft = Math.max(0, Math.floor((new Date(country.electionDate + "T08:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const leader = withData[0];
  const second = withData[1];
  const gap = leader && second ? (leader.pollAverage - second.pollAverage).toFixed(1) : "0";
  const totalTopVote = withData.reduce((sum, c) => sum + c.pollAverage, 0);
  const undecidedApprox = Math.max(0, 100 - totalTopVote).toFixed(0);
  const isEmpateTecnico = parseFloat(gap) < DEFAULT_MOE * 2 && second;

  // Source header text
  const headerSubtitle = sourceInfo.isSingleSource
    ? `Según ${sourceInfo.sourceName} · Faltan ${daysLeft} días`
    : `Promedio de ${sourceInfo.sourceCount} encuestadoras · Faltan ${daysLeft} días`;

  // ─── Build scatter dots for individual polls (used in both modes) ───
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

  // ─── Ficha técnica strip data ───
  const pollsterMeta = POLLSTER_META[country.code] || {};
  const activePollsters = sourceInfo.pollsterNames
    .map((name) => ({
      name,
      meta: pollsterMeta[name],
      color: getPollsterColor(name, country.code),
    }))
    .filter((p) => p.meta);

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
      grid: { top: 10, right: 50, bottom: 10, left: 90, containLabel: false },
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
          markArea: isEmpateTecnico ? {
            silent: true,
            data: [[
              { yAxis: leader?.shortName, itemStyle: { color: "rgba(251,191,36,0.08)" } },
              { yAxis: second?.shortName },
            ]],
          } : undefined,
        },
      ],
    };

    return (
      <div className="rounded-xl border border-border bg-card p-4">
        {/* Header with source mode */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Intención de Voto
            </h3>
            <div className="flex items-center gap-1.5">
              {sourceInfo.isSingleSource && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-amber-400">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  FUENTE ÚNICA
                </span>
              )}
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-primary">
                {monthLabels[0]}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
        </div>

        <div className="h-[220px] sm:h-[260px]">
          <ReactECharts option={option} style={{ height: "100%" }} opts={{ renderer: "canvas" }} />
        </div>

        {/* Insight strip */}
        <InsightStrip
          leader={leader}
          gap={gap}
          undecidedApprox={undecidedApprox}
          isEmpateTecnico={!!isEmpateTecnico}
        />

        {/* Context message */}
        <p className="mt-2.5 text-[10px] text-muted-foreground/70 text-center leading-relaxed">
          {generateInsight(leader?.shortName ?? "", second?.shortName ?? "", leader?.pollAverage ?? 0, parseFloat(gap), undecidedApprox, daysLeft, sourceInfo)}
        </p>

        {/* Ficha técnica */}
        <FichaTecnica pollsters={activePollsters} isSingleSource={sourceInfo.isSingleSource} />
      </div>
    );
  }

  // === Multiple months → line trend chart with scatter dots & MoE ===

  // Line series (monthly averages per candidate)
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

  // MoE band for #1 candidate only (proper band: lower base + bandwidth overlay)
  const topCandidate = candidateMonthlyData[0];
  const moeBands = topCandidate
    ? [
        // Lower base: fills from 0 to (value - MoE), transparent
        {
          name: `${topCandidate.candidate.shortName} base`,
          type: "line" as const,
          smooth: true,
          symbol: "none" as const,
          lineStyle: { width: 0 },
          areaStyle: { color: "transparent", opacity: 0 },
          data: topCandidate.values.map((v) =>
            v != null ? parseFloat((v - DEFAULT_MOE).toFixed(1)) : null
          ),
          stack: "moe-band",
          silent: true,
          z: 0,
        },
        // Band: fills from (value - MoE) to (value + MoE), colored
        {
          name: `${topCandidate.candidate.shortName} MoE`,
          type: "line" as const,
          smooth: true,
          symbol: "none" as const,
          lineStyle: { width: 0 },
          areaStyle: { color: topCandidate.candidate.partyColor, opacity: 0.1 },
          data: topCandidate.values.map((v) =>
            v != null ? parseFloat((DEFAULT_MOE * 2).toFixed(1)) : null
          ),
          stack: "moe-band",
          silent: true,
          z: 0,
        },
      ]
    : [];

  // Scatter series: individual poll dots
  const scatterSeries = {
    name: "Polls individuales",
    type: "scatter" as const,
    symbolSize: 7,
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

  // Build all series — only show candidate lines in legend
  const allSeries = [
    ...lineSeries,
    ...moeBands,
    scatterSeries,
  ];

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
          seriesType: string;
          value: number;
          color: string;
          marker: string;
          axisValueLabel: string;
        }>
      ) => {
        // Only show line series in axis tooltip (scatter has its own tooltip)
        const lineParams = params.filter((p) => p.seriesType === "line" && !p.seriesName.includes("MoE") && p.value != null);
        if (lineParams.length === 0) return "";
        let html = `<div style="font-size:11px;color:${ct.text.muted};margin-bottom:4px">${lineParams[0].axisValueLabel}</div>`;
        const sorted = [...lineParams].sort((a, b) => (b.value as number) - (a.value as number));
        sorted.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            ${p.marker}
            <span style="flex:1">${p.seriesName}</span>
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
      // Only show candidate lines in legend, not MoE bands or scatter
      data: lineSeries.map((s) => s.name),
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
    series: allSeries,
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Tendencia de Encuestas
          </h3>
          <div className="flex items-center gap-1.5">
            {sourceInfo.isSingleSource && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-amber-400">
                <AlertTriangle className="h-2.5 w-2.5" />
                FUENTE ÚNICA
              </span>
            )}
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-primary">
              Faltan {daysLeft} días
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {sourceInfo.isSingleSource
            ? `Según ${sourceInfo.sourceName} · ${monthLabels[0]} — ${monthLabels[monthLabels.length - 1]}`
            : `${monthLabels[0]} — ${monthLabels[monthLabels.length - 1]} · Promedio de ${sourceInfo.sourceCount} encuestadoras`}
        </p>
      </div>

      <div className="h-[220px] sm:h-[280px]">
        <ReactECharts option={option} style={{ height: "100%" }} opts={{ renderer: "canvas" }} />
      </div>

      {/* Insight strip */}
      <InsightStrip
        leader={leader}
        gap={gap}
        undecidedApprox={undecidedApprox}
        isEmpateTecnico={!!isEmpateTecnico}
      />

      {/* Ficha técnica */}
      <FichaTecnica pollsters={activePollsters} isSingleSource={sourceInfo.isSingleSource} />
    </div>
  );
}

// ─── Sub-components ───

function InsightStrip({
  leader,
  gap,
  undecidedApprox,
  isEmpateTecnico,
}: {
  leader: Candidate | undefined;
  gap: string;
  undecidedApprox: string;
  isEmpateTecnico: boolean;
}) {
  return (
    <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-2.5">
      <div className="text-center">
        <p className="font-mono text-sm font-bold tabular-nums text-foreground">
          {leader?.pollAverage.toFixed(1)}%
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">Puntero</p>
      </div>
      <div className="text-center border-x border-border">
        <p className={`font-mono text-sm font-bold tabular-nums ${isEmpateTecnico ? "text-amber" : "text-amber"}`}>
          {gap}pp
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">
          {isEmpateTecnico ? "Empate Tec." : "Brecha 1°-2°"}
        </p>
      </div>
      <div className="text-center border-r border-border">
        <p className="font-mono text-sm font-bold tabular-nums text-sky">
          ~{undecidedApprox}%
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">Indecisos</p>
      </div>
      <div className="text-center">
        <p className="font-mono text-sm font-bold tabular-nums text-muted-foreground">
          ±{DEFAULT_MOE}pp
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">MoE</p>
      </div>
    </div>
  );
}

function FichaTecnica({
  pollsters,
  isSingleSource,
}: {
  pollsters: Array<{ name: string; meta: { reliability: number; methodology: string; sampleSize: string } | undefined; color: string }>;
  isSingleSource: boolean;
}) {
  if (pollsters.length === 0) return null;

  if (isSingleSource && pollsters[0]?.meta) {
    const p = pollsters[0];
    return (
      <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: p.color }}
        />
        <span className="font-medium">{p.name}</span>
        <span>·</span>
        <span>{p.meta!.methodology}</span>
        <span>·</span>
        <span className="font-mono tabular-nums">n={p.meta!.sampleSize}</span>
        <span>·</span>
        <span className="font-mono tabular-nums">{p.meta!.reliability}% confiabilidad</span>
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex items-center justify-center gap-1 flex-wrap text-[10px] text-muted-foreground/60">
      <span className="mr-0.5">Fuentes:</span>
      {pollsters.map((p, i) => (
        <span key={p.name} className="flex items-center gap-0.5">
          {i > 0 && <span className="mx-0.5">·</span>}
          <span
            className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span>{p.name}</span>
          {p.meta && <span className="font-mono tabular-nums">({p.meta.sampleSize})</span>}
        </span>
      ))}
    </div>
  );
}
