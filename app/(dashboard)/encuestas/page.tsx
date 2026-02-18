"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopCandidates, candidates } from "@/lib/data/candidates";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const pollsters = [
  { name: "Ipsos Peru", reliability: 92, methodology: "Presencial + telefonica", sampleSize: "1,500" },
  { name: "CPI", reliability: 88, methodology: "Presencial", sampleSize: "1,200" },
  { name: "Datum", reliability: 90, methodology: "Presencial + online", sampleSize: "1,400" },
  { name: "IEP", reliability: 91, methodology: "Presencial + telefonica", sampleSize: "1,300" },
];

export default function EncuestasPage() {
  const topCandidates = getTopCandidates(8);
  const months = ["Oct 2025", "Nov 2025", "Dic 2025", "Ene 2026", "Feb 2026"];

  const mainChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 12 },
    },
    legend: {
      bottom: 0,
      textStyle: { color: "#94a3b8", fontSize: 11 },
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: { top: 20, right: 20, bottom: 60, left: 50 },
    xAxis: {
      type: "category" as const,
      data: months,
      axisLine: { lineStyle: { color: "#1e1c2e" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "#94a3b8", fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#1e1c2e", type: "dashed" as const } },
      min: 0,
      max: 16,
    },
    series: topCandidates.map((c) => ({
      name: c.shortName,
      type: "line" as const,
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { width: 2, color: c.partyColor },
      itemStyle: { color: c.partyColor },
      data: c.pollHistory.map((p) => p.value),
      emphasis: { focus: "series" as const },
    })),
  };

  // Bar chart for current standings
  const barChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 12 },
    },
    grid: { top: 10, right: 20, bottom: 40, left: 80 },
    xAxis: {
      type: "value" as const,
      axisLabel: { color: "#94a3b8", fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#1e1c2e", type: "dashed" as const } },
      max: 15,
    },
    yAxis: {
      type: "category" as const,
      data: [...topCandidates].reverse().map((c) => c.shortName),
      axisLine: { lineStyle: { color: "#1e1c2e" } },
      axisLabel: { color: "#f1f5f9", fontSize: 11 },
    },
    series: [
      {
        type: "bar" as const,
        data: [...topCandidates].reverse().map((c) => ({
          value: c.pollAverage,
          itemStyle: { color: c.partyColor, borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 20,
        label: {
          show: true,
          position: "right" as const,
          formatter: "{c}%",
          color: "#94a3b8",
          fontSize: 11,
          fontFamily: "JetBrains Mono, monospace",
        },
      },
    ],
  };

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
          Promedio ponderado de las principales encuestadoras del Peru
        </p>
      </motion.div>

      {/* "Si las elecciones fueran hoy" */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Si las elecciones fueran hoy...
          </h3>
          <p className="text-xs text-muted-foreground">
            Proyeccion basada en el promedio de encuestas
          </p>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pasaria a 2da vuelta</p>
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
              <p className="text-xs text-muted-foreground mb-1">Pasaria a 2da vuelta</p>
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
            <CardTitle className="text-sm">Tendencia de Encuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={mainChartOption}
              style={{ height: 280 }}
              className="sm:[&>div]:!h-[350px]"
              opts={{ renderer: "canvas" }}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">
              Ranking Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={barChartOption}
              style={{ height: 280 }}
              className="sm:[&>div]:!h-[350px]"
              opts={{ renderer: "canvas" }}
            />
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
                  <th className="py-2 text-right text-xs font-medium text-muted-foreground">Variacion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topCandidates.map((c, i) => {
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
                    <span className="text-muted-foreground">Metodologia</span>
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
