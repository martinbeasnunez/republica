"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Bot,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Vote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/lib/data/news";
import type { Candidate } from "@/lib/data/candidates";
import { useCountry } from "@/lib/config/country-context";

// ─── Compute Insights ───

interface NewsInsights {
  // Context strip
  daysToElection: number;
  maxPollAverage: number;
  totalArticles: number;
  uniqueSourceCount: number;

  // Card 1: Featured story
  featuredArticle: NewsArticle | null;
  todayArticleCount: number;

  // Card 2: Race snapshot
  topCandidates: {
    shortName: string;
    pollAverage: number;
    pollTrend: "up" | "down" | "stable";
    partyColor: string;
  }[];

  // Card 3: Radar
  questionableCount: number;
  breakingTodayCount: number;
  topCategories: { name: string; count: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  politica: "Política",
  economia: "Economía",
  seguridad: "Seguridad",
  encuestas: "Encuestas",
  corrupcion: "Corrupción",
  opinion: "Opinión",
};

function computeInsights(
  articles: NewsArticle[],
  candidates?: Candidate[],
  electionDate?: string
): NewsInsights {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const elDate = electionDate ? new Date(electionDate) : new Date("2026-04-12");
  const daysToElection = Math.max(
    0,
    Math.floor((elDate.getTime() - now.getTime()) / 86400000)
  );

  // Today's articles
  const todayArticles = articles.filter((a) => {
    try {
      return new Date(a.time).toISOString().split("T")[0] === todayStr;
    } catch {
      return false;
    }
  });

  // Featured article: breaking today > latest today > breaking any > latest any
  const featuredArticle =
    todayArticles.find((a) => a.isBreaking) ||
    todayArticles[0] ||
    articles.find((a) => a.isBreaking) ||
    articles[0] ||
    null;

  // Top candidates by poll average
  const topCandidates = (candidates || [])
    .filter((c) => c.pollAverage > 0)
    .sort((a, b) => b.pollAverage - a.pollAverage)
    .slice(0, 4)
    .map((c) => ({
      shortName: c.shortName,
      pollAverage: c.pollAverage,
      pollTrend: (c.pollTrend || "stable") as "up" | "down" | "stable",
      partyColor: c.partyColor || "#6b7280",
    }));

  const maxPollAverage = topCandidates.length > 0 ? topCandidates[0].pollAverage : 0;

  // Radar: fact-check + breaking + categories
  const questionableCount = articles.filter(
    (a) => a.factCheck === "questionable" || a.factCheck === "false"
  ).length;

  const breakingTodayCount = todayArticles.filter((a) => a.isBreaking).length;

  const catMap = new Map<string, number>();
  todayArticles.forEach((a) => {
    const cat = a.category.toLowerCase();
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  // Fallback to all articles if no today articles
  if (catMap.size === 0) {
    articles.forEach((a) => {
      const cat = a.category.toLowerCase();
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
  }
  const topCategories = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const uniqueSourceCount = new Set(articles.map((a) => a.source)).size;

  return {
    daysToElection,
    maxPollAverage,
    totalArticles: articles.length,
    uniqueSourceCount,
    featuredArticle,
    todayArticleCount: todayArticles.length,
    topCandidates,
    questionableCount,
    breakingTodayCount,
    topCategories,
  };
}

// ─── Component ───

interface NewsHeroInsightProps {
  articles: NewsArticle[];
  candidates?: Candidate[];
}

export function NewsHeroInsight({ articles, candidates }: NewsHeroInsightProps) {
  const country = useCountry();
  const [briefing, setBriefing] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const insights = computeInsights(articles, candidates, country.electionDate);

  const requestBriefing = async () => {
    if (isStreaming) return;
    setShowBriefing(true);
    setIsStreaming(true);
    setBriefing("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Genera un briefing ejecutivo de las noticias electorales de hoy en ${country.name}. Resume los temas principales, candidatos mencionados, y que deberia saber un ciudadano. Sé conciso, máximo 3-4 párrafos. Incluye los enlaces de las fuentes.`,
            },
          ],
          countryCode: country.code,
        }),
      });

      if (!res.ok) throw new Error("Error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setBriefing(fullContent);
                }
              } catch {
                // skip
              }
            }
          }
        }
      }
    } catch {
      setBriefing(
        "No se pudo generar el briefing en este momento. Intenta de nuevo."
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-emerald" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-rose" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Background effects */}
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 data-stream" />

      <div className="relative z-10">
        {/* Classification header */}
        <div className="classification-header px-4 py-2 text-center">
          CONDOR &nbsp;// &nbsp;BRIEFING ELECTORAL &nbsp;// &nbsp;NOTICIAS
          &nbsp;// &nbsp;AI-ANALYZED
        </div>

        {/* Hero content */}
        <div className="px-4 sm:px-6 py-5 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Title + status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                    Análisis en tiempo real
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  <span className="text-gradient">Briefing del Día</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald pulse-dot" />
                <span className="text-[10px] font-mono text-emerald font-medium">
                  CONDOR AI ACTIVO
                </span>
              </div>
            </div>

            {/* Context strip */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 px-1">
              <div className="flex items-center gap-1.5">
                <Vote className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-muted-foreground">
                  Faltan <span className="font-bold text-foreground font-mono tabular-nums">{insights.daysToElection}</span> días
                </span>
              </div>
              <span className="text-border">|</span>
              <span className="text-[11px] text-muted-foreground">
                {insights.maxPollAverage > 0 ? (
                  <>
                    Nadie supera el{" "}
                    <span className="font-bold text-foreground font-mono tabular-nums">
                      {insights.maxPollAverage}%
                    </span>
                  </>
                ) : (
                  "Sin datos de encuestas"
                )}
              </span>
              <span className="text-border">|</span>
              <span className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground font-mono tabular-nums">{insights.totalArticles}</span> noticias
                de <span className="font-bold text-foreground font-mono tabular-nums">{insights.uniqueSourceCount}</span> fuentes
              </span>
            </div>

            {/* 3-card insight grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1: Lo que paso hoy */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Newspaper className="h-3.5 w-3.5 text-rose" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Lo que pasó hoy
                  </span>
                </div>
                {insights.featuredArticle ? (
                  <>
                    {insights.featuredArticle.isBreaking && (
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-dot" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose">
                          Última hora
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                      {insights.featuredArticle.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {insights.featuredArticle.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-primary font-medium">
                          {insights.featuredArticle.source}
                        </span>
                        {insights.featuredArticle.sourceUrl && (
                          <a
                            href={insights.featuredArticle.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[8px] px-1.5 py-0">
                        {CATEGORY_LABELS[insights.featuredArticle.category.toLowerCase()] ||
                          insights.featuredArticle.category}
                      </Badge>
                    </div>
                    {insights.todayArticleCount > 1 && (
                      <p className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/50">
                        y {insights.todayArticleCount - 1} noticia{insights.todayArticleCount - 1 > 1 ? "s" : ""} más hoy
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    Sin noticias recientes
                  </p>
                )}
              </div>

              {/* Card 2: Carrera electoral */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-sky" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Carrera electoral
                  </span>
                </div>
                {insights.topCandidates.length > 0 ? (
                  <>
                    <div className="space-y-1.5">
                      {insights.topCandidates.map((c, i) => (
                        <div
                          key={c.shortName}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: c.partyColor }}
                          />
                          <span className="text-xs text-foreground truncate flex-1">
                            {i === 0 && (
                              <span className="text-[9px] text-primary font-bold mr-1">1.</span>
                            )}
                            {c.shortName}
                          </span>
                          <span className="text-[11px] font-mono tabular-nums font-bold text-foreground">
                            {c.pollAverage.toFixed(1)}%
                          </span>
                          <TrendIcon trend={c.pollTrend} />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border/50">
                      {insights.maxPollAverage < 15
                        ? "Elección abierta — ningún candidato supera el 15%"
                        : `${insights.topCandidates[0].shortName} lidera con ${insights.maxPollAverage.toFixed(1)}%`}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    Sin datos de encuestas disponibles
                  </p>
                )}
              </div>

              {/* Card 3: Radar CONDOR */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-amber" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Radar CONDOR
                  </span>
                </div>

                {/* Fact-check signal */}
                {insights.questionableCount > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber/10 border border-amber/20 px-2.5 py-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber flex-shrink-0" />
                    <span className="text-[11px] text-amber font-medium">
                      {insights.questionableCount} noticia{insights.questionableCount > 1 ? "s" : ""} cuestionable{insights.questionableCount > 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald/10 border border-emerald/20 px-2.5 py-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald flex-shrink-0" />
                    <span className="text-[11px] text-emerald font-medium">
                      Sin alertas de desinformación
                    </span>
                  </div>
                )}

                {/* Breaking signal */}
                {insights.breakingTodayCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-dot" />
                    <span className="text-[10px] text-rose font-medium">
                      {insights.breakingTodayCount} de última hora hoy
                    </span>
                  </div>
                )}

                {/* Top categories */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {insights.topCategories.map((c) => (
                    <Badge
                      key={c.name}
                      variant="secondary"
                      className="text-[9px] h-5 gap-1 font-mono"
                    >
                      {CATEGORY_LABELS[c.name] || c.name}
                      <span className="text-primary font-bold">{c.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Briefing Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            {!showBriefing ? (
              <button
                onClick={requestBriefing}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                <Sparkles className="h-4 w-4" />
                Pedir análisis completo a CONDOR AI
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    CONDOR AI — Briefing Electoral
                  </span>
                  {isStreaming && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary ml-auto" />
                  )}
                </div>

                <AnimatePresence>
                  {(briefing || isStreaming) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                        {briefing}
                        {isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </div>
                      {!isStreaming && briefing && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Generado por CONDOR AI
                          </span>
                          <button
                            onClick={requestBriefing}
                            className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                          >
                            Regenerar
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
