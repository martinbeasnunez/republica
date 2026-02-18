"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Shield,
  Eye,
  AlertTriangle,
  FileWarning,
  DollarSign,
  Network,
  GitBranch,
  Clock,
  Building2,
  Car,
  Home,
  TrendingUp,
  Fingerprint,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  Activity,
  Scale,
  User,
  Scan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { candidates } from "@/lib/data/candidates";
import {
  getRadiografia,
  formatSoles,
  RISK_COLORS,
  STATUS_LABELS,
  type CandidateRadiografia,
  type LegalProceeding,
  type NetworkConnection,
} from "@/lib/data/radiografia";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Layer = "patrimonio" | "legal" | "network" | "finance" | "flipflops" | "conflicts";

const LAYERS: { id: Layer; label: string; icon: typeof Shield; color: string }[] = [
  { id: "patrimonio", label: "PATRIMONIO", icon: DollarSign, color: "text-emerald" },
  { id: "legal", label: "LEGAL", icon: Scale, color: "text-rose" },
  { id: "network", label: "RED DE CONTACTOS", icon: Network, color: "text-indigo-glow" },
  { id: "finance", label: "FINANCIAMIENTO", icon: Building2, color: "text-amber" },
  { id: "flipflops", label: "CAMBIOS DE POSICION", icon: GitBranch, color: "text-sky" },
  { id: "conflicts", label: "CONFLICTOS DE INTERES", icon: AlertTriangle, color: "text-rose" },
];

