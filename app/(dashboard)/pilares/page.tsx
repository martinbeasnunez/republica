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
  Brain,
  UserX,
  Check,
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

// CONDOR AI insights per pillar — what's the real story?
const pillarInsights: Record<string, string> = {
  institucionalidad: "4 candidatos hablan de anticorrupcion pero ninguno propone reformas estructurales a las instituciones. Hablan de castigo, no de prevencion. Nadie menciona fortalecer la independencia judicial ni crear mecanismos de rendicion de cuentas real.",
  anticorrupcion: "Fujimori, Alvarez, Humala y Urresti proponen combatir la corrupcion — pero con enfoques opuestos. Alvarez propone muerte civil para corruptos y transparencia total. Humala va mas lejos: pena de muerte. Ninguno habla de reformar el sistema de contrataciones del Estado, que es donde nace la corrupcion.",
  educacion: "Solo Alvarez, De la Torre y Luna hablan de educacion. Alvarez propone subir al 6% del PIB. Luna quiere universidad para todos. De la Torre apuesta por educacion tecnica. Pero NADIE habla de calidad docente, que segun PISA es el factor #1 para mejorar resultados.",
  infraestructura: "Lopez Aliaga propone trenes, Forsyth ciudades modernas, De la Torre conectividad nacional. Buenas ideas, pero ninguno habla de la razon por la que los proyectos fracasan: corrupcion en licitaciones y falta de capacidad del Estado para ejecutar obras.",
  "transformacion-digital": "Solo Luna menciona tecnologia directamente (internet rural). Forsyth habla de 'Peru digital' y videovigilancia. Es uno de los pilares mas desatendidos a pesar de que Estonia demostro que digitalizar el Estado reduce corrupcion y burocracia de golpe.",
  "diversificacion-economica": "Lopez Aliaga quiere bajar impuestos, Fujimori habla de estabilidad, Humala quiere nacionalizar recursos, De la Torre apuesta por el agro. Enfoques totalmente opuestos. Pero ninguno tiene un plan claro para formalizar al 71% de trabajadores informales.",
  salud: "Solo Alvarez tiene una propuesta especifica de salud (ampliar SIS y construir hospitales). Los demas lo ignoran. Es preocupante porque 7 de cada 10 peruanos no reciben atencion cuando la necesitan. Es el pilar mas abandonado por los candidatos.",
  "inclusion-social": "Ningun candidato habla directamente de reducir desigualdad o pobreza. Fujimori menciona 'programas sociales focalizados' y Luna propone empleo joven. Pero nadie tiene un plan para el 36% que vive en pobreza ni para la brecha entre Lima y provincias.",
  "capacidad-fiscal": "Lopez Aliaga quiere BAJAR impuestos — exactamente lo opuesto a lo que Peru necesita segun los expertos. Nadie propone una reforma tributaria seria ni un plan para formalizar la economia. Sin recaudar mas, todo lo demas es promesa vacia.",
  "justicia-seguridad": "Este es el pilar favorito de los politicos: 6 propuestas de seguridad entre todos. Lopez Aliaga y Humala quieren mano dura, Forsyth quiere tecnologia, Urresti quiere reformar la policia. Pero ninguno habla de reformar el sistema judicial, que es la raiz del problema.",
};

// ─── HELPERS ───

function getCandidateProposals(pillarId: string) {
  const categories = pillarToCategoryMap[pillarId] || [];
  return candidates
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .map((c) => {
      const relevantProposals = c.keyProposals.filter((p) => categories.includes(p.category));
      if (relevantProposals.length === 0) return null;
      return { candidate: c, proposals: relevantProposals };
    })
    .filter(Boolean) as { candidate: (typeof candidates)[0]; proposals: (typeof candidates)[0]["keyProposals"] }[];
}

function getCandidatesWithoutProposals(pillarId: string) {
  const categories = pillarToCategoryMap[pillarId] || [];
  return candidates
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .filter((c) => !c.keyProposals.some((p) => categories.includes(p.category)));
}

