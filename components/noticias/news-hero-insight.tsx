"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Bot,
  Newspaper,
  Users,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { articles, type NewsArticle } from "@/lib/data/news";
import { candidates } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";

// ─── Compute Insights from article data ───

interface NewsInsights {
  breakingArticle: NewsArticle | null;
  topCandidates: { name: string; count: number; partyColor?: string }[];
  categoryDistribution: { category: string; count: number }[];
  verifiedCount: number;
  totalCount: number;
  uniqueSources: string[];
}

function computeInsights(): NewsInsights {
  const breaking = articles.find((a) => a.isBreaking) || articles[0];

  // Count candidate mentions
  const candidateMap = new Map<string, number>();
  articles.forEach((a) => {
    a.candidates.forEach((c) => {
      candidateMap.set(c, (candidateMap.get(c) || 0) + 1);
    });
  });
  const topCandidates = [...candidateMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => {
      const candidate = candidates.find(
        (c) => c.shortName === name || c.name.includes(name.replace("K. ", ""))
      );
      return { name, count, partyColor: candidate?.partyColor };
    });

  // Category distribution
  const catMap = new Map<string, number>();
  articles.forEach((a) => {
    catMap.set(a.category, (catMap.get(a.category) || 0) + 1);
  });
  const categoryDistribution = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  const verifiedCount = articles.filter(
    (a) => a.factCheck === "verified"
  ).length;
  const uniqueSources = [...new Set(articles.map((a) => a.source))];

  return {
    breakingArticle: breaking,
    topCandidates,
    categoryDistribution,
    verifiedCount,
    totalCount: articles.length,
    uniqueSources,
  };
}

// ─── Component ───

export function NewsHeroInsight() {
  const [briefing, setBriefing] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const insights = computeInsights();

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
              content:
                "Genera un briefing ejecutivo de las noticias electorales de hoy. Resume los temas principales, candidatos mencionados, y que deberia saber un ciudadano peruano. Se conciso, maximo 3-4 parrafos. Incluye los enlaces de las fuentes.",
            },
          ],
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                    Analisis en tiempo real
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  <span className="text-gradient">Briefing del Dia</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Lo que CONDOR detecta en las noticias electorales de hoy
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald pulse-dot" />
                <span className="text-[10px] font-mono text-emerald font-medium">
                  CONDOR AI ACTIVO
                </span>
              </div>
            </div>

            {/* Insight Grid — 4 cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Breaking / Top Story */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Newspaper className="h-3.5 w-3.5 text-rose" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Noticia principal
                  </span>
                </div>
                {insights.breakingArticle && (
                  <>
                    {insights.breakingArticle.isBreaking && (
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-dot" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose">
                          Ultima hora
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                      {insights.breakingArticle.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-primary font-medium">
                        {insights.breakingArticle.source}
                      </span>
                      {insights.breakingArticle.sourceUrl && (
                        <a
                          href={insights.breakingArticle.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Card 2: Candidates in focus */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Candidatos en foco
                  </span>
                </div>
                {insights.topCandidates.length > 0 ? (
                  <div className="space-y-1.5">
                    {insights.topCandidates.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: c.partyColor || "#6b7280",
                          }}
                        />
                        <span className="text-xs text-foreground truncate flex-1">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                          {c.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    Sin candidatos destacados hoy
                  </p>
                )}
              </div>

              {/* Card 3: Topics of the day */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-amber" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Temas del dia
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {insights.categoryDistribution.map((c) => (
                    <Badge
                      key={c.category}
                      variant="secondary"
                      className="text-[9px] h-5 gap-1 font-mono"
                    >
                      {c.category}
                      <span className="text-primary font-bold">
                        {c.count}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Card 4: Coverage / verification */}
              <div className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Cobertura
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-lg font-bold tabular-nums text-emerald">
                      {insights.verifiedCount}/{insights.totalCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      verificadas
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                      {insights.uniqueSources.length}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      fuentes:{" "}
                      {insights.uniqueSources.join(", ")}
                    </span>
                  </div>
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
                Pedir analisis completo a CONDOR AI
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
