"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Landmark,
  ShieldCheck,
  GraduationCap,
  Building2,
  MonitorSmartphone,
  TrendingUp,
  HeartPulse,
  Users,
  Wallet,
  Scale,
  X,
  ExternalLink,
  AlertTriangle,
  Target,
  Flag,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Fingerprint,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  developmentPillars,
  internationalFrameworks,
  peruEconomicIndicators,
  benchmarkCountries,
  getPillarScoreColor,
  getPillarScoreLabel,
  getPillarsSummary,
  type DevelopmentPillar,
} from "@/lib/data/pilares-desarrollo";
import { candidates, type Category } from "@/lib/data/candidates";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// ─── MAPPINGS ───

const pillarToCategoryMap: Record<string, Category[]> = {
  institucionalidad: ["anticorrupcion"],
  anticorrupcion: ["anticorrupcion"],
  educacion: ["educacion"],
  infraestructura: ["infraestructura"],
  "transformacion-digital": ["tecnologia"],
  "diversificacion-economica": ["economia"],
  salud: ["salud"],
  "inclusion-social": ["salud", "educacion"],
  "capacidad-fiscal": ["economia"],
  "justicia-seguridad": ["seguridad"],
};

const iconMap: Record<string, React.ElementType> = {
  Landmark, ShieldCheck, GraduationCap, Building2, MonitorSmartphone,
  TrendingUp, HeartPulse, Users, Wallet, Scale,
};

const scoreNumeric: Record<string, number> = {
  critico: 20, deficiente: 40, en_progreso: 60, aceptable: 75, bueno: 90,
};

const scoreColors: Record<string, { ring: string; bg: string; text: string; glow: string }> = {
  rose: { ring: "stroke-rose", bg: "bg-rose/10", text: "text-rose", glow: "shadow-rose/20" },
  amber: { ring: "stroke-amber", bg: "bg-amber/10", text: "text-amber", glow: "shadow-amber/20" },
  sky: { ring: "stroke-sky", bg: "bg-sky/10", text: "text-sky", glow: "shadow-sky/20" },
  emerald: { ring: "stroke-emerald", bg: "bg-emerald/10", text: "text-emerald", glow: "shadow-emerald/20" },
  green: { ring: "stroke-green", bg: "bg-green/10", text: "text-green", glow: "shadow-green/20" },
};

// ─── HELPERS ───

function getCandidateProposals(pillarId: string) {
  const categories = pillarToCategoryMap[pillarId] || [];
  const topCandidates = [...candidates].sort((a, b) => b.pollAverage - a.pollAverage).slice(0, 5);
  return topCandidates
    .map((c) => {
      const relevantProposals = c.keyProposals.filter((p) => categories.includes(p.category));
      if (relevantProposals.length === 0) return null;
      return { candidate: c, proposals: relevantProposals };
    })
    .filter(Boolean) as { candidate: (typeof candidates)[0]; proposals: (typeof candidates)[0]["keyProposals"] }[];
}

// ─── CIRCULAR SCORE GAUGE ───

function ScoreGauge({ score, size = 56, strokeWidth = 4 }: { score: string; size?: number; strokeWidth?: number }) {
  const colorKey = getPillarScoreColor(score as DevelopmentPillar["peruStatus"]["score"]);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const value = scoreNumeric[score] || 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor"
          className="text-muted/20" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" className={colors.ring}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-xs font-mono font-bold", colors.text)}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── TREND ICON ───

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "empeorando") return <ArrowDownRight className="h-3 w-3 text-rose" />;
  if (trend === "mejorando") return <ArrowUpRight className="h-3 w-3 text-emerald" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

// ─── PILLAR CARD (Grid version) ───

