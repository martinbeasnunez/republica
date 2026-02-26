"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Dice6,
  Play,
  RotateCcw,
  Settings2,
  TrendingUp,
  Trophy,
  Target,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Users,
  Percent,
  Gauge,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  runSimulation,
  DEFAULT_CONFIG,
  type SimulationConfig,
  type SimulationResult,
  type CandidateSimResult,
} from "@/lib/data/simulador";
import type { Candidate } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/lib/echarts-theme";
import { useCountry } from "@/lib/config/country-context";
import { AlertTriangle, Scale } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface SimuladorClientProps {
  candidates: Candidate[];
}

export function SimuladorClient({ candidates }: SimuladorClientProps) {
  const ct = useChartTheme();
  const country = useCountry();
  const isColombia = country.code === "co";
  const [config, setConfig] = useState<SimulationConfig>({
    ...DEFAULT_CONFIG,
    // Colombia has lower blank vote rates (~3-5%) vs Peru (~5-15%)
    blankVoteMean: isColombia ? 5 : 8,
    blankVoteStdDev: isColombia ? 2 : 3,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    // Simulate loading feel
    setTimeout(() => {
      const simResult = runSimulation(config, candidates);
      setResult(simResult);
      setRunCount((prev) => prev + 1);
      setIsRunning(false);
    }, 800);
  }, [config, candidates]);

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setResult(null);
    setRunCount(0);
  };

  // Win probability bar chart
  const winProbChart = result
    ? {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis" as const,
          backgroundColor: ct.tooltip.backgroundColor,
          borderColor: ct.tooltip.borderColor,
          textStyle: { color: ct.tooltip.textColor, fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
          formatter: (params: Array<{ name: string; value: number; color: string }>) => {
            const p = params[0];
            return `<div style="font-family:monospace"><strong>${p.name}</strong><br/>Probabilidad: ${p.value}%</div>`;
          },
        },
        grid: { top: 10, right: 30, bottom: 30, left: 80 },
        xAxis: {
          type: "value" as const,
          max: 100,
          axisLabel: { color: ct.axis.labelColor, fontSize: 10, fontFamily: "JetBrains Mono, monospace", formatter: "{value}%" },
          splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
        },
        yAxis: {
          type: "category" as const,
          data: [...result.candidates].reverse().map((c) => c.shortName),
          axisLabel: {
            color: ct.text.primary,
            fontSize: 10,
            fontFamily: "JetBrains Mono, monospace",
            width: 70,
            overflow: "truncate" as const,
          },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar" as const,
            data: [...result.candidates].reverse().map((c) => ({
              value: c.winProbability,
              itemStyle: { color: c.partyColor, borderRadius: [0, 4, 4, 0] },
            })),
            barWidth: "65%",
            label: {
              show: true,
              position: "right" as const,
              color: ct.text.primary,
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              formatter: (params: { value: number }) => `${params.value}%`,
            },
          },
        ],
      }
    : null;

  // Vote distribution box-whisker style chart
  const distributionChart = result
    ? {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis" as const,
          backgroundColor: ct.tooltip.backgroundColor,
          borderColor: ct.tooltip.borderColor,
          textStyle: { color: ct.tooltip.textColor, fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
        },
        grid: { top: 15, right: 20, bottom: 30, left: 80 },
        xAxis: {
          type: "value" as const,
          axisLabel: { color: ct.axis.labelColor, fontSize: 10, fontFamily: "JetBrains Mono, monospace", formatter: "{value}%" },
          splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
        },
        yAxis: {
          type: "category" as const,
          data: [...result.candidates].reverse().map((c) => c.shortName),
          axisLabel: {
            color: ct.text.primary,
            fontSize: 10,
            fontFamily: "JetBrains Mono, monospace",
            width: 70,
            overflow: "truncate" as const,
          },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          // Error bar: min to max
          {
            type: "custom" as const,
            renderItem: (params: { dataIndex: number }, api: {
              value: (dim: number) => number;
              coord: (val: [number, number]) => [number, number];
              size: (val: [number, number]) => [number, number];
              style: (opts: Record<string, unknown>) => Record<string, unknown>;
            }) => {
              const idx = params.dataIndex;
              const c = [...result.candidates].reverse()[idx];
              const p5 = api.coord([c.percentile5, idx]);
              const p95 = api.coord([c.percentile95, idx]);
              const mean = api.coord([c.meanVote, idx]);
              const halfHeight = 6;

              return {
                type: "group" as const,
                children: [
                  // Whisker line
                  {
                    type: "line" as const,
                    shape: { x1: p5[0], y1: p5[1], x2: p95[0], y2: p95[1] },
                    style: { stroke: c.partyColor, lineWidth: 2, opacity: 0.6 },
                  },
                  // Left cap
                  {
                    type: "line" as const,
                    shape: { x1: p5[0], y1: p5[1] - halfHeight, x2: p5[0], y2: p5[1] + halfHeight },
                    style: { stroke: c.partyColor, lineWidth: 2, opacity: 0.6 },
                  },
                  // Right cap
                  {
                    type: "line" as const,
                    shape: { x1: p95[0], y1: p95[1] - halfHeight, x2: p95[0], y2: p95[1] + halfHeight },
                    style: { stroke: c.partyColor, lineWidth: 2, opacity: 0.6 },
                  },
                  // Mean dot
                  {
                    type: "circle" as const,
                    shape: { cx: mean[0], cy: mean[1], r: 5 },
                    style: { fill: c.partyColor },
                  },
                ],
              };
            },
            data: [...result.candidates].reverse().map((_, i) => [i]),
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="classification-header text-center">
          // CONDOR INTELLIGENCE SYSTEM — {isColombia ? "ANÁLISIS DE ESCENARIOS" : "SIMULADOR ELECTORAL"} MONTE CARLO — MODELO PREDICTIVO //
        </div>
      </motion.div>

      {/* Legal disclaimer for Colombia (Ley 2494/2025) */}
      {isColombia && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4"
        >
          <div className="flex items-start gap-2">
            <Scale className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-200/80">
              <span className="font-semibold text-amber-400">Aviso legal:</span>{" "}
              Esta herramienta es un ejercicio educativo de análisis de escenarios basado en modelos estadísticos (Monte Carlo).
              No constituye encuesta ni sondeo de intención de voto bajo los términos de la{" "}
              <span className="font-mono text-amber-300">Ley 2494 de 2025</span>.
              Los resultados son proyecciones hipotéticas, no predicciones.
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Dice6 className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isColombia ? "Análisis de Escenarios" : "Simulador Electoral"}
          </h1>
          <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
            <Activity className="h-3 w-3" />
            MONTE CARLO
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Ejecuta miles de simulaciones para proyectar probabilidades de victoria
        </p>
      </motion.div>

      {/* Controls */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="gap-2 font-mono text-xs sm:text-sm"
              >
                {isRunning ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    SIMULANDO...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline">EJECUTAR {config.numSimulations.toLocaleString()} SIMULACIONES</span>
                    <span className="sm:hidden">SIMULAR</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {runCount > 0 && (
                <Badge variant="outline" className="font-mono text-xs gap-1">
                  <Zap className="h-3 w-3" />
                  #{runCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="gap-1 text-xs text-muted-foreground"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Parámetros
                {showConfig ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Config panel */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-border"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-3">
                      <BarChart3 className="h-3 w-3" />
                      Simulaciones
                    </label>
                    <Slider
                      value={[config.numSimulations]}
                      onValueChange={([v]) => setConfig({ ...config, numSimulations: v })}
                      min={1000}
                      max={50000}
                      step={1000}
                    />
                    <p className="font-mono text-xs text-foreground mt-1 tabular-nums">{config.numSimulations.toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-3">
                      <Gauge className="h-3 w-3" />
                      Volatilidad
                    </label>
                    <Slider
                      value={[config.volatility * 100]}
                      onValueChange={([v]) => setConfig({ ...config, volatility: v / 100 })}
                      min={10}
                      max={100}
                      step={5}
                    />
                    <p className="font-mono text-xs text-foreground mt-1 tabular-nums">{(config.volatility * 100).toFixed(0)}%</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-3">
                      <Users className="h-3 w-3" />
                      Indecisos
                    </label>
                    <Slider
                      value={[config.undecidedPercent]}
                      onValueChange={([v]) => setConfig({ ...config, undecidedPercent: v })}
                      min={5}
                      max={40}
                      step={1}
                    />
                    <p className="font-mono text-xs text-foreground mt-1 tabular-nums">{config.undecidedPercent}%</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-3">
                      <Percent className="h-3 w-3" />
                      Var. Participación
                    </label>
                    <Slider
                      value={[config.turnoutVariation]}
                      onValueChange={([v]) => setConfig({ ...config, turnoutVariation: v })}
                      min={1}
                      max={20}
                      step={1}
                    />
                    <p className="font-mono text-xs text-foreground mt-1 tabular-nums">±{config.turnoutVariation}%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Loading animation */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Dice6 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <p className="mt-4 font-mono text-sm text-primary animate-pulse">
              Ejecutando {config.numSimulations.toLocaleString()} simulaciones...
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              Modelo Monte Carlo con distribución normal multivariada
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Winner projection */}
            <Card className="bg-card border-border overflow-hidden scan-line glow-indigo">
              <div className="h-1.5 w-full risk-gradient" />
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-amber" />
                  <h2 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-foreground">
                    Proyección del Ganador
                  </h2>
                  <Badge variant="outline" className="text-[9px] font-mono ml-auto">
                    {result.totalSimulations.toLocaleString()} SIM
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {result.candidates.slice(0, 3).map((c, i) => (
                    <div
                      key={c.candidateId}
                      className={cn(
                        "rounded-xl border p-4 text-center",
                        i === 0
                          ? "border-amber/30 bg-amber/5"
                          : "border-border bg-muted/20"
                      )}
                    >
                      {i === 0 && (
                        <Trophy className="h-6 w-6 text-amber mx-auto mb-2" />
                      )}
                      <p className="text-xs text-muted-foreground">{c.name}</p>
                      <p
                        className="font-mono text-2xl sm:text-3xl font-bold tabular-nums mt-1"
                        style={{ color: c.partyColor }}
                      >
                        {c.winProbability}%
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">
                        probabilidad de victoria
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Voto medio: {c.meanVote}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Win probability chart */}
            {winProbChart && (
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Probabilidad de Victoria — Primera Vuelta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={winProbChart}
                    style={{ height: 280 }}
                    className="sm:[&>div]:!h-[350px]"
                    opts={{ renderer: "canvas" }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Vote Distribution */}
            {distributionChart && (
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-amber via-amber/50 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-amber" />
                    Rango de Votación (Percentil 5-95)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={distributionChart}
                    style={{ height: 280 }}
                    className="sm:[&>div]:!h-[350px]"
                    opts={{ renderer: "canvas" }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Detailed stats table */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-emerald via-emerald/50 to-transparent" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald" />
                  Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Candidato</th>
                        <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">P(Victoria)</th>
                        <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">P(2da Vuelta)</th>
                        <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Voto Medio</th>
                        <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Mediana</th>
                        <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Rango (5-95%)</th>
                        <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Desv. Est.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.candidates.map((c) => (
                        <tr key={c.candidateId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: c.partyColor }}
                              />
                              <span className="text-xs text-foreground font-medium">{c.shortName}</span>
                            </div>
                          </td>
                          <td className={cn(
                            "p-3 font-mono text-xs text-right tabular-nums font-bold",
                            c.winProbability >= 20 ? "text-emerald" : c.winProbability >= 5 ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {c.winProbability}%
                          </td>
                          <td className="p-3 font-mono text-xs text-right tabular-nums text-sky">
                            {c.secondRoundProbability}%
                          </td>
                          <td className="p-3 font-mono text-xs text-right tabular-nums text-foreground">
                            {c.meanVote}%
                          </td>
                          <td className="p-3 font-mono text-xs text-right tabular-nums text-foreground">
                            {c.medianVote}%
                          </td>
                          <td className="p-3 font-mono text-xs text-right tabular-nums text-muted-foreground">
                            {c.percentile5}% – {c.percentile95}%
                          </td>
                          <td className="p-3 font-mono text-xs text-right tabular-nums text-muted-foreground">
                            ±{c.stdDev}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Second round matchups */}
            {result.secondRoundMatchups.length > 0 && (
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-sky via-sky/50 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-sky" />
                    Escenarios de Segunda Vuelta Más Probables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.secondRoundMatchups.slice(0, 5).map((matchup, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 sm:gap-3 rounded-lg bg-muted/20 border border-border/50 p-2 sm:p-3"
                      >
                        <span className="font-mono text-[10px] sm:text-xs text-muted-foreground w-5 sm:w-6 flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-3 min-w-0">
                          <span className="text-[11px] sm:text-xs font-medium text-foreground truncate">{matchup.candidate1}</span>
                          <Badge variant="outline" className="text-[8px] sm:text-[9px] font-mono flex-shrink-0 px-1 sm:px-1.5">VS</Badge>
                          <span className="text-[11px] sm:text-xs font-medium text-foreground truncate">{matchup.candidate2}</span>
                        </div>
                        <span className="font-mono text-[10px] sm:text-xs font-bold tabular-nums text-sky flex-shrink-0">
                          {matchup.probability}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="classification-header text-center">
              // MODELO: MONTE CARLO N={result.totalSimulations.toLocaleString()} — VOL={config.volatility * 100}% — INDECISOS={config.undecidedPercent}% — {result.timestamp.split("T")[0]} //
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results yet */}
      {!result && !isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="relative mb-6">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
              <Dice6 className="h-10 w-10 text-primary/50" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-foreground">
            Listo para simular
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md text-center">
            El simulador ejecuta miles de elecciones aleatorias basadas en encuestas actuales,
            volatilidad histórica y porcentaje de indecisos para proyectar probabilidades de victoria.
          </p>
          <Button onClick={handleRun} className="mt-6 gap-2 font-mono" size="lg">
            <Play className="h-4 w-4" />
            EJECUTAR SIMULACIÓN
          </Button>
        </motion.div>
      )}
    </div>
  );
}