export default function RadiografiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const candidate = candidates.find((c) => c.id === id);
  const radiografia = getRadiografia(id);
  const [activeLayer, setActiveLayer] = useState<Layer>("patrimonio");
  const [expandedLegal, setExpandedLegal] = useState<string | null>(null);

  if (!candidate || !radiografia) {
    notFound();
  }

  const riskColor =
    radiografia.riskScore >= 60
      ? "text-rose"
      : radiografia.riskScore >= 35
        ? "text-amber"
        : "text-emerald";

  const riskBg =
    radiografia.riskScore >= 60
      ? "bg-rose/10"
      : radiografia.riskScore >= 35
        ? "bg-amber/10"
        : "bg-emerald/10";

  const riskGlow =
    radiografia.riskScore >= 60
      ? "glow-rose"
      : radiografia.riskScore >= 35
        ? "glow-amber"
        : "glow-emerald";

  const riskLabel =
    radiografia.riskScore >= 60
      ? "ALTO RIESGO"
      : radiografia.riskScore >= 35
        ? "RIESGO MODERADO"
        : "BAJO RIESGO";

  // Patrimonio chart
  const patrimonioChart = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
      formatter: (params: Array<{ seriesName: string; value: number; axisValue: string }>) => {
        const year = params[0]?.axisValue;
        let html = `<div style="font-family:monospace;font-size:11px;"><strong>${year}</strong><br/>`;
        params.forEach((p: { seriesName: string; value: number }) => {
          html += `${p.seriesName}: S/ ${(p.value / 1_000_000).toFixed(1)}M<br/>`;
        });
        html += "</div>";
        return html;
      },
    },
    legend: {
      data: ["Activos", "Pasivos", "Patrimonio Neto"],
      textStyle: { color: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono, monospace" },
      bottom: 0,
    },
    grid: { top: 15, right: 15, bottom: 40, left: 60 },
    xAxis: {
      type: "category" as const,
      data: radiografia.patrimonio.map((p) => p.year.toString()),
      axisLine: { lineStyle: { color: "#1e1c2e" } },
      axisLabel: { color: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono, monospace" },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        color: "#94a3b8",
        fontSize: 10,
        fontFamily: "JetBrains Mono, monospace",
        formatter: (val: number) => `${(val / 1_000_000).toFixed(0)}M`,
      },
      splitLine: { lineStyle: { color: "#1e1c2e", type: "dashed" as const } },
    },
    series: [
      {
        name: "Activos",
        type: "bar" as const,
        stack: "total",
        barWidth: "60%",
        itemStyle: { color: "#10b981", borderRadius: [0, 0, 0, 0] },
        data: radiografia.patrimonio.map((p) => p.totalAssets),
      },
      {
        name: "Pasivos",
        type: "bar" as const,
        stack: "debt",
        barWidth: "60%",
        itemStyle: { color: "#ef4444", borderRadius: [0, 0, 0, 0] },
        data: radiografia.patrimonio.map((p) => p.totalLiabilities),
      },
      {
        name: "Patrimonio Neto",
        type: "line" as const,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2, color: "#D4A017", type: "dashed" as const },
        itemStyle: { color: "#D4A017" },
        data: radiografia.patrimonio.map((p) => p.netWorth),
      },
    ],
  };

  // Finance donut chart
  const financeChart = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
    },
    series: [
      {
        type: "pie" as const,
        radius: ["45%", "70%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: "#0d0d16",
          borderWidth: 2,
          borderRadius: 4,
        },
        label: {
          show: true,
          color: "#94a3b8",
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
          formatter: "{b}\n{d}%",
        },
        data: radiografia.finance.topDonors.map((d, i) => ({
          name: d.name.length > 20 ? d.name.substring(0, 18) + "..." : d.name,
          value: d.amount,
          itemStyle: {
            color: d.flagged
              ? "#ef4444"
              : ["#D4A017", "#10b981", "#8B1A1A", "#3b82f6", "#8b5cf6"][i % 5],
          },
        })),
      },
    ],
  };

  // Network force graph
  const networkChart = {
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
    },
    series: [
      {
        type: "graph" as const,
        layout: "force" as const,
        roam: true,
        force: {
          repulsion: 200,
          gravity: 0.1,
          edgeLength: [100, 200],
        },
        label: {
          show: true,
          position: "bottom" as const,
          color: "#94a3b8",
          fontSize: 9,
          fontFamily: "JetBrains Mono, monospace",
        },
        data: [
          {
            name: candidate.shortName,
            symbolSize: 40,
            itemStyle: { color: candidate.partyColor },
            label: { fontSize: 11, color: "#f1f5f9", fontWeight: "bold" as const },
          },
          ...radiografia.network.map((n) => ({
            name: n.name,
            symbolSize: n.riskLevel === "alto" ? 30 : n.riskLevel === "medio" ? 24 : 18,
            itemStyle: {
              color:
                n.riskLevel === "alto"
                  ? "#ef4444"
                  : n.riskLevel === "medio"
                    ? "#f59e0b"
                    : n.riskLevel === "bajo"
                      ? "#3b82f6"
                      : "#475569",
            },
            label: {
              color:
                n.riskLevel === "alto"
                  ? "#ef4444"
                  : n.riskLevel === "medio"
                    ? "#f59e0b"
                    : "#94a3b8",
            },
          })),
        ],
        links: radiografia.network.map((n) => ({
          source: candidate.shortName,
          target: n.name,
          lineStyle: {
            color:
              n.riskLevel === "alto"
                ? "rgba(239, 68, 68, 0.4)"
                : n.riskLevel === "medio"
                  ? "rgba(245, 158, 11, 0.3)"
                  : "rgba(71, 85, 105, 0.2)",
            width: n.riskLevel === "alto" ? 2 : 1,
            type: n.riskLevel === "alto" ? ("solid" as const) : ("dashed" as const),
          },
        })),
      },
    ],
  };

  const latestPatrimonio = radiografia.patrimonio[radiografia.patrimonio.length - 1];
  const firstPatrimonio = radiografia.patrimonio[0];
  const wealthGrowth = latestPatrimonio && firstPatrimonio
    ? ((latestPatrimonio.netWorth - firstPatrimonio.netWorth) / firstPatrimonio.netWorth) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href={`/candidatos/${candidate.slug}`}>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </Button>
      </Link>

      {/* CLASSIFIED HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="classification-header text-center">
          // AGORA INTELLIGENCE SYSTEM — CANDIDATO RADIOGRAFIA — NIVEL DE ACCESO: PUBLICO //
        </div>
      </motion.div>

      {/* Hero: Risk Score + Candidate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className={cn("bg-card border-border overflow-hidden scan-line", riskGlow)}>
          <div
            className="h-1.5 w-full risk-gradient"
            style={{ opacity: 0.8 }}
          />
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Risk Score Gauge */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative flex h-28 w-28 items-center justify-center rounded-full border-4",
                    riskBg,
                    radiografia.riskScore >= 60
                      ? "border-rose/40"
                      : radiografia.riskScore >= 35
                        ? "border-amber/40"
                        : "border-emerald/40"
                  )}
                >
                  <div className="text-center">
                    <p className={cn("font-mono text-3xl font-bold tabular-nums", riskColor)}>
                      {radiografia.riskScore}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      risk score
                    </p>
                  </div>
                  {/* Spinning ring */}
                  <svg
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      className="text-muted/30"
                      strokeWidth="3"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      className={riskColor}
                      strokeWidth="3"
                      strokeDasharray={`${(radiografia.riskScore / 100) * 339} 339`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Badge
                  className={cn(
                    "text-[9px] font-mono tracking-wider",
                    radiografia.riskScore >= 60
                      ? "bg-rose/10 text-rose border-rose/20"
                      : radiografia.riskScore >= 35
                        ? "bg-amber/10 text-amber border-amber/20"
                        : "bg-emerald/10 text-emerald border-emerald/20"
                  )}
                  variant="outline"
                >
                  {riskLabel}
                </Badge>
              </div>

              {/* Candidate info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Scan className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[10px] text-primary tracking-widest uppercase">
                    Radiografia Completa
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {candidate.name}
                </h1>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: candidate.partyColor }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {candidate.party}
                    </span>
                  </div>
                </div>

                {/* Quick stats grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Anos en politica</p>
                    <p className="font-mono text-xl font-bold tabular-nums text-foreground">{radiografia.yearsInPolitics}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Candidaturas</p>
                    <p className="font-mono text-xl font-bold tabular-nums text-foreground">{radiografia.previousCandidacies}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Procesos legales</p>
                    <p className={cn("font-mono text-xl font-bold tabular-nums", radiografia.legalHistory.length > 2 ? "text-rose" : "text-foreground")}>
                      {radiografia.legalHistory.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Cambios de partido</p>
                    <p className="font-mono text-xl font-bold tabular-nums text-foreground">{radiografia.partySwitches}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Layer Navigation */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-mono tracking-wider transition-all whitespace-nowrap",
                  isActive
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{layer.label}</span>
                <span className="sm:hidden">{layer.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* PATRIMONIO LAYER */}
          {activeLayer === "patrimonio" && (
            <div className="space-y-4">
              <div className="classification-header">
                // CAPA 0: PATRIMONIO — FUENTE: JNE DECLARACION JURADA DE HOJA DE VIDA //
              </div>

              {/* Patrimonio summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald" />
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">Patrimonio Neto</span>
                    </div>
                    <p className="terminal-text text-lg font-bold tabular-nums">
                      {latestPatrimonio ? formatSoles(latestPatrimonio.netWorth) : "N/D"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {latestPatrimonio?.year}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-sky" />
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">Crecimiento</span>
                    </div>
                    <p className={cn("font-mono text-lg font-bold tabular-nums", wealthGrowth > 50 ? "terminal-text-amber" : "terminal-text")}>
                      +{wealthGrowth.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {firstPatrimonio?.year}-{latestPatrimonio?.year}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-indigo-glow" />
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">Inmuebles</span>
                    </div>
                    <p className="terminal-text-indigo text-lg font-bold tabular-nums">
                      {latestPatrimonio?.properties || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">propiedades</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="h-4 w-4 text-amber" />
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">Vehiculos</span>
                    </div>
                    <p className="terminal-text-amber text-lg font-bold tabular-nums">
                      {latestPatrimonio?.vehicles || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">registrados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Patrimonio Chart */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-emerald via-emerald/50 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-emerald" />
                    Evolucion Patrimonial — {firstPatrimonio?.year} a {latestPatrimonio?.year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={patrimonioChart}
                    style={{ height: 250 }}
                    className="sm:[&>div]:!h-[300px]"
                    opts={{ renderer: "canvas" }}
                  />
                </CardContent>
              </Card>

              {/* Yearly detail table */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Ano</th>
                          <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Activos</th>
                          <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Pasivos</th>
                          <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Neto</th>
                          <th className="text-right p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Ingresos</th>
                          <th className="text-center p-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Fuente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {radiografia.patrimonio.map((p, i) => (
                          <tr key={p.year} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-mono text-xs text-foreground tabular-nums">{p.year}</td>
                            <td className="p-3 font-mono text-xs text-emerald text-right tabular-nums">{formatSoles(p.totalAssets)}</td>
                            <td className="p-3 font-mono text-xs text-rose text-right tabular-nums">{formatSoles(p.totalLiabilities)}</td>
                            <td className="p-3 font-mono text-xs text-indigo-glow text-right tabular-nums font-bold">{formatSoles(p.netWorth)}</td>
                            <td className="p-3 font-mono text-xs text-foreground text-right tabular-nums">{formatSoles(p.income)}</td>
                            <td className="p-3 text-center">
                              <Badge variant="outline" className="text-[9px] font-mono">{p.source}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* LEGAL LAYER */}
          {activeLayer === "legal" && (
            <div className="space-y-4">
              <div className="classification-header">
                // CAPA 1: HISTORIAL LEGAL — FUENTE: PODER JUDICIAL, FISCALIA, JNE //
              </div>

              {/* Legal summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Total procesos</p>
                    <p className="font-mono text-2xl font-bold tabular-nums text-foreground mt-1">
                      {radiografia.legalHistory.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Activos</p>
                    <p className="font-mono text-2xl font-bold tabular-nums text-rose mt-1">
                      {radiografia.legalHistory.filter((l) => l.status === "activo" || l.status === "investigacion").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Severidad Alta</p>
                    <p className="font-mono text-2xl font-bold tabular-nums text-rose mt-1">
                      {radiografia.legalHistory.filter((l) => l.severity === "alto").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Archivados</p>
                    <p className="font-mono text-2xl font-bold tabular-nums text-emerald mt-1">
                      {radiografia.legalHistory.filter((l) => l.status === "archivado").length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Legal proceedings list */}
              <div className="space-y-3">
                {radiografia.legalHistory.map((proc) => {
                  const isExpanded = expandedLegal === proc.caseId;
                  const statusInfo = STATUS_LABELS[proc.status] || { label: proc.status, color: "text-muted-foreground" };
                  const severityColors = RISK_COLORS[proc.severity];

                  return (
                    <Card
                      key={proc.caseId}
                      className={cn(
                        "bg-card border-border overflow-hidden transition-all cursor-pointer",
                        proc.severity === "alto" && "border-rose/20",
                        isExpanded && "ring-1 ring-primary/30"
                      )}
                      onClick={() => setExpandedLegal(isExpanded ? null : proc.caseId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Severity indicator */}
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0", severityColors.bg)}>
                            {proc.status === "activo" || proc.status === "investigacion" ? (
                              <Unlock className={cn("h-5 w-5", severityColors.text)} />
                            ) : (
                              <Lock className={cn("h-5 w-5", severityColors.text)} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] text-primary/70">{proc.caseId}</span>
                              <Badge variant="outline" className={cn("text-[9px] font-mono", statusInfo.color)}>
                                {statusInfo.label}
                              </Badge>
                              <Badge variant="outline" className={cn("text-[9px] font-mono", severityColors.text, severityColors.border)}>
                                {proc.severity.toUpperCase()}
                              </Badge>
                              <span className="font-mono text-[10px] text-muted-foreground ml-auto">{proc.year}</span>
                            </div>

                            <p className="text-xs text-foreground mt-1.5 font-medium">
                              {proc.description}
                            </p>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pt-3 border-t border-border/50"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-[10px] text-muted-foreground font-mono uppercase">Tipo</p>
                                      <p className="text-xs text-foreground capitalize">{proc.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-muted-foreground font-mono uppercase">Tribunal</p>
                                      <p className="text-xs text-foreground">{proc.court}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {isExpanded ? "Menos detalles" : "Ver detalles"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {radiografia.legalHistory.length === 0 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-8 text-center">
                      <Shield className="h-8 w-8 text-emerald mx-auto mb-2" />
                      <p className="text-sm text-emerald font-medium">Sin procesos legales registrados</p>
                      <p className="text-xs text-muted-foreground mt-1">No se encontraron procesos judiciales o administrativos</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* NETWORK LAYER */}
          {activeLayer === "network" && (
            <div className="space-y-4">
              <div className="classification-header">
                // CAPA 2: RED DE CONTACTOS — ANALISIS DE VINCULOS POLITICOS, FAMILIARES Y EMPRESARIALES //
              </div>

              {/* Network graph */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-indigo-glow via-primary/50 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Network className="h-3.5 w-3.5 text-primary" />
                    Grafo de Relaciones — {radiografia.network.length} conexiones identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={networkChart}
                    style={{ height: 280 }}
                    className="sm:[&>div]:!h-[350px]"
                    opts={{ renderer: "canvas" }}
                  />
                </CardContent>
              </Card>

              {/* Network connections list */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {radiografia.network.map((conn) => {
                  const riskInfo = RISK_COLORS[conn.riskLevel];
                  const typeIcons: Record<string, typeof Building2> = {
                    familiar: User,
                    empresarial: Building2,
                    politico: Scale,
                    financiero: DollarSign,
                    mediatico: Eye,
                  };
                  const TypeIcon = typeIcons[conn.type] || Network;

                  return (
                    <Card key={conn.id} className={cn("bg-card border-border neon-border overflow-hidden")}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0", riskInfo.bg)}>
                            <TypeIcon className={cn("h-4 w-4", riskInfo.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground truncate">{conn.name}</p>
                              <Badge variant="outline" className={cn("text-[9px] font-mono ml-auto flex-shrink-0", riskInfo.text, riskInfo.border)}>
                                {conn.riskLevel.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{conn.relationship}</p>
                            {conn.entity && (
                              <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{conn.entity}</p>
                            )}
                            <Badge variant="secondary" className="text-[9px] mt-1.5 capitalize">{conn.type}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* FINANCE LAYER */}
          {activeLayer === "finance" && (
            <div className="space-y-4">
              <div className="classification-header">
                // CAPA 3: FINANCIAMIENTO DE CAMPANA — FUENTE: ONPE, DECLARACIONES DE APORTES //
              </div>

              {/* Finance summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Total Declarado</p>
                    <p className="terminal-text text-lg font-bold tabular-nums mt-1">
                      {formatSoles(radiografia.finance.totalDeclared)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Gasto en Medios</p>
                    <p className="terminal-text-amber text-lg font-bold tabular-nums mt-1">
                      {formatSoles(radiografia.finance.mediaSpend)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Gasto Digital</p>
                    <p className="terminal-text-indigo text-lg font-bold tabular-nums mt-1">
                      {formatSoles(radiografia.finance.digitalSpend)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border neon-border">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Alertas</p>
                    <p className={cn("font-mono text-lg font-bold tabular-nums mt-1", radiografia.finance.suspiciousFlags.length > 0 ? "terminal-text-rose" : "terminal-text")}>
                      {radiografia.finance.suspiciousFlags.length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Donut chart + donors */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="bg-card border-border overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-amber via-amber/50 to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Distribucion de Aportes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts
                      option={financeChart}
                      style={{ height: 240 }}
                      className="sm:[&>div]:!h-[280px]"
                      opts={{ renderer: "canvas" }}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-card border-border overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Principales Aportantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {radiografia.finance.topDonors.map((donor, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-foreground truncate">{donor.name}</p>
                              {donor.flagged && (
                                <AlertTriangle className="h-3 w-3 text-rose flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{donor.type}</p>
                          </div>
                          <p className={cn("font-mono text-xs font-bold tabular-nums", donor.flagged ? "text-rose" : "text-foreground")}>
                            {formatSoles(donor.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Suspicious flags */}
              {radiografia.finance.suspiciousFlags.length > 0 && (
                <Card className="bg-card border-rose/20 overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-rose via-rose/50 to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-rose flex items-center gap-2">
                      <FileWarning className="h-3.5 w-3.5" />
                      Alertas de Financiamiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {radiografia.finance.suspiciousFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-rose/5 border border-rose/10 p-3">
                          <AlertTriangle className="h-4 w-4 text-rose flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-rose/90">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* FLIP-FLOPS LAYER */}
          {activeLayer === "flipflops" && (
            <div className="space-y-4">
              <div className="classification-header">
                // CAPA 4: CAMBIOS DE POSICION — DETECTOR DE CONTRADICCIONES EN DECLARACIONES PUBLICAS //
              </div>

              {radiografia.positionChanges.length > 0 ? (
                <div className="space-y-4">
                  {/* Group by topic */}
                  {Object.entries(
                    radiografia.positionChanges.reduce<Record<string, typeof radiografia.positionChanges>>((acc, change) => {
                      if (!acc[change.topic]) acc[change.topic] = [];
                      acc[change.topic].push(change);
                      return acc;
                    }, {})
                  ).map(([topic, changes]) => (
                    <Card key={topic} className="bg-card border-border overflow-hidden neon-border">
                      <div className="h-0.5 w-full bg-gradient-to-r from-sky via-sky/50 to-transparent" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-sky" />
                          {topic}
                          <Badge variant="outline" className="text-[9px] font-mono text-sky border-sky/20 ml-auto">
                            {changes.length} CAMBIOS
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />

                          <div className="space-y-4">
                            {changes
                              .sort((a, b) => a.year - b.year)
                              .map((change, i) => (
                                <div key={i} className="relative flex gap-4 pl-0">
                                  {/* Timeline dot */}
                                  <div className="flex flex-col items-center z-10">
                                    <div className={cn(
                                      "h-9 w-9 rounded-full border-2 flex items-center justify-center",
                                      i === 0
                                        ? "bg-muted border-border"
                                        : "bg-sky/10 border-sky/40"
                                    )}>
                                      <span className="font-mono text-[10px] text-foreground">{change.year}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 pb-1">
                                    <p className="text-xs text-foreground">{change.position}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-mono flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      {change.evidence}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <Shield className="h-8 w-8 text-emerald mx-auto mb-2" />
                    <p className="text-sm text-emerald font-medium">Sin cambios de posicion detectados</p>
                    <p className="text-xs text-muted-foreground mt-1">Las posiciones del candidato se han mantenido consistentes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* CONFLICTS LAYER */}
          {activeLayer === "conflicts" && (
            <div className="space-y-4">
              <div className="classification-header">
                // CAPA 5: CONFLICTOS DE INTERES — ANALISIS DE INCOMPATIBILIDADES Y VINCULACIONES //
              </div>

              {radiografia.conflictsOfInterest.length > 0 ? (
                <div className="space-y-3">
                  {radiografia.conflictsOfInterest.map((conflict, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="bg-card border-rose/20 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose/10 flex-shrink-0">
                              <AlertTriangle className="h-5 w-5 text-rose" />
                            </div>
                            <div>
                              <p className="text-xs text-foreground leading-relaxed">{conflict}</p>
                              <Badge variant="outline" className="text-[9px] font-mono text-rose border-rose/20 mt-2">
                                CONFLICTO #{String(i + 1).padStart(3, "0")}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <Shield className="h-8 w-8 text-emerald mx-auto mb-2" />
                    <p className="text-sm text-emerald font-medium">Sin conflictos de interes identificados</p>
                    <p className="text-xs text-muted-foreground mt-1">No se detectaron incompatibilidades entre intereses personales y funcion publica</p>
                  </CardContent>
                </Card>
              )}

              {/* Education & extras */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5 text-primary" />
                    Verificacion de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      {radiografia.educationVerified ? (
                        <div className="h-2 w-2 rounded-full bg-emerald" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-rose" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        Educacion {radiografia.educationVerified ? "verificada" : "no verificada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", radiografia.militaryService ? "bg-emerald" : "bg-muted-foreground/30")} />
                      <span className="text-xs text-muted-foreground">
                        Servicio militar: {radiografia.militaryService ? "Si" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", radiografia.partySwitches > 0 ? "bg-amber" : "bg-emerald")} />
                      <span className="text-xs text-muted-foreground">
                        {radiografia.partySwitches} cambios de partido
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom classification */}
      <div className="classification-header text-center">
        // FIN DEL REPORTE — DATOS BASADOS EN FUENTES OFICIALES — ACTUALIZADO {new Date().toISOString().split("T")[0]} //
      </div>
    </div>
  );
}
