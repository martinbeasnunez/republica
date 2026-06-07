"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  FileText,
  Search,
  User,
  Loader2,
  Brain,
  X,
  BarChart3,
  ExternalLink,
  ShieldCheck,
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
import { useCountry } from "@/lib/config/country-context";

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
  const country = useCountry();
  const [selectedCategory, setSelectedCategory] = useState<Category | "todos">(
    "todos"
  );
  const [search, setSearch] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const officialUrl = country.code === "pe"
    ? "https://plataformaelectoral.jne.gob.pe/candidatos/plan-gobierno-trabajo/buscar"
    : "https://www.cne.gov.co/";
  const officialOrg = country.code === "pe" ? "JNE" : "CNE";
  const officialFullName = country.code === "pe"
    ? "Jurado Nacional de Elecciones (JNE)"
    : "Consejo Nacional Electoral (CNE)";

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
          countryCode: country.code,
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

  /** Whether a candidate has a direct PDF link (vs. generic search page) */
  const hasDirectPdf = (c: Candidate) =>
    c.planUrl && (c.planUrl.endsWith(".pdf") || c.planUrl.includes("/docs/"));

  return (
    <div className="space-y-6">
      {/* Official source banner */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
        <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-base font-medium text-foreground">
            Planes de gobierno oficiales
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            Documentos registrados ante el {officialFullName}. Descarga el plan oficial de cada candidato o usa el resumen IA para una vista rápida.
          </p>
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-2.5 hover:text-emerald-900 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver todos en {officialOrg}
          </a>
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
                    <CardTitle className="text-base">
                      Análisis IA: {aiAnalysis.candidateName}
                    </CardTitle>
                    {aiAnalysis.overallScore > 0 && (
                      <Badge variant="secondary" className="text-xs gap-1 font-mono">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Score: {aiAnalysis.overallScore}/100
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAiAnalysis(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Summary */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5">
                    Resumen Ejecutivo
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiAnalysis.summary}
                  </p>
                </div>

                {/* AI Proposals */}
                {aiAnalysis.proposals && aiAnalysis.proposals.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2.5">
                      Propuestas Clave
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {aiAnalysis.proposals.slice(0, 6).map((p, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-muted/50 p-4 border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {p.category}
                            </Badge>
                            <div className="flex gap-1 ml-auto">
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded",
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
                          <p className="text-sm font-medium text-foreground">
                            {p.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
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
                      <p className="text-sm font-medium text-emerald mb-2">
                        Fortalezas
                      </p>
                      <ul className="space-y-1.5">
                        {aiAnalysis.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-2"
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
                      <p className="text-sm font-medium text-rose mb-2">
                        Debilidades
                      </p>
                      <ul className="space-y-1.5">
                        {aiAnalysis.weaknesses.map((w, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-rose mt-0.5">-</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* AI disclaimer */}
                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground/60">
                    Resumen generado por IA basado en el plan de gobierno oficial registrado ante el{" "}
                    <span className="font-medium text-muted-foreground">{officialFullName}</span>.
                    Consulta el documento original para información completa.
                  </p>
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
            className="rounded-lg border border-rose/20 bg-rose/5 p-4"
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
      <div className="space-y-5">
        {filtered.map((candidate, index) => {
          const proposals =
            selectedCategory === "todos"
              ? candidate.keyProposals
              : candidate.keyProposals.filter(
                  (p) => p.category === selectedCategory
                );

          if (proposals.length === 0) return null;

          const directPdf = hasDirectPdf(candidate);
          const planLink = candidate.planUrl || officialUrl;

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
                        className="flex h-11 w-11 items-center justify-center rounded-lg flex-shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: candidate.partyColor + "15",
                        }}
                      >
                        {candidate.photo && (candidate.photo.startsWith("http") || candidate.photo.startsWith("/")) ? (
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
                        <CardTitle className="text-base">
                          {candidate.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {candidate.party}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* AI Analyze button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() =>
                          analyzeCandidate(candidate.name, candidate.id)
                        }
                        disabled={analyzingId === candidate.id}
                      >
                        {analyzingId === candidate.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Analizando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Resumen IA
                          </>
                        )}
                      </Button>
                      {/* Plan oficial — proper link */}
                      <a
                        href={planLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {directPdf ? `Plan oficial (PDF)` : `Buscar en ${officialOrg}`}
                        </Button>
                      </a>
                      <Link href={`/${country.code}/candidatos/${candidate.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs"
                        >
                          Ver perfil
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {/* Source indicator */}
                  {directPdf && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Fuente: {officialFullName}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted/50 p-4 border border-border/50"
                      >
                        <Badge
                          variant="secondary"
                          className="text-[10px] mb-2"
                        >
                          {CATEGORIES_LABELS[proposal.category].es}
                        </Badge>
                        <p className="text-sm font-semibold text-foreground">
                          {proposal.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
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