function PillarCard({
  pillar,
  index,
  onSelect,
}: {
  pillar: DevelopmentPillar;
  index: number;
  onSelect: (p: DevelopmentPillar) => void;
}) {
  const Icon = iconMap[pillar.icon] || Target;
  const colorKey = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const label = getPillarScoreLabel(pillar.peruStatus.score);
  const mainRanking = pillar.peruStatus.rankings[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <button
        onClick={() => onSelect(pillar)}
        className="w-full text-left group"
      >
        <Card className={cn(
          "relative overflow-hidden border-border transition-all duration-300",
          "hover:border-primary/30 hover:shadow-lg",
          colors.glow && `hover:${colors.glow}`,
        )}>
          {/* Top gradient line */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-[2px]",
            colorKey === "rose" && "bg-gradient-to-r from-rose via-rose/50 to-transparent",
            colorKey === "amber" && "bg-gradient-to-r from-amber via-amber/50 to-transparent",
            colorKey === "sky" && "bg-gradient-to-r from-sky via-sky/50 to-transparent",
            colorKey === "emerald" && "bg-gradient-to-r from-emerald via-emerald/50 to-transparent",
            colorKey === "green" && "bg-gradient-to-r from-green via-green/50 to-transparent",
          )} />

          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              {/* Score gauge */}
              <div className="flex-shrink-0">
                <ScoreGauge score={pillar.peruStatus.score} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-mono text-muted-foreground/50">
                    {String(pillar.number).padStart(2, "0")}
                  </span>
                  <Icon className={cn("h-3.5 w-3.5", colors.text)} />
                  <Badge
                    variant="outline"
                    className={cn("text-[8px] font-mono px-1.5 py-0", colors.text, `border-${colorKey}/30`)}
                  >
                    {label.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {pillar.name}
                </h3>

                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {pillar.shortDescription}
                </p>

                {/* Key metric preview */}
                {mainRanking && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      {mainRanking.rank && <span>#{mainRanking.rank}/{mainRanking.totalCountries}</span>}
                      {mainRanking.score !== null && !mainRanking.rank && (
                        <span>{mainRanking.score}/{mainRanking.maxScore}</span>
                      )}
                    </div>
                    <TrendIcon trend={mainRanking.trend} />
                    <span className="text-[9px] text-muted-foreground/50 font-mono">
                      {mainRanking.organization.split(" ")[0]}
                    </span>
                  </div>
                )}

                {/* Top problem */}
                <div className="mt-2 flex items-start gap-1.5">
                  <AlertTriangle className={cn("h-3 w-3 flex-shrink-0 mt-0.5", colors.text, "opacity-60")} />
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {pillar.peruStatus.keyProblems[0]}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.div>
  );
}

// ─── DETAIL MODAL ───

