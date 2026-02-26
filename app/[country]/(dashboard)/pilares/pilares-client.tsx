"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { useCountry } from "@/lib/config/country-context";
import {
  getCountryPillars,
  getCountryEconomicIndicators,
  getCountryBenchmarks,
  internationalFrameworks,
  getPillarScoreColor,
  getPillarScoreLabel,
  type DevelopmentPillar,
} from "@/lib/data/pilares/index";
import { type Candidate, type Category } from "@/lib/data/candidates";

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
const pillarInsightsByCountry: Record<string, Record<string, string>> = {
  pe: {
    institucionalidad: "Varios candidatos hablan de anticorrupción pero ninguno propone reformas estructurales a las instituciones. Hablan de castigo, no de prevención. Nadie menciona fortalecer la independencia judicial ni crear mecanismos de rendición de cuentas real.",
    anticorrupcion: "Fujimori y Álvarez proponen combatir la corrupción pero con enfoques distintos. Álvarez propone muerte civil para corruptos y transparencia total. Fujimori quiere reformar el sistema judicial. Ninguno habla de reformar el sistema de contrataciones del Estado, que es donde nace la corrupción.",
    educacion: "Solo Álvarez, Acuña y Luna hablan de educación. Álvarez propone subir al 6% del PIB. Luna quiere universidad para todos. Acuña apuesta por capacitación laboral. Pero NADIE habla de calidad docente, que según PISA es el factor #1 para mejorar resultados.",
    infraestructura: "López Aliaga propone trenes, Forsyth ciudades modernas, Acuña infraestructura regional. Buenas ideas, pero ninguno habla de la razón por la que los proyectos fracasan: corrupción en licitaciones y falta de capacidad del Estado para ejecutar obras.",
    "transformacion-digital": "Solo Luna menciona tecnología directamente (internet rural). Forsyth habla de 'Perú digital' y videovigilancia. Es uno de los pilares más desatendidos a pesar de que Estonia demostró que digitalizar el Estado reduce corrupción y burocracia de golpe.",
    "diversificacion-economica": "López Aliaga quiere bajar impuestos, Fujimori habla de estabilidad, López-Chau propone economía inclusiva, Acuña apoya emprendedores. Enfoques variados. Pero ninguno tiene un plan claro para formalizar al 71% de trabajadores informales.",
    salud: "Solo Álvarez tiene una propuesta específica de salud (ampliar SIS y construir hospitales). López-Chau también propone reforma de salud. Los demás lo ignoran. Es preocupante porque 7 de cada 10 peruanos no reciben atención cuando la necesitan.",
    "inclusion-social": "Ningún candidato habla directamente de reducir desigualdad o pobreza. Fujimori menciona 'programas sociales focalizados' y Luna propone empleo joven. Pero nadie tiene un plan para el 36% que vive en pobreza ni para la brecha entre Lima y provincias.",
    "capacidad-fiscal": "López Aliaga quiere BAJAR impuestos — exactamente lo opuesto a lo que Perú necesita según los expertos. Nadie propone una reforma tributaria seria ni un plan para formalizar la economía. Sin recaudar más, todo lo demás es promesa vacía.",
    "justicia-seguridad": "Este es el pilar favorito de los políticos: todos hablan de seguridad. López Aliaga y Fujimori quieren mano dura con FF.AA. en las calles, Forsyth quiere tecnología. Pero ninguno habla de reformar el sistema judicial, que es la raíz del problema.",
  },
  co: {
    institucionalidad: "Colombia tiene una Constitución moderna (1991) y organismos de control, pero la presencia del Estado en muchas regiones sigue siendo débil. El Acuerdo de Paz prometió llevar el Estado a las zonas de conflicto — la implementación va lenta. Sin instituciones en todo el territorio, nada más funciona.",
    anticorrupcion: "Odebrecht, las regalías mal invertidas, los elefantes blancos... la corrupción en Colombia es sistemática. Los organismos de control existen pero los procesos son lentos y la impunidad alta. Ningún candidato propone reformar el sistema de contratación pública de raíz.",
    educacion: "Los jóvenes colombianos salen del colegio 89 puntos por debajo del promedio OCDE en matemáticas. La brecha entre un colegio privado de Bogotá y una escuela rural del Chocó es abismal. Ser Pilo Paga y Generación E fueron esfuerzos, pero sin calidad docente no hay resultado.",
    infraestructura: "Las vías 4G llevan años de retraso y sobrecostos. En el Pacífico no hay agua potable. La geografía es retadora pero la corrupción en licitaciones empeora todo. Chile logró la mejor logística de América Latina — Colombia puede hacerlo también.",
    "transformacion-digital": "Colombia avanzó con GOV.CO y el MinTIC, pero en municipios rurales el papel sigue mandando. La brecha digital entre Bogotá/Medellín y el campo es enorme. Estonia digitalizó el 100% de sus servicios — Colombia debería seguir ese camino.",
    "diversificacion-economica": "~30% de las exportaciones son petróleo y carbón. Si baja el precio del crudo, se cae la balanza comercial. 6 de cada 10 colombianos trabajan en la informalidad. La transición energética agrega urgencia: hay que diversificar antes de que el petróleo deje de ser negocio.",
    salud: "El 97% está afiliado pero las EPS están en crisis: deudas billonarias, pacientes muriendo en filas, tutelas como única vía de acceso. La Ley 100 fue visionaria pero su implementación falló. La reforma de salud del gobierno Petro genera debate, pero el sistema necesita cambios profundos.",
    "inclusion-social": "Con un Gini de 51.5, Colombia es de los países más desiguales del mundo. 8 millones de desplazados, un tercio en pobreza, y brechas territoriales inmensas. Si naciste en el Chocó, tus oportunidades son radicalmente menores que si naciste en Bogotá.",
    "capacidad-fiscal": "Colombia recauda 19.4% del PIB — mejor que Perú pero debajo del promedio regional. La reforma tributaria de 2022 buscó mejorar pero los resultados son mixtos. La informalidad del 58% y la dependencia petrolera limitan los ingresos del Estado.",
    "justicia-seguridad": "50+ años de conflicto armado, 9 millones de víctimas, y grupos armados que persisten. La JEP es innovadora pero enfrenta resistencias. Los líderes sociales siguen siendo asesinados. La inseguridad urbana es la preocupación diaria de los colombianos.",
  },
};

