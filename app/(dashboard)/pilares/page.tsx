"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Target,
  Globe,
  BarChart3,
  Sparkles,
  Info,
  Flag,
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

// Map pillar IDs to candidate proposal categories
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

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
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
};

const scoreColorMap: Record<string, { bg: string; text: string; border: string }> = {
  rose: { bg: "bg-rose/10", text: "text-rose", border: "border-rose/30" },
  amber: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30" },
  sky: { bg: "bg-sky/10", text: "text-sky", border: "border-sky/30" },
  emerald: { bg: "bg-emerald/10", text: "text-emerald", border: "border-emerald/30" },
  green: { bg: "bg-green/10", text: "text-green", border: "border-green/30" },
};

function getCandidateProposals(pillarId: string) {
  const categories = pillarToCategoryMap[pillarId] || [];
  const topCandidates = [...candidates].sort((a, b) => b.pollAverage - a.pollAverage).slice(0, 5);

  return topCandidates
    .map((c) => {
      const relevantProposals = c.keyProposals.filter((p) =>
        categories.includes(p.category)
      );
      if (relevantProposals.length === 0) return null;
      return {
        candidate: c,
        proposals: relevantProposals,
      };
    })
    .filter(Boolean) as { candidate: (typeof candidates)[0]; proposals: (typeof candidates)[0]["keyProposals"] }[];
}

