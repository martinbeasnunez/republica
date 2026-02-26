"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Download,
  Search,
  User,
  Loader2,
  Brain,
  X,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATEGORIES_LABELS,
  type Category,
  type Candidate,
} from "@/lib/data/candidates";
import Link from "next/link";
import { cn } from "@/lib/utils";

const categories: Category[] = [
  "economia",
  "seguridad",
  "salud",
  "educacion",
  "medio-ambiente",
  "anticorrupcion",
  "infraestructura",
  "tecnologia",
];

interface AIAnalysis {
  candidateName: string;
  summary: string;
  proposals: {
    category: string;
    title: string;
    description: string;
    feasibility: string;
    impact: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  overallScore: number;
}

interface PlanesClientProps {
  candidates: Candidate[];
}

export function PlanesClient({ candidates }: PlanesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "todos">(
    "todos"
  );
  const [search, setSearch] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const filtered = candidates.filter((c) => {
    if (search) {
      return c.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const analyzeCandidate = async (candidateName: string, candidateId: string) => {
    setAnalyzingId(candidateId);
    setAiError(null);

    try {
      const res = await fetch("/api/ai/analyze-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          topic: selectedCategory === "todos" ? undefined : selectedCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al analizar");
      }

      setAiAnalysis(data.data);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Error al analizar el plan. Intenta de nuevo."
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Análisis con Inteligencia Artificial avanzada
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Haz clic en &ldquo;Analizar con IA&rdquo; en cualquier candidato para obtener
            un análisis profundo de su plan de gobierno. Siempre consulta el
            documento original para información completa.
          </p>
        </div>
      </div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-card border-primary/30 glow-indigo overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">
                      Análisis IA: {aiAnalysis.candidateName}
                    </CardTitle>
                    {aiAnalysis.overallScore > 0 && (
                      <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
                        <BarChart3 className="h-3 w-3" />
                        Score: {aiAnalysis.overallScore}/100
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setAiAnalysis(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">
                    Resumen Ejecutivo
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {aiAnalysis.summary}
                  </p>
                </div>

                {/* AI Proposals */}
                {aiAnalysis.proposals && aiAnalysis.proposals.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-2">
                      Propuestas Clave
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {aiAnalysis.proposals.slice(0, 6).map((p, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-muted/50 p-3 border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className="text-[9px]"
                            >
                              {p.category}
                            </Badge>
                            <div className="flex gap-1 ml-auto">
                              <span
                                className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded",
                                  p.feasibility === "alta"
                                    ? "bg-emerald/10 text-emerald"
                                    : p.feasibility === "media"
                                      ? "bg-amber/10 text-amber"
                                      : "bg-rose/10 text-rose"
                                )}
                              >
                                Viabilidad: {p.feasibility}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-foreground">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {p.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-emerald mb-2">
                        Fortalezas
                      </p>
                      <ul className="space-y-1">
                        {aiAnalysis.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                          >
                            <span className="text-emerald mt-0.5">+</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiAnalysis.weaknesses && aiAnalysis.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-rose mb-2">
                        Debilidades
                      </p>
                      <ul className="space-y-1">
                        {aiAnalysis.weaknesses.map((w, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                          >
                            <span className="text-rose mt-0.5">-</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Error */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-rose/20 bg-rose/5 p-3"
          >
            <p className="text-sm text-rose">{aiError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar candidato..."
          className="pl-10 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === "todos" ? "default" : "secondary"}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedCategory("todos")}
        >
          Todas las categorías
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() =>
              setSelectedCategory(selectedCategory === cat ? "todos" : cat)
            }
          >
            {CATEGORIES_LABELS[cat].es}
          </Badge>
        ))}
      </div>

      {/* Plans grid */}
      <div className="space-y-4">
        {filtered.map((candidate, index) => {
          const proposals =
            selectedCategory === "todos"
              ? candidate.keyProposals
              : candidate.keyProposals.filter(
                  (p) => p.category === selectedCategory
                );

          if (proposals.length === 0) return null;

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border overflow-hidden">
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: candidate.partyColor }}
                />
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: candidate.partyColor + "15",
                        }}
                      >
                        {candidate.photo && candidate.photo.startsWith("http") ? (
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User
                            className="h-5 w-5"
                            style={{ color: candidate.partyColor }}
                          />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-sm">
                          {candidate.name}
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground">
                          {candidate.party}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* AI Analyze button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() =>
                          analyzeCandidate(candidate.name, candidate.id)
                        }
                        disabled={analyzingId === candidate.id}
                      >
                        {analyzingId === candidate.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Analizando...
                          </>
                        ) : (
                          <>
                            <Brain className="h-3 w-3" />
                            Analizar con IA
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-muted-foreground"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                      <Link href={`/candidatos/${candidate.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs"
                        >
                          Ver perfil
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted/50 p-3 border border-border/50"
                      >
                        <Badge
                          variant="secondary"
                          className="text-[10px] mb-2"
                        >
                          {CATEGORIES_LABELS[proposal.category].es}
                        </Badge>
                        <p className="text-xs font-semibold text-foreground">
                          {proposal.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {proposal.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