// ─── HELPERS ───

function getCandidateProposals(pillarId: string, candidates: Candidate[]) {
  const categories = pillarToCategoryMap[pillarId] || [];
  return candidates
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .map((c) => {
      const relevantProposals = c.keyProposals.filter((p) => categories.includes(p.category));
      if (relevantProposals.length === 0) return null;
      return { candidate: c, proposals: relevantProposals };
    })
    .filter(Boolean) as { candidate: Candidate; proposals: Candidate["keyProposals"] }[];
}

function getCandidatesWithoutProposals(pillarId: string, candidates: Candidate[]) {
  const categories = pillarToCategoryMap[pillarId] || [];
  return candidates
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .filter((c) => !c.keyProposals.some((p) => categories.includes(p.category)));
}

// How many pillars does each candidate cover?
function getCandidateCoverage(candidates: Candidate[], pillars: DevelopmentPillar[]) {
  return candidates
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .map((c) => {
      const coveredPillars = pillars.filter((p) => {
        const categories = pillarToCategoryMap[p.id] || [];
        return c.keyProposals.some((prop) => categories.includes(prop.category));
      });
      return {
        candidate: c,
        covered: coveredPillars.length,
        total: pillars.length,
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

function PillarCard({ pillar, index, onSelect, candidates }: { pillar: DevelopmentPillar; index: number; onSelect: (p: DevelopmentPillar) => void; candidates: Candidate[] }) {
  const Icon = iconMap[pillar.icon] || Target;
  const colorKey = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const label = getPillarScoreLabel(pillar.peruStatus.score);
  const proposals = getCandidateProposals(pillar.id, candidates);
  const noProposals = getCandidatesWithoutProposals(pillar.id, candidates);

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
                      <span>Ningún candidato habla de esto</span>
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

function PillarDetailModal({ pillar, onClose, candidates, insights }: { pillar: DevelopmentPillar; onClose: () => void; candidates: Candidate[]; insights: Record<string, string> }) {
  const Icon = iconMap[pillar.icon] || Target;
  const colorKey = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColors[colorKey] || scoreColors.amber;
  const label = getPillarScoreLabel(pillar.peruStatus.score);
  const candidateProposals = getCandidateProposals(pillar.id, candidates);
  const candidatesWithout = getCandidatesWithoutProposals(pillar.id, candidates);
  const insight = insights[pillar.id] || "";

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
                  Análisis CONDOR
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
              {candidateProposals.length > 0 ? "Qué proponen los candidatos" : "Ningún candidato tiene propuestas para este pilar"}
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
                  Ningún candidato principal tiene propuestas específicas para este pilar. Un vacío preocupante.
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
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Por qué importa</p>
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
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Dónde estamos fallando</p>
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
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Cómo nos ve el mundo</p>
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
              <span className="text-xs font-bold text-foreground">Quién lo hizo bien: {pillar.benchmark.country}</span>
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

// ─── CANDIDATE COVERAGE ───

/** Pilar short names for chips */
const PILLAR_SHORT: Record<string, string> = {
  institucionalidad: "Instituciones",
  anticorrupcion: "Corrupción",
  educacion: "Educación",
  infraestructura: "Infraestructura",
  "transformacion-digital": "Digital",
  "diversificacion-economica": "Economía",
  salud: "Salud",
  "inclusion-social": "Inclusión",
  "capacidad-fiscal": "Fiscal",
  "justicia-seguridad": "Seguridad",
};

function CandidateCoverageSection({ candidates, pillars }: { candidates: Candidate[]; pillars: DevelopmentPillar[] }) {
  const coverage = getCandidateCoverage(candidates, pillars);
  const sorted = [...coverage].sort((a, b) => b.covered - a.covered);
  const top8 = sorted.slice(0, 8);

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">
            Cobertura de propuestas
          </p>
        </div>
        <p className="text-sm font-bold text-foreground mb-4">
          ¿De cuántos pilares habla cada candidato?
        </p>

        <div className="space-y-3">
          {top8.map(({ candidate, covered, total, pillarIds }, i) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {/* Name + score + bar */}
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: candidate.partyColor }}
                />
                <span className="text-xs font-medium text-foreground w-24 truncate">
                  {candidate.shortName}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(covered / total) * 100}%` }}
                    transition={{ delay: i * 0.04 + 0.2, duration: 0.5, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      covered >= 5 ? "bg-emerald-500" : covered >= 3 ? "bg-primary" : "bg-rose-400",
                    )}
                  />
                </div>
                <span className={cn(
                  "text-sm font-mono font-bold tabular-nums w-8 text-right",
                  covered >= 5 ? "text-emerald-600 dark:text-emerald-400" : covered >= 3 ? "text-foreground" : "text-rose-500 dark:text-rose-400",
                )}>
                  {covered}
                </span>
                <span className="text-[9px] text-muted-foreground/30 font-mono -ml-1">
                  /{total}
                </span>
              </div>

              {/* Pillar chips — what they cover */}
              <div className="ml-[38px] flex flex-wrap gap-1">
                {pillarIds.map((pid) => (
                  <span
                    key={pid}
                    className="text-[9px] rounded-md bg-primary/10 text-primary/70 px-1.5 py-0.5"
                  >
                    {PILLAR_SHORT[pid] || pid}
                  </span>
                ))}
                {covered === 0 && (
                  <span className="text-[9px] text-muted-foreground/30 italic">
                    Sin propuestas específicas
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MAIN CLIENT COMPONENT ───

interface PilaresClientProps {
  candidates: Candidate[];
}

export default function PilaresClient({ candidates }: PilaresClientProps) {
  const { code: countryCode, name: countryName } = useCountry();
  const pillars = getCountryPillars(countryCode);
  const economicIndicators = getCountryEconomicIndicators(countryCode);
  const benchmarks = getCountryBenchmarks(countryCode);
  const pillarInsights = pillarInsightsByCountry[countryCode] || pillarInsightsByCountry.pe;

  const [selected, setSelected] = useState<DevelopmentPillar | null>(null);

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
      {/* ─── HERO ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Qué necesita {countryName} para salir adelante
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          10 cosas que {countryName} debe resolver si quiere crecer como Chile, Corea o Singapur. Y qué propone cada candidato al respecto.
        </p>
      </motion.div>

      {/* ─── DISCLAIMER ─── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span>Datos de Foro Económico Mundial, Banco Mundial, ONU, OCDE y 4 fuentes más. Propuestas de planes de gobierno oficiales.</span>
      </motion.div>

      {/* ─── ECONOMIC INDICATORS ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">{countryName} en números — cómo estamos vs el mundo</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {economicIndicators.slice(0, 8).map((indicator) => (
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

      {/* ─── CANDIDATO COVERAGE ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <CandidateCoverageSection candidates={candidates} pillars={pillars} />
      </motion.div>

      {/* ─── PILLAR CARDS ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Los 10 pilares — toca cada uno para ver qué proponen los candidatos</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {pillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} onSelect={handleSelect} candidates={candidates} />
          ))}
        </div>
      </div>

      <WhatsAppCTA context="pilares" />

      {/* ─── BENCHMARK COUNTRIES ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="h-4 w-4 text-emerald" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estos países lo lograron — {countryName} también puede</p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Países que estaban en situaciones similares a {countryName} y salieron adelante. ¿Qué hicieron diferente?</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {benchmarks.map((country, i) => (
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
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">De dónde sacamos los datos</p>
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
          Todo lo que ves aquí viene de organismos internacionales (no lo inventamos). Las propuestas salen de los planes de gobierno oficiales. CONDOR no tiene afiliación política — analizamos a todos por igual.
        </p>
        <p className="text-[9px] text-muted-foreground/40 font-mono mt-2">
          WEF · Banco Mundial · PNUD · OCDE · WJP · Transparency International · IMD · PISA
        </p>
      </div>

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {selected && <PillarDetailModal pillar={selected} onClose={handleClose} candidates={candidates} insights={pillarInsights} />}
      </AnimatePresence>
    </div>
  );
}