function PillarDetailModal({
  pillar,
  onClose,
}: {
  pillar: DevelopmentPillar;
  onClose: () => void;
}) {
  const Icon = iconMap[pillar.icon] || Target;
  const colorKey = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const label = getPillarScoreLabel(pillar.peruStatus.score);
  const candidateProposals = getCandidateProposals(pillar.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-12 sm:pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl mb-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color strip */}
        <div className={cn(
          "h-1 w-full rounded-t-2xl",
          colorKey === "rose" && "bg-gradient-to-r from-rose via-rose/60 to-transparent",
          colorKey === "amber" && "bg-gradient-to-r from-amber via-amber/60 to-transparent",
          colorKey === "sky" && "bg-gradient-to-r from-sky via-sky/60 to-transparent",
          colorKey === "emerald" && "bg-gradient-to-r from-emerald via-emerald/60 to-transparent",
          colorKey === "green" && "bg-gradient-to-r from-green via-green/60 to-transparent",
        )} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <ScoreGauge score={pillar.peruStatus.score} size={72} strokeWidth={5} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-muted-foreground/50">
                  PILAR {String(pillar.number).padStart(2, "0")}
                </span>
                <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5", colors.text, `border-${colorKey}/30`)}>
                  {label.toUpperCase()}
                </Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight flex items-center gap-2">
                <Icon className={cn("h-5 w-5 flex-shrink-0", colors.text)} />
                {pillar.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {pillar.nameEn}
              </p>
            </div>
          </div>

          {/* Why it matters */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1.5">
              Por que importa
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pillar.whyItMatters}
            </p>
          </div>

          {/* Data points */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Datos clave
            </p>
            <div className="grid gap-1.5">
              {pillar.dataPoints.map((dp, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", colors.bg.replace("/10", ""))} />
                  <span className="leading-relaxed">{dp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings */}
          {pillar.peruStatus.rankings.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Rankings internacionales
              </p>
              <div className="grid gap-2">
                {pillar.peruStatus.rankings.map((r, i) => (
                  <a
                    key={i}
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {r.indexName} ({r.year})
                      </p>
                      <p className="text-[10px] text-muted-foreground">{r.organization}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{r.notes}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {r.rank && (
                        <p className="text-sm font-mono font-bold text-foreground">
                          #{r.rank}<span className="text-muted-foreground font-normal text-xs">/{r.totalCountries}</span>
                        </p>
                      )}
                      {r.score !== null && (
                        <p className="text-sm font-mono font-bold text-foreground">
                          {r.score}<span className="text-muted-foreground font-normal text-xs">/{r.maxScore}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <TrendIcon trend={r.trend} />
                        <span className="text-[9px] text-muted-foreground capitalize">{r.trend.replace("_", " ")}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Problems */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Problemas de Peru
            </p>
            <div className="grid gap-1.5">
              {pillar.peruStatus.keyProblems.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5 text-rose/60" />
                  <span className="leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark */}
          <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-emerald" />
              <span className="text-xs font-bold text-foreground">{pillar.benchmark.country}</span>
              <Badge variant="outline" className="text-[9px] border-emerald/30 text-emerald px-1.5">
                {pillar.benchmark.keyMetric}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {pillar.benchmark.description}
            </p>
          </div>

          {/* Candidate proposals */}
          {candidateProposals.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Que proponen los candidatos
              </p>
              <div className="grid gap-2">
                {candidateProposals.map(({ candidate, proposals }) => (
                  <div key={candidate.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.partyColor }} />
                      <span className="text-xs font-medium text-foreground">{candidate.shortName}</span>
                      <span className="text-[10px] text-muted-foreground">{candidate.party}</span>
                    </div>
                    {proposals.map((p, i) => (
                      <div key={i} className="ml-4 mt-1">
                        <p className="text-[11px] text-foreground font-medium">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{p.summary}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Framework links */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
            {pillar.frameworks.map((fId) => {
              const fw = internationalFrameworks.find((f) => f.id === fId);
              return fw ? (
                <a
                  key={fId}
                  href={fw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[9px] rounded-lg border border-border px-2 py-1 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {fw.organization}
                </a>
              ) : null;
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ECONOMIC INDICATOR BAR ───

function IndicatorBar({ indicator }: { indicator: (typeof peruEconomicIndicators)[0] }) {
  return (
    <a
      href={indicator.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 transition-all"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
          {indicator.name}
        </p>
        <p className="text-sm font-mono font-bold text-foreground mt-0.5 tabular-nums">
          {indicator.value}
        </p>
      </div>
      <div className="text-right flex-shrink-0 max-w-[180px]">
        <p className="text-[9px] text-muted-foreground/60 leading-tight text-right line-clamp-2">
          {indicator.comparison}
        </p>
      </div>
      <ExternalLink className="h-3 w-3 text-muted-foreground/20 group-hover:text-primary flex-shrink-0" />
    </a>
  );
}

// ─── RADAR CHART ───

function PillarRadarChart() {
  const option = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 11 },
    },
    radar: {
      indicator: developmentPillars.map((p) => ({
        name: p.name.length > 18 ? p.name.slice(0, 16) + "..." : p.name,
        max: 100,
      })),
      shape: "polygon" as const,
      splitNumber: 4,
      axisName: {
        color: "#94a3b8",
        fontSize: 9,
        fontFamily: "Inter, sans-serif",
      },
      splitLine: { lineStyle: { color: "#1e1c2e" } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "#1e1c2e" } },
    },
    series: [{
      type: "radar" as const,
      data: [{
        value: developmentPillars.map((p) => scoreNumeric[p.peruStatus.score] || 40),
        name: "Peru",
        lineStyle: { color: "#8B1A1A", width: 2 },
        itemStyle: { color: "#8B1A1A" },
        areaStyle: { color: "rgba(139, 26, 26, 0.15)" },
        symbol: "circle",
        symbolSize: 6,
      }],
    }],
  }), []);

  return (
    <div className="w-full h-[320px] sm:h-[380px]">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

// ─── SCORE DISTRIBUTION BAR ───

function ScoreDistribution() {
  const summary = getPillarsSummary();
  const total = summary.total;

  const segments = [
    { label: "Critico", count: summary.byScore.critico, color: "bg-rose", textColor: "text-rose" },
    { label: "Deficiente", count: summary.byScore.deficiente, color: "bg-amber", textColor: "text-amber" },
    { label: "En progreso", count: summary.byScore.en_progreso, color: "bg-sky", textColor: "text-sky" },
    { label: "Aceptable", count: summary.byScore.aceptable, color: "bg-emerald", textColor: "text-emerald" },
    { label: "Bueno", count: summary.byScore.bueno, color: "bg-green", textColor: "text-green" },
  ].filter((s) => s.count > 0);

  return (
    <div className="space-y-3">
      {/* Visual bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/30">
        {segments.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ width: 0 }}
            animate={{ width: `${(s.count / total) * 100}%` }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
            className={cn("h-full", s.color, i === 0 && "rounded-l-full", i === segments.length - 1 && "rounded-r-full")}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", s.color)} />
            <span className="text-[10px] text-muted-foreground">
              {s.label}: <span className={cn("font-mono font-bold", s.textColor)}>{s.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ALL PILLARS MINI LIST ───

function PillarsMiniList({ onSelect }: { onSelect: (p: DevelopmentPillar) => void }) {
  return (
    <div className="grid gap-1">
      {developmentPillars.map((p) => {
        const colorKey = getPillarScoreColor(p.peruStatus.score);
        const colors = scoreColors[colorKey];
        const value = scoreNumeric[p.peruStatus.score];
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors group text-left"
          >
            <span className="text-[10px] font-mono text-muted-foreground/40 w-4">
              {String(p.number).padStart(2, "0")}
            </span>
            <span className="text-xs text-foreground group-hover:text-primary transition-colors flex-1 truncate">
              {p.name}
            </span>
            {/* Mini bar */}
            <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden flex-shrink-0">
              <div
                className={cn("h-full rounded-full", colors.bg.replace("/10", ""))}
                style={{ width: `${value}%` }}
              />
            </div>
            <Badge variant="outline" className={cn("text-[8px] font-mono px-1 py-0", colors.text, `border-${colorKey}/20`)}>
              {value}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN PAGE ───

export default function PilaresPage() {
  const [selected, setSelected] = useState<DevelopmentPillar | null>(null);
  const summary = getPillarsSummary();

  const handleSelect = useCallback((p: DevelopmentPillar) => {
    setSelected(p);
    document.body.style.overflow = "hidden";
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── CLASSIFICATION HEADER ─── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="classification-header text-center">
          // CONDOR INTELLIGENCE SYSTEM — MODULO PILARES DE DESARROLLO — ANALISIS ESTRUCTURAL //
        </div>
      </motion.div>

      {/* ─── HERO ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Pilares de Desarrollo
          </h1>
          <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
            <Fingerprint className="h-3 w-3" />
            {summary.total} PILARES
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Lo que Peru necesita para crecer — basado en {internationalFrameworks.length} frameworks internacionales
        </p>
      </motion.div>

      {/* ─── DISCLAIMER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Diagnostico basado en estandares internacionales
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Datos de WEF, Banco Mundial, PNUD, OCDE, WJP, Transparency International, IMD y PISA. Los puntajes reflejan mediciones externas al Peru. Las propuestas se extraen de planes de gobierno oficiales. CONDOR no tiene afiliacion politica.
          </p>
        </div>
      </motion.div>

      {/* ─── SCORE OVERVIEW + RADAR ─── */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Mapa de competitividad
              </p>
              <PillarRadarChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Score distribution + Pillar list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Distribucion de puntajes
              </p>
              <ScoreDistribution />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Vista rapida — click para detalle
              </p>
              <PillarsMiniList onSelect={handleSelect} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── ECONOMIC INDICATORS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Peru en numeros
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {peruEconomicIndicators.slice(0, 8).map((indicator) => (
                <IndicatorBar key={indicator.name} indicator={indicator} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── PILLAR CARDS GRID ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Los {summary.total} pilares que Peru necesita
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {developmentPillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* ─── BENCHMARK COUNTRIES ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="h-4 w-4 text-emerald" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Paises referentes — de donde salen las lecciones
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {benchmarkCountries.map((country, i) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded-xl border border-border p-3 hover:border-emerald/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{country.country}</h3>
                    <Badge variant="outline" className="text-[9px] font-mono border-emerald/20 text-emerald px-1.5">
                      USD {country.gdpPerCapita.toLocaleString()}/cap
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    {country.region} · {country.yearsOfTransformation}
                  </p>
                  <div className="space-y-1">
                    {country.keyReforms.slice(0, 3).map((reform, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald flex-shrink-0" />
                        {reform}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── FRAMEWORKS & SOURCES ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Frameworks y fuentes
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {internationalFrameworks.map((fw) => (
                <a
                  key={fw.id}
                  href={fw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 rounded-xl border border-border p-3 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                      {fw.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{fw.organization}</p>
                    <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">
                      {fw.lastUpdated}
                    </p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── FOOTER DISCLAIMER ─── */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          Analisis basado en datos publicos de organismos internacionales verificados. Los rankings y scores reflejan mediciones externas al Peru. Las propuestas de candidatos se extraen de sus planes de gobierno publicados oficialmente. CONDOR no tiene afiliacion politica.
        </p>
        <p className="text-[9px] text-muted-foreground/40 font-mono mt-2">
          WEF · Banco Mundial · PNUD · OCDE · WJP · Transparency International · IMD · PISA
        </p>
      </div>

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {selected && (
          <PillarDetailModal pillar={selected} onClose={handleClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
