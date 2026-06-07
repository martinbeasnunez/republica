"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Calendar,
  FileText,
  Scale,
  Scan,
  ShieldAlert,
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
import { CondorAIHero } from "./en-vivo/condor-ai-hero";
import { RegistraduriaResults } from "./en-vivo/registraduria-results";
import { useAnalytics } from "@/hooks/use-analytics";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import { getElectionCountdown, type ElectoralEvent } from "@/lib/config/countries";
import dynamic from "next/dynamic";
import type { HomepageBlock } from "@/lib/types/homepage-blocks";

const DashboardClient = dynamic(() => import("./dashboard-client"), {
  loading: () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card h-64 animate-pulse" />
      <div className="rounded-2xl border border-border bg-card h-48 animate-pulse" />
    </div>
  ),
});

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
  activeEvent?: ElectoralEvent | null;
  nextEvent?: ElectoralEvent | null;
  recentEvent?: ElectoralEvent | null;
}

export default function HomeClient({
  candidates,
  topCandidates,
  articles,
  factChecks,
  briefing,
  homepageBlocks,
  activeEvent,
  nextEvent,
  recentEvent,
}: HomeClientProps) {
  const { trackEvent } = useAnalytics();
  const country = useCountry();
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultMode: DashboardMode = "light";
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

      {mode === "light" ? (
        <div className="space-y-8">
          {/* ═══ CONDOR AI Hero — only CO for now (PE está en runoff/post) ═══ */}
          {country.code === "co" && (
            <CondorAIHero
              candidates={topCandidates}
              articles={articles}
              factChecks={factChecks}
              briefing={briefing ?? null}
            />
          )}

          {/* ═══ Preconteo Registraduría — víspera/día E CO ═══
              Se muestra desde D-1 para que la gente vea el "modo elección" anticipado.
              El componente trae su propio estado "Preconteo aún no inicia" hasta 4 p.m. */}
          {country.code === "co" && getElectionCountdown(country.code) <= 1 && (
            <RegistraduriaResults />
          )}

          {briefing && (briefing._ageHours ?? 0) < 48 ? (
            <HeroBriefing
              briefing={briefing}
              topCandidates={topCandidates}
              articles={articles}
              factChecks={factChecks}
              activeEvent={activeEvent}
              nextEvent={nextEvent}
              recentEvent={recentEvent}
            />
          ) : (
            <HeroBriefingEmpty />
          )}

          {/* Plans — AI-powered comparison */}
          <PlansShowcase topCandidates={topCandidates} trackEvent={trackEvent} />

          {/* Radiografia CTA */}
          <RadiografiaCTA topCandidates={topCandidates} trackEvent={trackEvent} />

          {/* Race + Stories */}
          <RaceAndStories
            topCandidates={topCandidates}
            articles={articles}
            briefing={briefing ?? null}
          />

          {/* DYNAMIC BLOCKS (AI-curated) */}
          {homepageBlocks && homepageBlocks.length > 0 && (
            <DynamicBlocks blocks={homepageBlocks} />
          )}

          <WhatsAppCTA context="default" />
        </div>
      ) : (
        <DashboardClient
          candidates={candidates}
          topCandidates={topCandidates}
          articles={articles}
          factChecks={factChecks}
          briefing={briefing}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO BRIEFING — Premium editorial design, AI-first
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroBriefing({
  briefing,
  topCandidates,
  articles,
  factChecks,
  activeEvent,
  nextEvent,
  recentEvent,
}: {
  briefing: PublicBriefing;
  topCandidates: Candidate[];
  articles: NewsArticle[];
  factChecks: FactCheck[];
  activeEvent?: ElectoralEvent | null;
  nextEvent?: ElectoralEvent | null;
  recentEvent?: ElectoralEvent | null;
}) {
  const country = useCountry();
  const daysToElection = getElectionCountdown(country.code);

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = briefing._isToday ?? briefing.briefing_date === todayStr;

  const electionDate = country.electionDate
    ? new Date(country.electionDate + "T12:00:00")
    : new Date("2026-04-12T12:00:00");
  const electionDateFormatted = electionDate.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
  });

  const urgencyColor =
    daysToElection <= 7 ? "text-rose" :
    daysToElection <= 14 ? "text-primary" :
    daysToElection <= 30 ? "text-amber-600" :
    "text-foreground";

  const leader = topCandidates[0];
  const uniqueSources = new Set(articles.map((a) => a.source)).size;

  // Parse editorial into lede + body
  const fullText = (briefing.editorial_summary || "").trim();
  const firstDot = fullText.indexOf(". ");
  const lede = firstDot > 0 ? fullText.slice(0, firstDot + 1) : fullText;
  const body = firstDot > 0 ? fullText.slice(firstDot + 2) : "";

  // Top stories
  const stories = briefing.top_stories?.slice(0, 3) || [];
  const fallbackArticles = articles.slice(0, 3);
  // Build stories with candidate photo matching
  const matchCandidatePhoto = (title: string): string | null => {
    for (const c of topCandidates) {
      const names = [c.shortName.toLowerCase(), ...(c.name?.toLowerCase().split(" ") || [])];
      if (names.some((n) => n.length > 3 && title.toLowerCase().includes(n))) {
        return c.photo || null;
      }
    }
    return null;
  };

  const displayStories = stories.length > 0
    ? stories.map((s) => ({ title: s.title, source: s.source, photo: matchCandidatePhoto(s.title) }))
    : fallbackArticles.map((a) => ({ title: a.title, source: a.source || "", photo: matchCandidatePhoto(a.title) }));

  // Radar — pick the most recent FALSO/ENGANOSO fact check to feature
  const latestFalseClaim = factChecks.find(
    (fc) => fc.verdict === "FALSO" || fc.verdict === "ENGANOSO"
  );

  // Urgency bar progress
  const urgencyBarColor =
    daysToElection <= 7 ? "#dc2626" :
    daysToElection <= 14 ? "#8B1A1A" :
    daysToElection <= 30 ? "#b45309" :
    "#94a3b8";
  const urgencyProgress = Math.max(5, Math.min(100, ((90 - daysToElection) / 90) * 100));

  // Split editorial into sentences for visual hierarchy
  const sentences = fullText.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* ═══ EVENT BANNER — EN VIVO / PRÓXIMO / COMPLETADO ═══ */}
      {activeEvent && (
        <Link href={`/${country.code}/en-vivo`}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-950 to-red-900 px-5 sm:px-7 py-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-white pulse-dot" />
                  <span className="text-[11px] font-bold text-white tracking-wide">EN VIVO</span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold text-white truncate">{activeEvent.title}</p>
                  <p className="text-[11px] text-red-200/80">
                    {activeEvent.organizer} · {activeEvent.startTime} — {activeEvent.endTime}
                    {activeEvent.topics?.length ? ` · ${activeEvent.topics.join(", ")}` : ""}
                  </p>
                </div>
              </div>
              <span className="flex-shrink-0 text-xs font-bold text-white bg-white/15 rounded-full px-4 py-2 group-hover:bg-white/25 transition-colors whitespace-nowrap">
                Ver en vivo →
              </span>
            </div>
            {activeEvent.broadcastChannels && (
              <p className="text-[10px] text-red-300/60 mt-2 font-mono">
                Transmite: {activeEvent.broadcastChannels.join(" · ")}
              </p>
            )}
          </motion.div>
        </Link>
      )}

      {!activeEvent && nextEvent && (
        <Link href={`/${country.code}/en-vivo`}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-50 to-orange-50 px-5 sm:px-7 py-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1">
                  <Calendar className="h-3 w-3 text-white" />
                  <span className="text-[11px] font-bold text-white tracking-wide">PRÓXIMO</span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold text-stone-800 truncate">{nextEvent.title}</p>
                  <p className="text-[11px] text-stone-500">
                    {new Date(nextEvent.date + "T12:00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                    {" · "}{nextEvent.startTime}h
                    {nextEvent.topics?.length ? ` · ${nextEvent.topics.join(", ")}` : ""}
                  </p>
                </div>
              </div>
              <span className="flex-shrink-0 text-xs font-bold text-amber-700 bg-amber-200/50 rounded-full px-4 py-2 group-hover:bg-amber-200/80 transition-colors whitespace-nowrap">
                Ver detalles →
              </span>
            </div>
          </motion.div>
        </Link>
      )}

      {!activeEvent && !nextEvent && recentEvent && (
        <Link href={`/${country.code}/en-vivo`}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-5 sm:px-7 py-3 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-stone-700">
                <span className="text-emerald-700 font-bold">{recentEvent.title}</span>
                {" · Revisa el análisis de CONDOR AI →"}
              </p>
            </div>
          </motion.div>
        </Link>
      )}

      {/* ═══ BLOCK 1: COUNTDOWN + AI EDITORIAL ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">

        {/* ── Row 1: Countdown hero + branding ── */}
        <div className="flex items-center gap-5 sm:gap-8 px-5 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-border/50">
          {/* Countdown — big and visual */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Faltan
            </span>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className={cn(
                "text-5xl sm:text-6xl font-mono font-black tabular-nums leading-none mt-1",
                urgencyColor
              )}
            >
              {daysToElection}
            </motion.span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              días
            </span>
            <div className="w-20 h-1.5 rounded-full bg-muted mt-2.5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: urgencyBarColor }}
                initial={{ width: 0 }}
                animate={{ width: `${urgencyProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground/60 mt-1.5">
              {electionDateFormatted}
            </span>
          </div>

          {/* Branding + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                Lo que CONDOR AI detecta
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {new Date(briefing.briefing_date + "T12:00:00").toLocaleDateString(
                "es-PE",
                { weekday: "long", day: "numeric", month: "long" }
              )}
              {" · "}
              {articles.length} noticias de {uniqueSources} fuentes analizadas
            </p>
            {/* Status + methodology */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1",
                isToday
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-amber-50 border border-amber-200"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isToday ? "bg-emerald-500 pulse-dot" : "bg-amber-500"
                )} />
                <span className={cn(
                  "text-[10px] font-mono font-medium",
                  isToday ? "text-emerald-700" : "text-amber-700"
                )}>
                  {isToday ? "ACTUALIZADO HOY" : "ÚLTIMO ANÁLISIS"}
                </span>
              </div>
              <Link
                href={`/${country.code}/metodologia`}
                className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ¿Cómo funciona?
              </Link>
            </div>
          </div>
        </div>

        {/* ── Row 2: Editorial — the soul, with visual hierarchy ── */}
        <div className="px-5 sm:px-7 py-6 sm:py-7">
          {sentences.length > 0 ? (
            <div className="space-y-5">
              {/* First sentence — THE HOOK, biggest */}
              <p className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight">
                {sentences[0]}
              </p>

              {/* Remaining sentences — each as its own block for readability */}
              {sentences.length > 1 && (
                <div className="border-l-3 border-primary/20 pl-5 space-y-3">
                  {sentences.slice(1).map((sentence, i) => (
                    <p key={i} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {sentence}
                    </p>
                  ))}
                </div>
              )}

              {/* Key movements — visual pills linking to encuestas */}
              {briefing.poll_movements && briefing.poll_movements.length > 0 && (
                <Link href={`/${country.code}/encuestas`} className="block group">
                  <div className="flex flex-wrap gap-2 pt-2">
                    {briefing.poll_movements
                      .filter((m) => m.direction !== "stable")
                      .slice(0, 4)
                      .map((m, i) => {
                        const delta = Math.abs(m.current - m.previous).toFixed(1);
                        const isUp = m.direction === "up";
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all group-hover:shadow-sm",
                              isUp
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-rose-50 border-rose-200 text-rose-700"
                            )}
                          >
                            {isUp ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span className="font-semibold">{m.candidate}</span>
                            <span className="font-mono tabular-nums">
                              {isUp ? "+" : "-"}{delta}pp
                            </span>
                          </div>
                        );
                      })}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                      Ver encuestas <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-base text-muted-foreground">
                CONDOR AI está procesando la información del día...
              </p>
              <div className="flex items-center justify-center gap-2 pt-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
                <span className="text-[10px] font-mono text-emerald-600 font-medium">
                  PROCESANDO
                </span>
              </div>
            </div>
          )}

          {/* Fact-check spotlight — show 1 specific false claim */}
          {latestFalseClaim && (
            <Link
              href={`/${country.code}/verificador`}
              className="group flex items-start gap-3 rounded-lg bg-red-50/80 border border-red-200/60 px-4 py-3 mt-5 hover:bg-red-50 transition-colors"
            >
              <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center h-5 w-12 rounded-full bg-red-600 text-[10px] font-bold text-white tracking-wide">
                FALSO
              </span>
              <span className="text-sm text-stone-700 leading-snug line-clamp-2 group-hover:text-stone-900">
                &ldquo;{latestFalseClaim.claim.length > 120 ? latestFalseClaim.claim.slice(0, 120) + "..." : latestFalseClaim.claim}&rdquo;
                {latestFalseClaim.claimant && latestFalseClaim.claimant !== "Desconocido" && latestFalseClaim.claimant !== "No especificado" && (
                  <span className="text-stone-400"> — {latestFalseClaim.claimant}</span>
                )}
              </span>
              <span className="flex-shrink-0 text-xs text-red-600 font-semibold mt-0.5 group-hover:underline whitespace-nowrap">
                Ver más →
              </span>
            </Link>
          )}

          {/* Pilares CTA — CONDOR AI invites you to explore */}
          <Link
            href={`/${country.code}/pilares`}
            className="group flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary/[0.04] to-primary/[0.08] border border-primary/10 px-5 py-4 mt-5 hover:border-primary/25 transition-all"
          >
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {daysToElection <= 21
                  ? `A ${daysToElection} días: ¿qué proponen los candidatos?`
                  : "¿Qué proponen los candidatos en cada tema clave?"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                CONDOR AI analiza {topCandidates.length > 0 ? topCandidates.length : 8} candidatos en 10 pilares: economía, seguridad, salud, educación y más
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
          </Link>
        </div>
      </div>

    </motion.section>
  );
}

/* ── Empty state when no briefing ── */

function HeroBriefingEmpty() {
  const country = useCountry();
  const daysToElection = getElectionCountdown(country.code);

  const electionDate = country.electionDate
    ? new Date(country.electionDate + "T12:00:00")
    : new Date("2026-04-12T12:00:00");
  const electionDateFormatted = electionDate.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-5 sm:px-7 py-8 sm:py-10">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
              <Brain className="h-4.5 w-4.5 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Lo que CONDOR AI detecta
            </h2>
          </div>
          <div className="text-center space-y-3 py-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                Faltan
              </span>
              <span className={cn(
                "text-4xl sm:text-5xl font-mono font-bold tabular-nums leading-none",
                daysToElection <= 30 ? "text-primary" : "text-foreground"
              )}>
                {daysToElection}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                días · {electionDateFormatted}
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              CONDOR AI está procesando la información del día...
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
              <span className="text-[10px] font-mono text-emerald-600 font-medium">
                MONITOREO ACTIVO
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE: CANDIDATOS — foto + encuesta + propuesta en una sola sección
   ═══════════════════════════════════════════════════════════════════════════ */

function CandidatosBlock({
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
  const maxPoll = candidates[0]?.pollAverage || 15;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Los candidatos
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Promedio {country.pollsters.slice(0, 3).join(", ")}
          </p>
        </div>
        <Link
          href={`/${country.code}/candidatos`}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
        >
          Ver todos
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {candidates.map((candidate, index) => {
          const starProposal = candidate.keyProposals[0];
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <Link
                href={`/${country.code}/candidatos/${candidate.slug}`}
                onClick={() =>
                  trackEvent("click", "candidatos_block_card", {
                    candidate: candidate.slug,
                  })
                }
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.995]"
              >
                {/* Photo */}
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 overflow-hidden"
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <span className="text-base font-semibold text-foreground truncate block group-hover:text-primary transition-colors">
                        {candidate.shortName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {candidate.party}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <span className="font-mono text-lg font-bold tabular-nums">
                        {candidate.pollAverage.toFixed(1)}%
                      </span>
                      {candidate.pollTrend === "up" && (
                        <TrendingUp className="h-4 w-4 text-emerald" />
                      )}
                      {candidate.pollTrend === "down" && (
                        <TrendingDown className="h-4 w-4 text-rose" />
                      )}
                      {candidate.pollTrend === "stable" && (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {/* Poll bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted mt-1.5 mb-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: candidate.partyColor }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(candidate.pollAverage / maxPoll) * 100}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.06 + 0.2,
                      }}
                    />
                  </div>
                  {/* Key proposal */}
                  {starProposal && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      💡 {starProposal.title}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
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
          <p className="text-xs text-muted-foreground">
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
   BLOQUE: PLANES DE GOBIERNO — Topic comparison showcase
   ═══════════════════════════════════════════════════════════════════════════ */

const TOPIC_ICONS: Record<string, { icon: string; label: string }> = {
  seguridad: { icon: "🛡️", label: "Seguridad" },
  economia: { icon: "📊", label: "Economía" },
  educacion: { icon: "🎓", label: "Educación" },
  salud: { icon: "🏥", label: "Salud" },
  anticorrupcion: { icon: "⚖️", label: "Anticorrupción" },
  infraestructura: { icon: "🚆", label: "Infraestructura" },
  medioambiente: { icon: "🌿", label: "Medio ambiente" },
};

function PlansShowcase({
  topCandidates,
  trackEvent,
}: {
  topCandidates: Candidate[];
  trackEvent: (event: string, target: string, metadata?: Record<string, unknown>) => void;
}) {
  const country = useCountry();
  const [activeTopic, setActiveTopic] = useState<string>("seguridad");
  const top3 = topCandidates.slice(0, 3);
  if (top3.length === 0) return null;

  // Collect all unique topics from top 3
  const allTopics = new Set<string>();
  top3.forEach((c) =>
    (c.keyProposals || []).forEach((p) => {
      if (p.category) allTopics.add(p.category);
    })
  );
  const topics = Array.from(allTopics).slice(0, 5);

  // Get proposal for a candidate on the active topic
  const getProposalForTopic = (c: Candidate) => {
    return (c.keyProposals || []).find((p) => p.category === activeTopic);
  };

  const activeTopicInfo = TOPIC_ICONS[activeTopic] || { icon: "📋", label: activeTopic };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header with overlapping candidate photos */}
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Stacked candidate photos */}
          <div className="flex -space-x-3 flex-shrink-0">
            {top3.map((c, i) => (
              c.photo ? (
                <img
                  key={c.id}
                  src={c.photo}
                  alt={c.shortName}
                  className="h-10 w-10 rounded-full object-cover border-2 border-card"
                  style={{ zIndex: 3 - i }}
                />
              ) : (
                <div
                  key={c.id}
                  className="h-10 w-10 rounded-full bg-muted border-2 border-card flex items-center justify-center"
                  style={{ zIndex: 3 - i }}
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-foreground leading-tight">
              ¿En qué se diferencian?
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Elige un tema · compara propuestas reales
            </p>
          </div>
        </div>
      </div>

      {/* Topic pills */}
      <div className="px-5 sm:px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {topics.map((topic) => {
          const info = TOPIC_ICONS[topic] || { icon: "📋", label: topic };
          const isActive = topic === activeTopic;
          return (
            <button
              key={topic}
              onClick={() => {
                setActiveTopic(topic);
                trackEvent("click", "plans_topic", { topic });
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              <span className="text-sm">{info.icon}</span>
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Comparison cards */}
      <div className="px-5 sm:px-6 pb-5 space-y-3">
        {top3.map((c, i) => {
          const proposal = getProposalForTopic(c);
          return (
            <Link
              key={c.id}
              href={`/${country.code}/candidatos/${c.slug}`}
              onClick={() => trackEvent("click", "plans_candidate_card", { candidate: c.shortName })}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-background/50 p-3.5 transition-all hover:border-primary/20 hover:shadow-sm relative overflow-hidden"
            >
              {/* Left color accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: c.partyColor }}
              />
              {/* Photo */}
              {c.photo ? (
                <img
                  src={c.photo}
                  alt={c.shortName}
                  className="h-11 w-11 rounded-full object-cover flex-shrink-0 border-2 ml-1"
                  style={{ borderColor: c.partyColor + "40" }}
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ml-1">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {c.shortName}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                    {c.pollAverage?.toFixed(1)}%
                  </span>
                </div>
                {proposal ? (
                  <>
                    <p className="text-sm font-medium text-foreground/80 mt-1 leading-snug">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {proposal.summary}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">
                    Sin propuesta específica en {activeTopicInfo.label.toLowerCase()}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-3 group-hover:text-primary transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Footer — dual CTA */}
      <div className="grid grid-cols-2 border-t border-border/60">
        <Link
          href={`/${country.code}/planes`}
          onClick={() => trackEvent("click", "plans_all")}
          className="flex items-center justify-center gap-2 px-4 py-3.5 transition-colors hover:bg-muted/50 border-r border-border/60"
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Ver planes
          </span>
        </Link>
        <Link
          href={`/${country.code}/planes/comparar`}
          onClick={() => trackEvent("click", "plans_compare_cta")}
          className="flex items-center justify-center gap-2 px-4 py-3.5 bg-primary/[0.04] transition-colors hover:bg-primary/[0.08]"
        >
          <Scale className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-primary">
            Comparar lado a lado
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
        </Link>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE: CARRERA ELECTORAL + LO + IMPORTANTE
   ═══════════════════════════════════════════════════════════════════════════ */

function RaceAndStories({
  topCandidates,
  articles,
  briefing,
}: {
  topCandidates: Candidate[];
  articles: NewsArticle[];
  briefing: PublicBriefing | null;
}) {
  const country = useCountry();
  const leader = topCandidates[0] || null;

  // Build stories with candidate photo matching
  const matchCandidatePhoto = (title: string): string | null => {
    for (const c of topCandidates) {
      const names = [c.shortName.toLowerCase(), ...(c.name?.toLowerCase().split(" ") || [])];
      if (names.some((n) => n.length > 3 && title.toLowerCase().includes(n))) {
        return c.photo || null;
      }
    }
    return null;
  };

  const stories = briefing?.top_stories?.slice(0, 3) || [];
  const fallbackArticles = articles.slice(0, 3);
  const displayStories = stories.length > 0
    ? stories.map((s) => ({ title: s.title, source: s.source, photo: matchCandidatePhoto(s.title) }))
    : fallbackArticles.map((a) => ({ title: a.title, source: a.source || "", photo: matchCandidatePhoto(a.title) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Race — 3 cols */}
      {topCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                Carrera electoral
              </span>
            </div>
            <Link
              href={`/${country.code}/encuestas`}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
            >
              Encuestas
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3.5">
            {topCandidates.slice(0, 5).map((c, i) => (
              <Link
                key={c.id}
                href={`/${country.code}/candidatos/${c.slug}`}
                className="group flex items-center gap-3 hover:bg-muted/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 overflow-hidden"
                  style={{
                    borderColor: c.partyColor,
                    backgroundColor: c.partyColor + "15",
                  }}
                >
                  {c.photo && (c.photo.startsWith("http") || c.photo.startsWith("/")) ? (
                    <img src={c.photo} alt={c.shortName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" style={{ color: c.partyColor }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {c.shortName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                      {c.party}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mt-1.5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.partyColor }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${leader ? (c.pollAverage / (leader.pollAverage * 1.3)) * 100 : 0}%`,
                      }}
                      transition={{ duration: 0.8, delay: i * 0.08 + 0.2 }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-base font-mono tabular-nums font-bold text-foreground">
                    {c.pollAverage.toFixed(1)}%
                  </span>
                  {c.pollTrend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                  {c.pollTrend === "down" && <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                  {c.pollTrend === "stable" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </Link>
            ))}
          </div>
          {leader && (
            <p className="text-[11px] text-muted-foreground pt-3 mt-3 border-t border-border/50">
              {leader.pollAverage < 15
                ? "Elección abierta — ningún candidato supera el 15%"
                : `${leader.shortName} lidera con ${leader.pollAverage.toFixed(1)}%`}
            </p>
          )}
        </motion.div>
      )}

      {/* Stories — 2 cols */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-bold text-foreground">
              Lo + importante
            </span>
          </div>
          <Link
            href={`/${country.code}/noticias`}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
          >
            Noticias
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {displayStories.length > 0 ? (
          <div className="space-y-4">
            {displayStories.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                {s.photo ? (
                  <img
                    src={s.photo}
                    alt={`Candidato mencionado en: ${s.title}`}
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-0.5 border border-border"
                  />
                ) : (
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {s.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            CONDOR está monitoreando
          </p>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE: RADIOGRAFÍA — Investigative dossier CTA
   ═══════════════════════════════════════════════════════════════════════════ */

function RadiografiaCTA({
  topCandidates,
  trackEvent,
}: {
  topCandidates: Candidate[];
  trackEvent: (event: string, target: string, metadata?: Record<string, unknown>) => void;
}) {
  const country = useCountry();
  const top5 = topCandidates.slice(0, 5);
  if (top5.length === 0) return null;

  const hasControversies = top5.filter((c) => c.hasLegalIssues).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Link
        href={`/${country.code}/radiografia`}
        onClick={() => trackEvent("click", "radiografia_cta")}
        className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

        <div className="px-5 sm:px-6 py-5">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-stone-100 dark:bg-stone-800">
              <Scan className="h-5 w-5 text-stone-600 dark:text-stone-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Radiografía de candidatos
              </h3>
              <p className="text-xs text-muted-foreground">
                Investigación verificada con fuentes públicas
              </p>
            </div>
          </div>

          {/* Candidate strip — mugshot row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              {top5.map((c, i) => (
                c.photo ? (
                  <div key={c.id} className="relative" style={{ zIndex: 5 - i }}>
                    <img
                      src={c.photo}
                      alt={c.shortName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-card"
                    />
                    {c.hasLegalIssues && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 border-2 border-card flex items-center justify-center">
                        <ShieldAlert className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={c.id}
                    className="h-12 w-12 rounded-full bg-muted border-2 border-card flex items-center justify-center"
                    style={{ zIndex: 5 - i }}
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-mono tabular-nums text-foreground font-bold text-sm">
                {top5.length}
              </span>{" "}
              candidatos investigados
              {hasControversies > 0 && (
                <>
                  {" · "}
                  <span className="text-amber-600 font-medium">
                    {hasControversies} con alertas
                  </span>
                </>
              )}
            </div>
          </div>

          {/* What you get */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Trayectoria", icon: "📋" },
              { label: "Controversias", icon: "⚠️" },
              { label: "Historial legal", icon: "⚖️" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-2"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-800/50 px-4 py-3 group-hover:bg-primary/5 transition-colors">
            <span className="text-sm font-semibold text-foreground">
              Conoce a fondo a tu candidato
            </span>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 4: ÚLTIMAS NOTICIAS
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
      <div className="flex items-center gap-2 mb-5">
        <span className="h-2 w-2 rounded-full bg-rose-500 pulse-dot" />
        <h2 className="text-xl font-bold text-foreground">Últimas noticias</h2>
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground mt-0.5">
        {sourceInitial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <p className="text-xs text-muted-foreground">
            {article.source} · {article.time}
          </p>
          {config && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] gap-0.5 border h-5 px-2",
                config.className
              )}
            >
              <config.Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
