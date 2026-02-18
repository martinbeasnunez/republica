"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Shield,
  TrendingUp,
  Heart,
  GraduationCap,
  Leaf,
  Scale,
  Building2,
  Cpu,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  candidates,
  CATEGORIES_LABELS,
  IDEOLOGY_LABELS,
  type Candidate,
  type Category,
} from "@/lib/data/candidates";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Category, typeof Shield> = {
  economia: TrendingUp,
  seguridad: Shield,
  salud: Heart,
  educacion: GraduationCap,
  "medio-ambiente": Leaf,
  anticorrupcion: Scale,
  infraestructura: Building2,
  tecnologia: Cpu,
};

const ALL_CATEGORIES: Category[] = [
  "economia",
  "seguridad",
  "salud",
  "educacion",
  "medio-ambiente",
  "anticorrupcion",
  "infraestructura",
  "tecnologia",
];

// ─── INSIGHTS ENGINE (static, no AI hallucination) ───

interface CategoryInsight {
  category: Category;
  pattern: string;
  detail: string;
  type: "convergence" | "divergence" | "gap" | "highlight";
}

function generateInsights(selected: Candidate[]): CategoryInsight[] {
  if (selected.length < 2) return [];

  const insights: CategoryInsight[] = [];

  ALL_CATEGORIES.forEach((cat) => {
    const candidatesWithProposal = selected.filter((c) =>
      c.keyProposals.some((p) => p.category === cat)
    );
    const candidatesWithout = selected.filter(
      (c) => !c.keyProposals.some((p) => p.category === cat)
    );

    // Gap: some candidates don't address this category
    if (candidatesWithout.length > 0 && candidatesWithProposal.length > 0) {
      insights.push({
        category: cat,
        pattern: `${candidatesWithout.map((c) => c.shortName).join(", ")} no ${candidatesWithout.length === 1 ? "presenta" : "presentan"} propuestas en ${CATEGORIES_LABELS[cat].es}`,
        detail: `Solo ${candidatesWithProposal.map((c) => c.shortName).join(", ")} ${candidatesWithProposal.length === 1 ? "aborda" : "abordan"} este tema`,
        type: "gap",
      });
    }

    // All address this category
    if (candidatesWithProposal.length === selected.length && selected.length >= 2) {
      insights.push({
        category: cat,
        pattern: `Todos los candidatos seleccionados proponen sobre ${CATEGORIES_LABELS[cat].es}`,
        detail: "Compara las propuestas especificas abajo para ver diferencias de enfoque",
        type: "convergence",
      });
    }
  });

  // Ideology spread
  const ideologies = new Set(selected.map((c) => c.ideology));
  if (ideologies.size === selected.length && selected.length >= 2) {
    insights.push({
      category: "economia",
      pattern: "Amplio espectro ideologico en esta comparacion",
      detail: `Va desde ${selected.map((c) => IDEOLOGY_LABELS[c.ideology].es).join(" hasta ")}. Las propuestas economicas y sociales tendran enfoques muy distintos.`,
      type: "divergence",
    });
  }

  // Coverage analysis
  const coverageCounts = selected.map((c) => ({
    name: c.shortName,
    count: new Set(c.keyProposals.map((p) => p.category)).size,
  }));
  const maxCoverage = coverageCounts.reduce((a, b) => (a.count > b.count ? a : b));
  const minCoverage = coverageCounts.reduce((a, b) => (a.count < b.count ? a : b));
  if (maxCoverage.count !== minCoverage.count) {
    insights.push({
      category: "economia",
      pattern: `${maxCoverage.name} cubre ${maxCoverage.count} temas vs ${minCoverage.name} con ${minCoverage.count}`,
      detail: "Mas temas no significa mejor plan — evalua profundidad y viabilidad de cada propuesta",
      type: "highlight",
    });
  }

  return insights;
}

// ─── MAIN PAGE ───

