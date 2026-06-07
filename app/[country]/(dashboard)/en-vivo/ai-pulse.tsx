"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldAlert, Zap, Eye, Users, Newspaper, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import type { NewsArticle } from "@/lib/data/news";
import type { FactCheck } from "@/lib/data/fact-checks";
import type { Candidate } from "@/lib/data/candidates";
import Link from "next/link";

interface AIPulseProps {
  articles: NewsArticle[];
  factChecks: FactCheck[];
  candidates: Candidate[];
}

interface Insight {
  id: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  color: string;
  severity: "high" | "medium" | "info";
}

export function AIPulse({ articles, factChecks, candidates }: AIPulseProps) {
  const country = useCountry();
  const [activeIndex, setActiveIndex] = useState(0);

  // ── REAL ANALYSIS: compute insights from actual data ──
  const insights = useMemo(() => {
    const result: Insight[] = [];

    // 1. Candidate mention analysis — who dominates the news?
    const mentionCounts: Record<string, number> = {};
    for (const article of articles) {
      for (const name of article.candidates) {
        mentionCounts[name] = (mentionCounts[name] || 0) + 1;
      }
    }
    const sortedMentions = Object.entries(mentionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedMentions.length >= 2) {
      const [top, second] = sortedMentions;
      const ratio = (top[1] / second[1]).toFixed(1);
      result.push({
        id: "mentions",
        icon: <Users className="h-4 w-4" />,
        title: `${top[0]} domina la cobertura mediática`,
        detail: `${top[1]} menciones — ${ratio}x más que ${second[0]} (${second[1]}). ${sortedMentions.length > 2 ? `Le siguen: ${sortedMentions.slice(2).map(m => `${m[0]} (${m[1]})`).join(", ")}` : ""}`,
        color: "text-primary",
        severity: "info",
      });
    }

    // 2. Breaking news velocity
    const breakingCount = articles.filter((a) => a.isBreaking).length;
    const totalSources = new Set(articles.map((a) => a.source)).size;
    if (breakingCount > 0) {
      result.push({
        id: "velocity",
        icon: <Zap className="h-4 w-4" />,
        title: `${breakingCount} noticias de última hora detectadas`,
        detail: `CONDOR AI monitorea ${articles.length} artículos de ${totalSources} fuentes. ${breakingCount >= 5 ? "Alta actividad mediática." : ""}`,
        color: "text-amber-600",
        severity: breakingCount >= 5 ? "high" : "medium",
      });
    }

    // 3. Disinformation alert
    const falseChecks = factChecks.filter((fc) => fc.verdict === "FALSO");
    const misleading = factChecks.filter((fc) => fc.verdict === "ENGANOSO");
    if (falseChecks.length > 0 || misleading.length > 0) {
      const total = falseChecks.length + misleading.length;
      const latestFalse = falseChecks[0];
      result.push({
        id: "disinfo",
        icon: <ShieldAlert className="h-4 w-4" />,
        title: `${total} afirmaciones falsas o engañosas detectadas`,
        detail: latestFalse
          ? `Última: "${latestFalse.claim.length > 100 ? latestFalse.claim.slice(0, 100) + "..." : latestFalse.claim}"${latestFalse.claimant && latestFalse.claimant !== "Desconocido" ? ` — ${latestFalse.claimant}` : ""}`
          : `${misleading.length} engañosas detectadas por CONDOR AI.`,
        color: "text-rose",
        severity: "high",
      });
    }

    // 4. Source diversity analysis
    const sourceCounts: Record<string, number> = {};
    for (const article of articles) {
      sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
    }
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    if (topSources.length >= 2) {
      result.push({
        id: "sources",
        icon: <Newspaper className="h-4 w-4" />,
        title: `${Object.keys(sourceCounts).length} fuentes cubren la jornada`,
        detail: `Principales: ${topSources.map(s => `${s[0]} (${s[1]})`).join(", ")}. CONDOR AI cruza información de todas las fuentes.`,
        color: "text-sky-600",
        severity: "info",
      });
    }

    // 5. Category/topic analysis — skip obvious categories like "politica"
    const categoryCounts: Record<string, number> = {};
    const boringCategories = ["politica", "política", "elecciones", "gobierno"];
    for (const article of articles) {
      if (article.category && !boringCategories.includes(article.category.toLowerCase())) {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
      }
    }
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    if (topCategories.length >= 1 && topCategories[0][1] >= 5) {
      result.push({
        id: "topics",
        icon: <Eye className="h-4 w-4" />,
        title: `Tema emergente: ${topCategories[0][0]}`,
        detail: `${topCategories[0][1]} artículos sobre ${topCategories[0][0]}${topCategories.length > 1 ? `. También: ${topCategories.slice(1).map(c => `${c[0]} (${c[1]})`).join(", ")}` : ""}.`,
        color: "text-violet-600",
        severity: "info",
      });
    }

    // 6. Fact-check credibility — what % of checked articles are verified?
    const checkedArticles = articles.filter((a) => a.factCheck);
    const verifiedCount = articles.filter((a) => a.factCheck === "verified").length;
    const questionableCount = articles.filter((a) => a.factCheck === "questionable").length;
    const falseArticleCount = articles.filter((a) => a.factCheck === "false").length;
    if (checkedArticles.length > 0) {
      const verifiedPct = Math.round((verifiedCount / checkedArticles.length) * 100);
      result.push({
        id: "credibility",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: `${verifiedPct}% de noticias verificadas como confiables`,
        detail: `De ${checkedArticles.length} artículos analizados: ${verifiedCount} verificados, ${questionableCount} cuestionables, ${falseArticleCount} falsos.`,
        color: verifiedPct >= 70 ? "text-emerald" : verifiedPct >= 50 ? "text-amber-600" : "text-rose",
        severity: verifiedPct < 50 ? "high" : "info",
      });
    }

    // Sort: high severity first
    const severityOrder = { high: 0, medium: 1, info: 2 };
    result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return result;
  }, [articles, factChecks, candidates]);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [insights.length]);

  if (insights.length === 0) return null;

  const current = insights[activeIndex % insights.length];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">CONDOR AI detecta</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
        </div>
        <div className="flex items-center gap-1">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIndex % insights.length ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Rotating insight */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex-shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center",
              current.severity === "high" ? "bg-rose/10" : current.severity === "medium" ? "bg-amber-50" : "bg-primary/5"
            )}>
              <span className={current.color}>{current.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {current.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {current.detail}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
          <span>{articles.length} noticias</span>
          <span>{Object.keys(articles.reduce<Record<string, boolean>>((acc, a) => { acc[a.source] = true; return acc; }, {})).length} fuentes</span>
          <span>{factChecks.length} verificaciones</span>
        </div>
        <Link
          href={`/${country.code}/verificador`}
          className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5"
        >
          Verificar <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