// How many pillars does each candidate cover?
function getCandidateCoverage() {
  return candidates
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .map((c) => {
      const coveredPillars = developmentPillars.filter((p) => {
        const categories = pillarToCategoryMap[p.id] || [];
        return c.keyProposals.some((prop) => categories.includes(prop.category));
      });
      return {
        candidate: c,
        covered: coveredPillars.length,
        total: developmentPillars.length,
        pillarIds: coveredPillars.map((p) => p.id),
      };
    });
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={colors.ring} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-xs font-mono font-bold", colors.text)}>{value}</span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "empeorando") return <ArrowDownRight className="h-3 w-3 text-rose" />;
  if (trend === "mejorando") return <ArrowUpRight className="h-3 w-3 text-emerald" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

// ─── PILLAR CARD ───

function PillarCard({ pillar, index, onSelect }: { pillar: DevelopmentPillar; index: number; onSelect: (p: DevelopmentPillar) => void }) {
  const Icon = iconMap[pillar.icon] || Target;
  const colorKey = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const label = getPillarScoreLabel(pillar.peruStatus.score);
  const proposals = getCandidateProposals(pillar.id);
  const noProposals = getCandidatesWithoutProposals(pillar.id);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.4 }}>
      <button onClick={() => onSelect(pillar)} className="w-full text-left group">
        <Card className={cn("relative overflow-hidden border-border transition-all duration-300 hover:border-primary/30 hover:shadow-lg")}>
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
              <div className="flex-shrink-0">
                <ScoreGauge score={pillar.peruStatus.score} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-mono text-muted-foreground/50">{String(pillar.number).padStart(2, "0")}</span>
                  <Icon className={cn("h-3.5 w-3.5", colors.text)} />
                  <Badge variant="outline" className={cn("text-[8px] font-mono px-1.5 py-0", colors.text, `border-${colorKey}/30`)}>
                    {label.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {pillar.name}
                </h3>

                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {pillar.shortDescription}
                </p>

                {/* Candidate coverage mini */}
                <div className="mt-2.5 flex items-center gap-2">
                  {proposals.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        {proposals.slice(0, 4).map(({ candidate }) => (
                          <div
                            key={candidate.id}
                            className="h-4 w-4 rounded-full border border-card"
                            style={{ backgroundColor: candidate.partyColor }}
                            title={candidate.shortName}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-muted-foreground ml-1">
                        {proposals.length} {proposals.length === 1 ? "candidato" : "candidatos"} hablan de esto
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] text-rose/70">
                      <UserX className="h-3 w-3" />
                      <span>Ningun candidato habla de esto</span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.div>
  );
}

// ─── DETAIL MODAL ───

function PillarDetailModal({ pillar, onClose }: { pillar: DevelopmentPillar; onClose: () => void }) {
  const Icon = iconMap[pillar.icon] || Target;
  const colorKey = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const label = getPillarScoreLabel(pillar.peruStatus.score);
  const candidateProposals = getCandidateProposals(pillar.id);
  const candidatesWithout = getCandidatesWithoutProposals(pillar.id);
  const insight = pillarInsights[pillar.id] || "";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-8 sm:pt-16"
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
        <div className={cn(
          "h-1 w-full rounded-t-2xl",
          colorKey === "rose" && "bg-gradient-to-r from-rose via-rose/60 to-transparent",
          colorKey === "amber" && "bg-gradient-to-r from-amber via-amber/60 to-transparent",
          colorKey === "sky" && "bg-gradient-to-r from-sky via-sky/60 to-transparent",
          colorKey === "emerald" && "bg-gradient-to-r from-emerald via-emerald/60 to-transparent",
          colorKey === "green" && "bg-gradient-to-r from-green via-green/60 to-transparent",
        )} />

        <button onClick={onClose} className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <ScoreGauge score={pillar.peruStatus.score} size={72} strokeWidth={5} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-muted-foreground/50">PILAR {String(pillar.number).padStart(2, "0")}</span>
                <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5", colors.text, `border-${colorKey}/30`)}>{label.toUpperCase()}</Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight flex items-center gap-2">
                <Icon className={cn("h-5 w-5 flex-shrink-0", colors.text)} />
                {pillar.name}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">{pillar.peruStatus.summary}</p>
            </div>
          </div>

          {/* CONDOR INSIGHT — the star of the show */}
          {insight && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">
                  Analisis CONDOR
                </p>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {insight}
              </p>
            </div>
          )}

          {/* Candidate proposals — FRONT AND CENTER */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              {candidateProposals.length > 0 ? "Que proponen los candidatos" : "Ningun candidato tiene propuestas para este pilar"}
            </p>

            {candidateProposals.length > 0 ? (
              <div className="grid gap-2">
                {candidateProposals.map(({ candidate, proposals }) => (
                  <div key={candidate.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.partyColor }} />
                      <span className="text-xs font-bold text-foreground">{candidate.shortName}</span>
                      <span className="text-[10px] text-muted-foreground">{candidate.party}</span>
                      <Badge variant="secondary" className="text-[8px] ml-auto font-mono">{candidate.pollAverage}%</Badge>
                    </div>
                    {proposals.map((p, i) => (
                      <div key={i} className="ml-5 mt-1.5">
                        <p className="text-[11px] text-foreground font-medium">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{p.summary}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-rose/20 bg-rose/5 p-3 text-center">
                <UserX className="h-5 w-5 text-rose/50 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  Ningun candidato principal tiene propuestas especificas para este pilar. Un vacio preocupante.
                </p>
              </div>
            )}

            {/* Who doesn't talk about this */}
            {candidatesWithout.length > 0 && candidateProposals.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-muted-foreground/50">No hablan de esto:</span>
                {candidatesWithout.slice(0, 5).map((c) => (
                  <span key={c.id} className="text-[9px] text-muted-foreground/40">{c.shortName}</span>
                ))}
              </div>
            )}
          </div>

          {/* Why it matters */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Por que importa</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{pillar.whyItMatters}</p>
          </div>

          {/* Data points */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">La realidad en datos</p>
            <div className="grid gap-1.5">
              {pillar.dataPoints.map((dp, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", colors.bg.replace("/10", ""))} />
                  <span className="leading-relaxed">{dp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Problems */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Donde estamos fallando</p>
            <div className="grid gap-1.5">
              {pillar.peruStatus.keyProblems.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5 text-rose/60" />
                  <span className="leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings */}
          {pillar.peruStatus.rankings.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Como nos ve el mundo</p>
              <div className="grid gap-2">
                {pillar.peruStatus.rankings.map((r, i) => (
                  <a key={i} href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{r.indexName} ({r.year})</p>
                      <p className="text-[10px] text-muted-foreground">{r.organization}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{r.notes}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {r.rank && <p className="text-sm font-mono font-bold text-foreground">#{r.rank}<span className="text-muted-foreground font-normal text-xs">/{r.totalCountries}</span></p>}
                      {r.score !== null && <p className="text-sm font-mono font-bold text-foreground">{r.score}<span className="text-muted-foreground font-normal text-xs">/{r.maxScore}</span></p>}
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

          {/* Benchmark */}
          <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-emerald" />
              <span className="text-xs font-bold text-foreground">Quien lo hizo bien: {pillar.benchmark.country}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{pillar.benchmark.description}</p>
            <Badge variant="outline" className="text-[9px] border-emerald/30 text-emerald px-1.5 mt-2">{pillar.benchmark.keyMetric}</Badge>
          </div>

          {/* Framework links */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
            {pillar.frameworks.map((fId) => {
              const fw = internationalFrameworks.find((f) => f.id === fId);
              return fw ? (
                <a key={fId} href={fw.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] rounded-lg border border-border px-2 py-1 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                  <ExternalLink className="h-2.5 w-2.5" />{fw.organization}
                </a>
              ) : null;
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CANDIDATE COVERAGE CHART ───

function CandidateCoverageSection() {
  const coverage = getCandidateCoverage();

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">
            Insight CONDOR
          </p>
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          Quien habla de que — y quien no habla de nada
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          La mayoria de candidatos solo toca 2-3 pilares de los 10. Los temas de seguridad y economia dominan. Salud, inclusion social y capacidad fiscal estan casi huerfanos.
        </p>

        <div className="space-y-3">
          {coverage.map(({ candidate, covered, total, pillarIds }) => (
            <div key={candidate.id} className="group">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.partyColor }} />
                <span className="text-xs font-medium text-foreground w-28 truncate">{candidate.shortName}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{covered}/{total}</span>
                <div className="flex-1" />
                <Badge variant={covered >= 4 ? "secondary" : "outline"} className={cn("text-[8px] font-mono", covered <= 2 && "text-rose/70 border-rose/30", covered >= 4 && "text-emerald")}>
                  {covered <= 2 ? "BAJO" : covered <= 3 ? "MEDIO" : "ALTO"}
                </Badge>
              </div>

              {/* Pillar coverage bar */}
              <div className="flex gap-0.5 ml-6">
                {developmentPillars.map((p) => {
                  const isActive = pillarIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "h-2 flex-1 rounded-sm transition-colors",
                        isActive ? "bg-primary" : "bg-muted/30",
                      )}
                      title={`${p.name}: ${isActive ? "Tiene propuesta" : "Sin propuesta"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-3 gap-y-1">
          {developmentPillars.map((p, i) => (
            <span key={p.id} className="text-[8px] text-muted-foreground/40 font-mono">
              {i + 1}. {p.name.split(" ").slice(0, 2).join(" ")}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── RADAR CHART ───

function PillarRadarChart() {
  const option = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: { trigger: "item" as const, backgroundColor: "#14131e", borderColor: "#1e1c2e", textStyle: { color: "#f1f5f9", fontSize: 11 } },
    radar: {
      indicator: developmentPillars.map((p) => ({ name: p.name.length > 20 ? p.name.slice(0, 18) + "..." : p.name, max: 100 })),
      shape: "polygon" as const,
      splitNumber: 4,
      axisName: { color: "#94a3b8", fontSize: 9, fontFamily: "Inter, sans-serif" },
      splitLine: { lineStyle: { color: "#1e1c2e" } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "#1e1c2e" } },
    },
    series: [{ type: "radar" as const, data: [{ value: developmentPillars.map((p) => scoreNumeric[p.peruStatus.score] || 40), name: "Peru", lineStyle: { color: "#8B1A1A", width: 2 }, itemStyle: { color: "#8B1A1A" }, areaStyle: { color: "rgba(139, 26, 26, 0.15)" }, symbol: "circle", symbolSize: 6 }] }],
  }), []);

  return <div className="w-full h-[300px] sm:h-[360px]"><ReactECharts option={option} style={{ height: "100%", width: "100%" }} /></div>;
}

// ─── SCORE DISTRIBUTION ───

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
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/30">
        {segments.map((s, i) => (
          <motion.div key={s.label} initial={{ width: 0 }} animate={{ width: `${(s.count / total) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }} className={cn("h-full", s.color, i === 0 && "rounded-l-full", i === segments.length - 1 && "rounded-r-full")} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", s.color)} />
            <span className="text-[10px] text-muted-foreground">{s.label}: <span className={cn("font-mono font-bold", s.textColor)}>{s.count}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MINI LIST ───

function PillarsMiniList({ onSelect }: { onSelect: (p: DevelopmentPillar) => void }) {
  return (
    <div className="grid gap-1">
      {developmentPillars.map((p) => {
        const colorKey = getPillarScoreColor(p.peruStatus.score);
        const colors = scoreColors[colorKey];
        const value = scoreNumeric[p.peruStatus.score];
        const proposals = getCandidateProposals(p.id);
        return (
          <button key={p.id} onClick={() => onSelect(p)} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors group text-left">
            <span className="text-[10px] font-mono text-muted-foreground/40 w-4">{String(p.number).padStart(2, "0")}</span>
            <span className="text-xs text-foreground group-hover:text-primary transition-colors flex-1 truncate">{p.name}</span>
            <div className="w-14 h-1.5 rounded-full bg-muted/30 overflow-hidden flex-shrink-0">
              <div className={cn("h-full rounded-full", colors.bg.replace("/10", ""))} style={{ width: `${value}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground/40 w-12 text-right">
              {proposals.length > 0 ? `${proposals.length} cand.` : <span className="text-rose/50">nadie</span>}
            </span>
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
          // CONDOR — QUE NECESITA PERU PARA CRECER — DIAGNOSTICO CON IA //
        </div>
      </motion.div>

      {/* ─── HERO ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Que necesita Peru para salir adelante
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          10 cosas que Peru debe resolver si quiere crecer como Chile, Corea o Singapur. Y que propone cada candidato al respecto.
        </p>
      </motion.div>

      {/* ─── DISCLAIMER ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Basado en datos reales, no en opinion</p>
          <p className="text-xs text-muted-foreground mt-1">
            Usamos datos del Foro Economico Mundial, Banco Mundial, Naciones Unidas, OCDE y otras 4 fuentes internacionales. Los puntajes son mediciones externas — no los inventamos nosotros. Las propuestas salen de los planes de gobierno oficiales. CONDOR no tiene afiliacion politica.
          </p>
        </div>
      </motion.div>

      {/* ─── CANDIDATO COVERAGE — THE KILLER INSIGHT ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <CandidateCoverageSection />
      </motion.div>

      {/* ─── RADAR + DISTRIBUTION ─── */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">En que estamos bien y en que estamos mal</p>
              <PillarRadarChart />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Resumen: como estamos</p>
              <ScoreDistribution />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Los 10 pilares — click para ver detalle y candidatos</p>
              <PillarsMiniList onSelect={handleSelect} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── ECONOMIC INDICATORS ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Peru en numeros — como estamos vs el mundo</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {peruEconomicIndicators.slice(0, 8).map((indicator) => (
                <a key={indicator.name} href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">{indicator.name}</p>
                    <p className="text-sm font-mono font-bold text-foreground mt-0.5 tabular-nums">{indicator.value}</p>
                  </div>
                  <div className="text-right flex-shrink-0 max-w-[180px]">
                    <p className="text-[9px] text-muted-foreground/60 leading-tight text-right line-clamp-2">{indicator.comparison}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/20 group-hover:text-primary flex-shrink-0" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── PILLAR CARDS ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Los 10 pilares — toca cada uno para ver que proponen los candidatos</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {developmentPillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* ─── BENCHMARK COUNTRIES ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="h-4 w-4 text-emerald" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estos paises lo lograron — Peru tambien puede</p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Paises que estaban en situaciones similares a Peru y salieron adelante. Que hicieron diferente?</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {benchmarkCountries.map((country, i) => (
                <motion.div key={country.country} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="rounded-xl border border-border p-3 hover:border-emerald/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{country.country}</h3>
                    <Badge variant="outline" className="text-[9px] font-mono border-emerald/20 text-emerald px-1.5">USD {country.gdpPerCapita.toLocaleString()}/cap</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{country.region} · {country.yearsOfTransformation}</p>
                  <div className="space-y-1">
                    {country.keyReforms.slice(0, 3).map((reform, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <Check className="h-3 w-3 text-emerald flex-shrink-0 mt-0.5" />{reform}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── SOURCES ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">De donde sacamos los datos</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {internationalFrameworks.map((fw) => (
                <a key={fw.id} href={fw.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 rounded-xl border border-border p-3 hover:border-primary/30 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">{fw.name}</p>
                    <p className="text-[10px] text-muted-foreground">{fw.organization}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── FOOTER ─── */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          Todo lo que ves aqui viene de organismos internacionales (no lo inventamos). Las propuestas salen de los planes de gobierno oficiales. CONDOR no tiene afiliacion politica — analizamos a todos por igual.
        </p>
        <p className="text-[9px] text-muted-foreground/40 font-mono mt-2">
          WEF · Banco Mundial · PNUD · OCDE · WJP · Transparency International · IMD · PISA
        </p>
      </div>

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {selected && <PillarDetailModal pillar={selected} onClose={handleClose} />}
      </AnimatePresence>
    </div>
  );
}