export default function CompararPlanesPage() {
  const [selected, setSelected] = useState<Candidate[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);

  const addCandidate = (candidate: Candidate) => {
    if (selected.length < 4 && !selected.find((c) => c.id === candidate.id)) {
      setSelected([...selected, candidate]);
    }
    setShowPicker(false);
  };

  const removeCandidate = (id: string) => {
    setSelected(selected.filter((c) => c.id !== id));
  };

  const insights = generateInsights(selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/planes">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Planes
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Comparador de Planes de Gobierno
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Selecciona hasta 4 candidatos para comparar sus propuestas lado a lado por categoria
        </p>
      </motion.div>

      {/* Candidate Selector */}
      <div className="flex flex-wrap gap-3 items-center">
        {selected.map((c) => (
          <motion.div
            key={c.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: c.partyColor }}
              />
              <span className="text-sm font-medium text-foreground">{c.shortName}</span>
              <button
                onClick={() => removeCandidate(c.id)}
                className="text-muted-foreground hover:text-rose transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}

        {selected.length < 4 && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPicker(!showPicker)}
              className="gap-2 border-dashed"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar candidato
            </Button>

            {showPicker && (
              <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[220px] sm:w-72 rounded-xl border border-border bg-card p-2 shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                {candidates
                  .filter((c) => !selected.find((s) => s.id === c.id))
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addCandidate(c)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.partyColor }}
                      />
                      <span className="text-foreground">{c.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {c.party}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                Insights de la comparacion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {insights.slice(0, 6).map((insight, i) => {
                  const Icon =
                    insight.type === "gap"
                      ? AlertTriangle
                      : insight.type === "convergence"
                        ? CheckCircle2
                        : insight.type === "divergence"
                          ? XCircle
                          : Lightbulb;
                  const color =
                    insight.type === "gap"
                      ? "text-amber"
                      : insight.type === "convergence"
                        ? "text-emerald"
                        : insight.type === "divergence"
                          ? "text-rose"
                          : "text-sky";

                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-muted/30 border border-border/50 p-3"
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", color)} />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {insight.pattern}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {insight.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state */}
      {selected.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Selecciona al menos 2 candidatos para comparar sus planes de gobierno
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Datos basados en las propuestas oficiales presentadas al JNE
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparison Matrix */}
      {selected.length >= 2 && (
        <div className="space-y-3">
          {ALL_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat];
            const isExpanded = expandedCategory === cat;
            const proposalsByCandidate = selected.map((c) => ({
              candidate: c,
              proposal: c.keyProposals.find((p) => p.category === cat),
            }));
            const hasAnyProposal = proposalsByCandidate.some((p) => p.proposal);

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(
                  "bg-card border-border overflow-hidden transition-all",
                  !hasAnyProposal && "opacity-50"
                )}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                    className="w-full"
                  >
                    <CardHeader className="pb-0 cursor-pointer hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CatIcon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">
                            {CATEGORIES_LABELS[cat].es}
                          </CardTitle>
                          {/* Quick coverage indicators */}
                          <div className="flex items-center gap-1 ml-2">
                            {proposalsByCandidate.map(({ candidate, proposal }) => (
                              <div
                                key={candidate.id}
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full border",
                                  proposal
                                    ? "border-transparent"
                                    : "border-muted-foreground/30 bg-transparent"
                                )}
                                style={{
                                  backgroundColor: proposal ? candidate.partyColor : undefined,
                                }}
                                title={
                                  proposal
                                    ? `${candidate.shortName}: Tiene propuesta`
                                    : `${candidate.shortName}: Sin propuesta`
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {/* Summary row (always visible) */}
                  <CardContent className="pt-3 pb-3">
                    <div className={cn(
                      "grid gap-3",
                      selected.length === 2 && "grid-cols-1 sm:grid-cols-2",
                      selected.length === 3 && "grid-cols-1 sm:grid-cols-3",
                      selected.length === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                    )}>
                      {proposalsByCandidate.map(({ candidate, proposal }) => (
                        <div
                          key={candidate.id}
                          className={cn(
                            "rounded-lg border p-3 transition-all",
                            proposal
                              ? "border-border bg-muted/30"
                              : "border-dashed border-border/50 bg-transparent"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: candidate.partyColor }}
                            />
                            <span className="text-[11px] font-medium text-foreground truncate">
                              {candidate.shortName}
                            </span>
                            {proposal ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald ml-auto flex-shrink-0" />
                            ) : (
                              <MinusCircle className="h-3 w-3 text-muted-foreground/40 ml-auto flex-shrink-0" />
                            )}
                          </div>

                          {proposal ? (
                            <>
                              <p className="text-xs font-semibold text-foreground">
                                {proposal.title}
                              </p>
                              {isExpanded && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed"
                                >
                                  {proposal.summary}
                                </motion.p>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/50 italic">
                              No presenta propuesta en esta categoria
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      {selected.length >= 2 && (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Nota:</span> Esta comparacion se
            basa en las propuestas declaradas por los candidatos en sus planes de gobierno
            presentados al JNE. Las propuestas son resumenes y no representan la totalidad del
            plan. Consulta el documento oficial completo para informacion detallada.
            La herramienta no emite juicios de valor — tu decides.
          </p>
        </div>
      )}
    </div>
  );
}