// ─── PILLAR CARD ───
function PillarCard({ pillar, index }: { pillar: DevelopmentPillar; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[pillar.icon] || Target;
  const scoreColor = getPillarScoreColor(pillar.peruStatus.score);
  const colors = scoreColorMap[scoreColor] || scoreColorMap.amber;
  const scoreLabel = getPillarScoreLabel(pillar.peruStatus.score);
  const candidateProposals = getCandidateProposals(pillar.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className={cn("border-border overflow-hidden transition-all", expanded && "ring-1 ring-primary/20")}>
        {/* Color strip */}
        <div className={cn("h-1 w-full", colors.bg.replace("/10", ""))} />

        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left"
          >
            <div className="flex items-start gap-3">
              <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl", colors.bg)}>
                <Icon className={cn("h-5 w-5", colors.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {String(pillar.number).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    {pillar.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {pillar.shortDescription}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={cn("text-[9px] font-mono px-1.5", colors.text, colors.border)}
                >
                  {scoreLabel.toUpperCase()}
                </Badge>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {/* Key problems preview (always visible) */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pillar.peruStatus.keyProblems.slice(0, 2).map((problem, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-[10px] text-muted-foreground"
              >
                <AlertTriangle className={cn("h-3 w-3 flex-shrink-0 mt-0.5", colors.text)} />
                <span className="line-clamp-1">{problem}</span>
              </div>
            ))}
          </div>

          {/* Rankings mini */}
          {pillar.peruStatus.rankings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {pillar.peruStatus.rankings.slice(0, 2).map((r, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  {r.rank && <span>#{r.rank}/{r.totalCountries}</span>}
                  {r.score !== null && <span>{r.score}/{r.maxScore}</span>}
                  <span className={cn(
                    r.trend === "empeorando" ? "text-rose" : r.trend === "mejorando" ? "text-emerald" : "text-muted-foreground"
                  )}>
                    {r.trend === "empeorando" ? "↓" : r.trend === "mejorando" ? "↑" : "→"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* Why it matters */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                      Por que importa
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.whyItMatters}
                    </p>
                  </div>

                  {/* Data points */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                      Datos clave
                    </p>
                    <ul className="space-y-1">
                      {pillar.dataPoints.map((dp, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                          <span className={cn("mt-1.5 h-1 w-1 rounded-full flex-shrink-0", colors.bg.replace("/10", ""))} />
                          {dp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* All problems */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                      Problemas de Peru
                    </p>
                    <ul className="space-y-1">
                      {pillar.peruStatus.keyProblems.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5 text-rose/70" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rankings detail */}
                  {pillar.peruStatus.rankings.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                        Rankings internacionales
                      </p>
                      <div className="space-y-2">
                        {pillar.peruStatus.rankings.map((r, i) => (
                          <a
                            key={i}
                            href={r.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg border border-border p-2.5 hover:border-primary/30 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                                  {r.indexName} ({r.year})
                                </p>
                                <p className="text-[10px] text-muted-foreground">{r.organization}</p>
                              </div>
                              <div className="text-right">
                                {r.rank && (
                                  <p className="text-xs font-mono font-bold text-foreground">
                                    #{r.rank}<span className="text-muted-foreground font-normal">/{r.totalCountries}</span>
                                  </p>
                                )}
                                {r.score !== null && (
                                  <p className="text-xs font-mono font-bold text-foreground">
                                    {r.score}<span className="text-muted-foreground font-normal">/{r.maxScore}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{r.notes}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benchmark */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                      Referente internacional
                    </p>
                    <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Flag className="h-3.5 w-3.5 text-emerald" />
                        <span className="text-xs font-bold text-foreground">{pillar.benchmark.country}</span>
                        <Badge variant="outline" className="text-[9px] border-emerald/30 text-emerald px-1">
                          {pillar.benchmark.keyMetric}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {pillar.benchmark.description}
                      </p>
                    </div>
                  </div>

                  {/* Candidate proposals */}
                  {candidateProposals.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                        Que proponen los candidatos
                      </p>
                      <div className="space-y-2">
                        {candidateProposals.map(({ candidate, proposals }) => (
                          <div
                            key={candidate.id}
                            className="rounded-lg border border-border p-2.5"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: candidate.partyColor }}
                              />
                              <span className="text-[11px] font-medium text-foreground">
                                {candidate.shortName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {candidate.party}
                              </span>
                            </div>
                            {proposals.map((p, i) => (
                              <div key={i} className="ml-4 mt-1">
                                <p className="text-[11px] text-foreground font-medium">{p.title}</p>
                                <p className="text-[10px] text-muted-foreground">{p.summary}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Frameworks */}
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.frameworks.map((fId) => {
                      const fw = internationalFrameworks.find((f) => f.id === fId);
                      return fw ? (
                        <a
                          key={fId}
                          href={fw.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[9px] rounded-md border border-border px-1.5 py-0.5 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {fw.organization}
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── MAIN PAGE ───
export default function PilaresPage() {
  const summary = getPillarsSummary();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Pilares de Desarrollo
            </h1>
            <p className="text-xs text-muted-foreground">
              Lo que Peru necesita para crecer — basado en estandares internacionales
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            Analisis basado en <span className="text-foreground font-medium">{internationalFrameworks.length} frameworks internacionales</span> (WEF, Banco Mundial, PNUD, OCDE, WJP, Transparency International) y {benchmarkCountries.length} paises referentes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose" />
            <span className="text-[11px] text-muted-foreground">
              Critico: <span className="font-mono font-bold text-rose">{summary.byScore.critico}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="text-[11px] text-muted-foreground">
              Deficiente: <span className="font-mono font-bold text-amber">{summary.byScore.deficiente}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky" />
            <span className="text-[11px] text-muted-foreground">
              En progreso: <span className="font-mono font-bold text-sky">{summary.byScore.en_progreso}</span>
            </span>
          </div>
          {summary.byScore.aceptable > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald" />
              <span className="text-[11px] text-muted-foreground">
                Aceptable: <span className="font-mono font-bold text-emerald">{summary.byScore.aceptable}</span>
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Economic indicators strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              Peru en numeros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {peruEconomicIndicators.slice(0, 8).map((indicator) => (
                <a
                  key={indicator.name}
                  href={indicator.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border p-2.5 hover:border-primary/30 transition-colors group"
                >
                  <p className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                    {indicator.name}
                  </p>
                  <p className="text-sm font-mono font-bold text-foreground mt-0.5">
                    {indicator.value}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5 line-clamp-2">
                    {indicator.comparison}
                  </p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pillar cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Los 10 pilares que Peru necesita
          </h2>
        </div>
        <div className="grid gap-4">
          {developmentPillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} />
          ))}
        </div>
      </div>

      {/* Benchmark countries */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flag className="h-3.5 w-3.5" />
              Paises referentes — de donde salen las lecciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {benchmarkCountries.map((country) => (
                <div
                  key={country.country}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{country.country}</h3>
                    <Badge variant="secondary" className="text-[9px] font-mono">
                      USD {country.gdpPerCapita.toLocaleString()}/cap
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    {country.region} · {country.yearsOfTransformation}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                    {country.relevance.slice(0, 150)}...
                  </p>
                  <div className="space-y-1">
                    {country.keyReforms.slice(0, 3).map((reform, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald flex-shrink-0" />
                        {reform}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Frameworks/Sources */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Frameworks y fuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {internationalFrameworks.map((fw) => (
                <a
                  key={fw.id}
                  href={fw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border p-3 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                        {fw.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{fw.organization}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-2">
                    {fw.description.slice(0, 120)}...
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 mt-1 font-mono">
                    Actualizado: {fw.lastUpdated}
                  </p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          Este analisis usa datos publicos de organismos internacionales verificados. Los rankings y scores
          reflejan mediciones externas al Peru. Las propuestas de candidatos se extraen de sus planes de gobierno
          publicados oficialmente. CONDOR no tiene afiliacion politica.
        </p>
        <p className="text-[9px] text-muted-foreground/50 font-mono mt-2">
          Fuentes: WEF · Banco Mundial · PNUD · OCDE · WJP · Transparency International · IMD · PISA
        </p>
      </div>
    </div>
  );
}
