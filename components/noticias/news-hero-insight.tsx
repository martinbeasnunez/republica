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
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/lib/data/news";
import type { Candidate } from "@/lib/data/candidates";
import { useCountry } from "@/lib/config/country-context";
import { cn } from "@/lib/utils";

// ─── Compute Insights ───

interface NewsInsights {
  daysToElection: number;
  electionDateFormatted: string;
  maxPollAverage: number;
  totalArticles: number;
  uniqueSourceCount: number;
  featuredArticle: NewsArticle | null;
  featuredIsRecent: boolean;
  featuredCandidatePhoto: string | null;
  featuredCandidateName: string | null;
  todayArticleCount: number;
  topCandidates: {
    shortName: string;
    pollAverage: number;
    pollTrend: "up" | "down" | "stable";
    partyColor: string;
  }[];
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
  const elDate = electionDate ? new Date(electionDate) : new Date("2026-04-12");
  const daysToElection = Math.max(
    0,
    Math.floor((elDate.getTime() - now.getTime()) / 86400000)
  );

  const electionDateFormatted = elDate.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Recent articles (last 24 hours)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayArticles = articles.filter((a) => {
    try {
      return new Date(a.time) >= oneDayAgo;
    } catch {
      return false;
    }
  });

  // Featured article: prefer today's, but always show most recent
  const featuredArticle =
    todayArticles.find((a) => a.isBreaking) ||
    todayArticles[0] ||
    articles[0] ||
    null;

  const featuredIsRecent = featuredArticle
    ? todayArticles.some((a) => a.id === featuredArticle.id)
    : false;

  // Match featured article's mentioned candidate to a photo and name
  let featuredCandidatePhoto: string | null = null;
  let featuredCandidateName: string | null = null;
  if (featuredArticle?.candidates?.length && candidates?.length) {
    for (const mentioned of featuredArticle.candidates) {
      const match = candidates.find((c) =>
        c.shortName.toLowerCase().includes(mentioned.toLowerCase()) ||
        mentioned.toLowerCase().includes(c.shortName.toLowerCase()) ||
        c.name.toLowerCase().includes(mentioned.toLowerCase())
      );
      if (match?.photo) {
        featuredCandidatePhoto = match.photo;
        featuredCandidateName = match.shortName || match.name;
        break;
      }
    }
  }

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

  const questionableCount = articles.filter(
    (a) => a.factCheck === "questionable" || a.factCheck === "false"
  ).length;

  const breakingTodayCount = todayArticles.filter((a) => a.isBreaking).length;

