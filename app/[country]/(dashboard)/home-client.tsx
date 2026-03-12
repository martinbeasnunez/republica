"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Zap,
  Sparkles,
  Brain,
  Newspaper,
  Eye,
  Vote,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Candidate } from "@/lib/data/candidates";
import { type NewsArticle } from "@/lib/data/news";
import { type FactCheck } from "@/lib/data/fact-checks";
import { type PublicBriefing } from "./page";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { DynamicBlocks } from "@/components/blocks/dynamic-blocks";
import { AIPromptBar } from "@/components/home/ai-prompt-bar";
import { useAnalytics } from "@/hooks/use-analytics";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import { getElectionCountdown } from "@/lib/config/countries";
import DashboardClient from "./dashboard-client";
import type { HomepageBlock } from "@/lib/types/homepage-blocks";

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT — TOGGLE LIGHT / FULL
   ═══════════════════════════════════════════════════════════════════════════ */

type DashboardMode = "light" | "full";

interface HomeClientProps {
  candidates: Candidate[];
  topCandidates: Candidate[];
  articles: NewsArticle[];
  factChecks: FactCheck[];
  briefing?: PublicBriefing | null;
  homepageBlocks?: HomepageBlock[];
}

export default function HomeClient({
  candidates,
  topCandidates,
  articles,
  factChecks,
  briefing,
  homepageBlocks,
}: HomeClientProps) {
  const { trackEvent } = useAnalytics();
  const country = useCountry();
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultMode: DashboardMode = country.code === "co" ? "full" : "light";
  const [mode, setMode] = useState<DashboardMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`condor-dashboard-mode-${country.code}`) as DashboardMode | null;
    if (saved === "light" || saved === "full") setMode(saved);
    setMounted(true);
  }, [country.code]);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(`condor-dashboard-mode-${country.code}`, mode);
  }, [mode, mounted, country.code]);

  const handleToggle = (newMode: DashboardMode) => {
    setMode(newMode);
    trackEvent("click", "dashboard_mode_toggle", { mode: newMode });
  };

  // Don't render until hydrated — prevents AnimatePresence flicker on mobile
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8" />
        <div className="rounded-2xl border border-border bg-card h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle pill */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5">
          <button
            onClick={() => handleToggle("light")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              mode === "light"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Resumen
          </button>
          <button
            onClick={() => handleToggle("full")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              mode === "full"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Content based on mode — initial={false} prevents mobile blank-content bug */}
      <AnimatePresence initial={false} mode="wait">
        {mode === "light" ? (
          <motion.div
            key="light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >
            {briefing ? (
              <HeroBriefing
                briefing={briefing}
                topCandidates={topCandidates}
                articles={articles}
              />
            ) : (
              <HeroBriefingEmpty />
            )}

            {/* AI Prompt Bar — chat with CONDOR AI */}
            <AIPromptBar />

            {/* Quiz CTA (compact — high conversion position) */}
            <QuizCTACompact trackEvent={trackEvent} />

            {/* DYNAMIC BLOCKS (AI-curated) */}
            {homepageBlocks && homepageBlocks.length > 0 && (
              <DynamicBlocks blocks={homepageBlocks} />
            )}

            <EncuestasBlock candidates={topCandidates} />
            <ConocelosBlock
              candidates={topCandidates}
              scrollRef={scrollRef}
              trackEvent={trackEvent}
            />
            <NoticiasBlock articles={articles.slice(0, 3)} />
            <WhatsAppCTA context="default" />
          </motion.div>
        ) : (
          <motion.div
            key="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DashboardClient
              candidates={candidates}
              topCandidates={topCandidates}
              articles={articles}
              factChecks={factChecks}
              briefing={briefing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO BRIEFING — Visual data hero (Palantir-style)
   ═══════════════════════════════════════════════════════════════════════════ */

const CATEGORY_LABELS: Record<string, string> = {
  politica: "Política",
  economia: "Economía",
  seguridad: "Seguridad",
  encuestas: "Encuestas",
  corrupcion: "Corrupción",
  opinion: "Opinión",
};

function HeroBriefing({
  briefing,
  topCandidates,
  articles,
}: {
  briefing: PublicBriefing;
  topCandidates: Candidate[];
  articles: NewsArticle[];
}) {
  const country = useCountry();
  const daysToElection = getElectionCountdown(country.code);

  // Extract first sentence as headline
  const headline = briefing.editorial_summary
    .split(/(?<=[.!?])\s/)
    [0]?.slice(0, 100) || briefing.editorial_summary.slice(0, 100);

  // Is briefing from today?
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = briefing.briefing_date === todayStr;
  const dateStr = new Date(briefing.briefing_date + "T12:00:00").toLocaleDateString(
    "es-PE",
    { weekday: "long", day: "numeric", month: "long" }
  ).toUpperCase();

  // Poll movements: use briefing data or fallback to topCandidates
  const movements = briefing.poll_movements?.filter((m) => m.direction !== "stable").slice(0, 3) || [];
  const hasPollData = movements.length > 0 || topCandidates.length > 0;

  // Top stories from briefing or fallback to articles
  const stories = briefing.top_stories?.slice(0, 3) || [];
  const fallbackArticles = articles.slice(0, 3);
  const hasStories = stories.length > 0 || fallbackArticles.length > 0;

  // Radar: compute from articles
  const questionableCount = articles.filter(
    (a) => a.factCheck === "questionable" || a.factCheck === "false"
  ).length;
  const todayArticles = articles.filter((a) => {
    try { return new Date(a.time).toISOString().split("T")[0] === todayStr; } catch { return false; }
  });
  const catMap = new Map<string, number>();
  (todayArticles.length > 0 ? todayArticles : articles).forEach((a) => {
    const cat = a.category?.toLowerCase();
    if (cat) catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  const topCategories = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Leader info for context strip
  const leader = topCandidates[0];
  const uniqueSources = new Set(articles.map((a) => a.source)).size;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Background effects */}
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute inset-0 data-stream" />

        <div className="relative z-10">
          {/* Classification header */}
          <div className="classification-header px-4 py-2 text-center">
            CONDOR &nbsp;// &nbsp;BRIEFING ELECTORAL &nbsp;// &nbsp;
            {isToday ? dateStr : "ÚLTIMO ANÁLISIS"} &nbsp;// &nbsp;AI-POWERED
          </div>

          {/* Hero content */}
          <div className="px-4 sm:px-6 py-5 sm:py-6">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-[11px] sm:text-xs text-muted-foreground mb-3">
                IA que monitorea {country.pollsters.slice(0, 3).join(", ")} y{" "}
                {country.mediaSources.slice(0, 3).map((s) => s.name).join(", ")}{" "}
                + {country.mediaSources.length - 3} fuentes más.{" "}
                <Link
                  href={`/${country.code}/metodologia`}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ¿Cómo funciona?
                </Link>
              </p>
            </motion.div>

            {/* Context strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 px-1"
            >
              <div className="flex items-center gap-1.5">
                <Vote className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-muted-foreground">
                  Faltan{" "}
                  <span className="font-bold text-foreground font-mono tabular-nums">
                    {daysToElection}
                  </span>{" "}
                  días
                </span>
              </div>
              {leader && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-[11px] text-muted-foreground">
                    Líder:{" "}
                    <span className="font-bold text-foreground font-mono tabular-nums">
                      {leader.pollAverage.toFixed(1)}%
                    </span>
                  </span>
                </>
              )}
              {articles.length > 0 && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground font-mono tabular-nums">
                      {articles.length}
                    </span>{" "}
                    noticias ·{" "}
                    <span className="font-bold text-foreground font-mono tabular-nums">
                      {uniqueSources}
                    </span>{" "}
                    fuentes
                  </span>
                </>
              )}
            </motion.div>

            {/* 3-card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1: La Carrera */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-sky" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    La Carrera
                  </span>
                </div>
                {movements.length > 0 ? (
                  <>
                    <div className="space-y-1.5">
                      {movements.map((m) => (
                        <div key={m.candidate} className="flex items-center gap-2">
                          <span className="text-xs text-foreground truncate flex-1">
                            {m.candidate}
                          </span>
                          <span className="text-[11px] font-mono tabular-nums font-bold text-foreground">
                            {m.current.toFixed(1)}%
                          </span>
                          {m.direction === "up" ? (
                            <TrendingUp className="h-3 w-3 text-emerald" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-rose" />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : topCandidates.length > 0 ? (
                  <div className="space-y-1.5">
                    {topCandidates.slice(0, 4).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-2">
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
                        {c.pollTrend === "up" && <TrendingUp className="h-3 w-3 text-emerald" />}
                        {c.pollTrend === "down" && <TrendingDown className="h-3 w-3 text-rose" />}
                        {c.pollTrend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    Sin datos de encuestas
                  </p>
                )}
                {leader && (
                  <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border/50">
                    {leader.pollAverage < 15
                      ? "Elección abierta — nadie supera el 15%"
                      : `${leader.shortName} lidera con ${leader.pollAverage.toFixed(1)}%`}
                  </p>
                )}
              </motion.div>

              {/* Card 2: Lo + Importante */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <Newspaper className="h-3.5 w-3.5 text-rose" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Lo + importante
                  </span>
                </div>
                {stories.length > 0 ? (
                  <>
                    <div className="space-y-1.5">
                      {stories.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[10px] text-primary font-bold mt-0.5 flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground line-clamp-1">
                              {s.title}
                            </p>
                            <p className="text-[10px] text-primary">{s.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {briefing.top_stories && briefing.top_stories.length > 3 && (
                      <p className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/50">
                        y {briefing.top_stories.length - 3} más hoy
                      </p>
                    )}
                  </>
                ) : fallbackArticles.length > 0 ? (
                  <div className="space-y-1.5">
                    {fallbackArticles.map((a, i) => (
                      <div key={a.id} className="flex items-start gap-2">
                        <span className="text-[10px] text-primary font-bold mt-0.5 flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {a.title}
                          </p>
                          <p className="text-[10px] text-primary">{a.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    Sin noticias recientes
                  </p>
                )}
              </motion.div>

              {/* Card 3: Radar CONDOR */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46 }}
                className="rounded-xl border border-border bg-background/50 p-3 sm:p-4 space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-amber" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Radar CONDOR
                  </span>
                </div>

                {/* Fact-check signal */}
                {questionableCount > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber/10 border border-amber/20 px-2.5 py-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber flex-shrink-0" />
                    <span className="text-[11px] text-amber font-medium">
                      {questionableCount} noticia{questionableCount > 1 ? "s" : ""} cuestionable{questionableCount > 1 ? "s" : ""}
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

                {/* Category badges */}
                {topCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {topCategories.map((c) => (
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
                )}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 px-4 sm:px-6 py-3 flex items-center justify-between bg-muted/20">
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              <Brain className="h-3 w-3" /> CONDOR Brain ·{" "}
              <Link
                href={`/${country.code}/metodologia`}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Metodología
              </Link>
            </span>
            <Link
              href={`/${country.code}/noticias`}
              className="text-[11px] text-primary font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
            >
              Ver todas las noticias
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ── Empty state when no briefing ── */

function HeroBriefingEmpty() {
  const country = useCountry();
  const daysToElection = getElectionCountdown(country.code);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute inset-0 data-stream" />

        <div className="relative z-10">
          <div className="classification-header px-4 py-2 text-center">
            CONDOR &nbsp;// &nbsp;INTELIGENCIA ELECTORAL &nbsp;// &nbsp;AI-POWERED
          </div>

          <div className="px-4 sm:px-6 py-8 sm:py-10 text-center space-y-3">
            <Sparkles className="h-6 w-6 text-primary mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold">
              <span className="text-gradient">Preparando briefing...</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Faltan{" "}
              <span className="font-bold font-mono tabular-nums text-foreground">
                {daysToElection}
              </span>{" "}
              días para las elecciones
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="h-2 w-2 rounded-full bg-emerald pulse-dot" />
              <span className="text-[10px] font-mono text-emerald font-medium">
                CONDOR AI ACTIVO
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 1: ¿QUIÉN VA GANANDO?
   ═══════════════════════════════════════════════════════════════════════════ */

function EncuestasBlock({ candidates }: { candidates: Candidate[] }) {
  const country = useCountry();
  const maxPoll = candidates[0]?.pollAverage || 15;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg font-extrabold text-foreground mb-1">
        ¿Quién va ganando?
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Promedio {country.pollsters.slice(0, 4).join(", ")}
      </p>

      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <Link
              href={`/${country.code}/candidatos/${candidate.slug}`}
              className="flex items-center gap-3 group"
            >
              {/* Photo circle */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 overflow-hidden"
                style={{
                  backgroundColor: candidate.partyColor + "20",
                  borderColor: candidate.partyColor,
                }}
              >
                {candidate.photo && (candidate.photo.startsWith("http") || candidate.photo.startsWith("/")) ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.shortName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    className="h-5 w-5"
                    style={{ color: candidate.partyColor }}
                  />
                )}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {candidate.shortName}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-mono text-sm font-bold tabular-nums">
                      {candidate.pollAverage.toFixed(1)}%
                    </span>
                    {candidate.pollTrend === "up" && (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    {candidate.pollTrend === "down" && (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    {candidate.pollTrend === "stable" && (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {/* Animated bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: candidate.partyColor }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(candidate.pollAverage / maxPoll) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08 + 0.2,
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  {candidate.party}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 2: CONÓCELOS EN 30 SEGUNDOS
   ═══════════════════════════════════════════════════════════════════════════ */

function ConocelosBlock({
  candidates,
  scrollRef,
  trackEvent,
}: {
  candidates: Candidate[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  trackEvent: (
    event: string,
    target: string,
    metadata?: Record<string, unknown>
  ) => void;
}) {
  const country = useCountry();
  return (
    <section>
      <h2 className="text-lg font-extrabold text-foreground mb-1">
        Conócelos en 30 segundos
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Desliza para ver a los candidatos →
      </p>

      <div
        ref={scrollRef}
        className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {candidates.map((candidate, index) => {
          const starProposal = candidate.keyProposals[0];
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                href={`/${country.code}/candidatos/${candidate.slug}`}
                onClick={() =>
                  trackEvent("click", "resumen_candidate_card", {
                    candidate: candidate.slug,
                  })
                }
                className="block w-56 flex-shrink-0 snap-start rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md active:scale-[0.98]"
              >
                {/* Top color band */}
                <div
                  className="h-1 w-full rounded-full mb-3"
                  style={{ backgroundColor: candidate.partyColor }}
                />

                {/* Photo + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 overflow-hidden flex-shrink-0"
                    style={{
                      backgroundColor: candidate.partyColor + "20",
                      borderColor: candidate.partyColor,
                    }}
                  >
                    {candidate.photo && (candidate.photo.startsWith("http") || candidate.photo.startsWith("/")) ? (
                      <img
                        src={candidate.photo}
                        alt={candidate.shortName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User
                        className="h-6 w-6"
                        style={{ color: candidate.partyColor }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {candidate.shortName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {candidate.party}
                    </p>
                  </div>
                </div>

                {/* Star proposal */}
                {starProposal && (
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                    💡 {starProposal.title}
                  </p>
                )}

                {/* "Ver mas" link hint */}
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary">
                  Ver perfil
                  <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE: QUIZ CTA — Compact horizontal card (high-conversion position)
   ═══════════════════════════════════════════════════════════════════════════ */

function QuizCTACompact({
  trackEvent,
}: {
  trackEvent: (
    event: string,
    target: string,
    metadata?: Record<string, unknown>
  ) => void;
}) {
  const country = useCountry();
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Link
        href={`/${country.code}/quiz`}
        onClick={() => trackEvent("click", "quiz_cta_compact")}
        className="group flex items-center gap-3 sm:gap-4 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent px-4 py-3.5 transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
      >
        <span className="text-2xl sm:text-3xl shrink-0">🗳️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">
            ¿No sabes por quién votar?
          </p>
          <p className="text-[11px] text-muted-foreground">
            10 preguntas · 2 minutos
          </p>
        </div>
        <Button size="sm" className="shrink-0 font-semibold shadow-sm">
          Quiz
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </Link>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 4: ¿QUÉ PASÓ HOY?
   ═══════════════════════════════════════════════════════════════════════════ */

const factCheckConfig: Record<
  string,
  { label: string; className: string; Icon: typeof ShieldCheck }
> = {
  verified: {
    label: "Verificado",
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
    Icon: ShieldCheck,
  },
  questionable: {
    label: "Cuestionable",
    className: "text-amber-600 bg-amber-50 border-amber-200",
    Icon: AlertTriangle,
  },
  false: {
    label: "Falso",
    className: "text-rose-600 bg-rose-50 border-rose-200",
    Icon: AlertTriangle,
  },
};

function NoticiasBlock({ articles }: { articles: NewsArticle[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-rose-500 pulse-dot" />
        <h2 className="text-lg font-extrabold text-foreground">¿Qué pasó hoy?</h2>
      </div>

      <div className="space-y-3">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            {article.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50 border-l-[3px]",
                  article.factCheck === "verified"
                    ? "border-l-emerald-500"
                    : article.factCheck === "questionable"
                      ? "border-l-amber-500"
                      : article.factCheck === "false"
                        ? "border-l-rose-500"
                        : "border-l-border"
                )}
              >
                <NewsItemContent article={article} />
              </a>
            ) : (
              <div
                className={cn(
                  "rounded-xl border border-border bg-card p-4 border-l-[3px]",
                  article.factCheck === "verified"
                    ? "border-l-emerald-500"
                    : article.factCheck === "questionable"
                      ? "border-l-amber-500"
                      : article.factCheck === "false"
                        ? "border-l-rose-500"
                        : "border-l-border"
                )}
              >
                <NewsItemContent article={article} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay noticias recientes
        </p>
      )}
    </section>
  );
}

function NewsItemContent({ article }: { article: NewsArticle }) {
  const config = article.factCheck
    ? factCheckConfig[article.factCheck]
    : null;

  const sourceInitial = article.source?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex items-start gap-3">
      {/* Source initial avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground mt-0.5">
        {sourceInitial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11px] text-muted-foreground">
            {article.source} · {article.time}
          </p>
          {config && (
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] gap-0.5 border h-4 px-1.5",
                config.className
              )}
            >
              <config.Icon className="h-2.5 w-2.5" />
              {config.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