  const catMap = new Map<string, number>();
  todayArticles.forEach((a) => {
    const cat = a.category.toLowerCase();
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
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
    electionDateFormatted,
    maxPollAverage,
    totalArticles: articles.length,
    uniqueSourceCount,
    featuredArticle,
    featuredIsRecent,
    featuredCandidatePhoto,
    featuredCandidateName,
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

  // Urgency coloring for countdown
  const urgencyClass =
    insights.daysToElection <= 7
      ? "text-rose"
      : insights.daysToElection <= 14
        ? "text-primary"
        : insights.daysToElection <= 30
          ? "text-amber"
          : "text-foreground";

  const urgencyBarColor =
    insights.daysToElection <= 7
      ? "#dc2626"
      : insights.daysToElection <= 14
        ? "#8B1A1A"
        : insights.daysToElection <= 30
          ? "#b45309"
          : "#cbd5e1";

  const urgencyProgress = Math.max(5, Math.min(100, ((90 - insights.daysToElection) / 90) * 100));

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
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald" />;
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-rose" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative z-10">
        {/* ═══ ZONE 1: Countdown Hero + Title ═══ */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-0 mb-6">
              {/* Countdown block — THE HERO */}
              <div className="flex flex-col items-center sm:items-start justify-center sm:border-r sm:border-border/60 sm:pr-8 sm:mr-8 py-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Faltan
                </span>
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className={cn(
                    "text-6xl sm:text-7xl font-mono font-bold tabular-nums leading-none",
                    urgencyClass
                  )}
                >
                  {insights.daysToElection}
                </motion.span>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1.5">
                  días
                </span>
                {/* Urgency progress bar */}
                <div className="w-full max-w-[140px] h-2 rounded-full bg-muted mt-3">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: urgencyBarColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${urgencyProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Calendar className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">
                    {insights.electionDateFormatted}
                  </span>
                </div>
              </div>

              {/* Title + stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    <span className="text-gradient">Briefing Electoral</span>
                  </h2>
                  <div className={cn(
                    "flex items-center gap-1.5 flex-shrink-0 rounded-full px-2.5 py-1",
                    insights.todayArticleCount > 0
                      ? "bg-emerald/10 border border-emerald/20"
                      : "bg-muted/50 border border-border"
                  )}>
                    <span className={cn(
                      "h-2 w-2 rounded-full pulse-dot",
                      insights.todayArticleCount > 0 ? "bg-emerald" : "bg-muted-foreground/40"
                    )} />
                    <span className={cn(
                      "text-[10px] font-mono font-medium",
                      insights.todayArticleCount > 0 ? "text-emerald" : "text-muted-foreground"
                    )}>
                      {insights.todayArticleCount > 0 ? "ACTUALIZADO HOY" : "MONITOREO CONTINUO"}
                    </span>
                  </div>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono tabular-nums font-semibold text-foreground">
                      {insights.totalArticles}
                    </span>
                    <span className="text-xs text-muted-foreground">noticias</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono tabular-nums font-semibold text-foreground">
                      {insights.uniqueSourceCount}
                    </span>
                    <span className="text-xs text-muted-foreground">fuentes</span>
                  </div>
                  {insights.maxPollAverage > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Nadie supera el{" "}
                        <span className="font-mono tabular-nums font-bold text-foreground">
                          {insights.maxPollAverage.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ ZONE 2: Race Snapshot — Full Width Primary Card ═══ */}
            {insights.topCandidates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-border bg-background/50 p-5 sm:p-6 mb-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-sky" />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                    Carrera electoral
                  </span>
                </div>
                <div className="space-y-3">
                  {insights.topCandidates.map((c, i) => (
                    <div key={c.shortName} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.partyColor }}
                      />
                      <span className="text-sm font-medium text-foreground w-32 sm:w-40 truncate">
                        {i === 0 && (
                          <span className="text-xs text-primary font-bold mr-1">1.</span>
                        )}
                        {c.shortName}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: c.partyColor }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(c.pollAverage / (insights.maxPollAverage * 1.2)) * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                        />
                      </div>
                      <span className="text-base font-mono tabular-nums font-bold text-foreground w-16 text-right">
                        {c.pollAverage.toFixed(1)}%
                      </span>
                      <TrendIcon trend={c.pollTrend} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/70 pt-3 mt-3 border-t border-border/50">
                  {insights.maxPollAverage < 15
                    ? "Elección abierta — ningún candidato supera el 15%"
                    : `${insights.topCandidates[0].shortName} lidera con ${insights.maxPollAverage.toFixed(1)}%`}
                </p>
              </motion.div>
            )}

            {/* ═══ ZONE 3: Secondary Cards — 2-Column Grid ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card A: Noticia destacada */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-rose" />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                    Noticia destacada
                  </span>
                </div>
                {insights.featuredArticle ? (
                  <>
                    {insights.featuredArticle.isBreaking && insights.featuredIsRecent && (
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-dot" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose">
                          Última hora
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      {insights.featuredCandidatePhoto && (
                        <img
                          src={insights.featuredCandidatePhoto}
                          alt={insights.featuredCandidateName ? `Foto de ${insights.featuredCandidateName}` : "Foto de candidato"}
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0 mt-0.5 border border-border"
                        />
                      )}
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {insights.featuredArticle.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {insights.featuredArticle.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary font-medium">
                          {insights.featuredArticle.source}
                        </span>
                        {insights.featuredArticle.sourceUrl && (
                          <a
                            href={insights.featuredArticle.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                        {CATEGORY_LABELS[insights.featuredArticle.category.toLowerCase()] ||
                          insights.featuredArticle.category}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Newspaper className="h-6 w-6 text-muted-foreground/20 mb-2" />
                    <p className="text-xs text-muted-foreground/60">
                      CONDOR está monitoreando
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Card B: Radar CONDOR */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber" />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                    Radar CONDOR
                  </span>
                </div>

                {insights.questionableCount > 0 ? (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200/60 px-3 py-2">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-4 px-2 rounded-full bg-red-600 text-[9px] font-bold text-white tracking-wide">
                      FALSO
                    </span>
                    <span className="text-xs text-stone-600 font-medium">
                      {insights.questionableCount} noticia{insights.questionableCount > 1 ? "s" : ""} cuestionada{insights.questionableCount > 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald/10 border border-emerald/20 px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-emerald flex-shrink-0" />
                    <span className="text-xs text-emerald font-medium">
                      Sin alertas de desinformación
                    </span>
                  </div>
                )}

                {insights.breakingTodayCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-dot" />
                    <span className="text-xs text-rose font-medium">
                      {insights.breakingTodayCount} de última hora hoy
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {insights.topCategories.map((c) => (
                    <Badge
                      key={c.name}
                      variant="secondary"
                      className="text-[10px] h-6 gap-1 font-mono"
                    >
                      {CATEGORY_LABELS[c.name] || c.name}
                      <span className="text-primary font-bold">{c.count}</span>
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ═══ ZONE 4: AI Briefing Button ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            {!showBriefing ? (
              <button
                onClick={requestBriefing}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3.5 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                <Sparkles className="h-4 w-4" />
                Pedir análisis completo a CONDOR AI
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <div className="rounded-xl border border-border bg-background/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    CONDOR AI — Briefing Electoral
                  </span>
                  {isStreaming && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
                  )}
                </div>

                <AnimatePresence>
                  {(briefing || isStreaming) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {briefing}
                        {isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </div>
                      {!isStreaming && briefing && (
                        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs font-mono text-muted-foreground">
                            Generado por CONDOR AI
                          </span>
                          <button
                            onClick={requestBriefing}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
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
