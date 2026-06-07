"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronRight, Zap, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCountry } from "@/lib/config/country-context";
import type { Candidate } from "@/lib/data/candidates";
import type { NewsArticle } from "@/lib/data/news";
import type { FactCheck } from "@/lib/data/fact-checks";
import type { PublicBriefing } from "../page";

// =============================================================================
// CONDOR AI Hero — typing-effect lede as the centerpiece.
//
// The lede picks the freshest signal we have, in this order:
//   1. Brain briefing for today (Brain cron runs once a day at 8 a.m. Bogotá)
//   2. Live Registraduría preconteo state (when phase=election-day for CO)
//   3. Stale-day disclaimer ("CONDOR AI está procesando…")
//
// No predictions, no probabilities — Colombian audience explicitly nope'd
// that, and during veda electoral it would be illegal anyway.
// =============================================================================

interface AIHeroProps {
  candidates: Candidate[];
  articles: NewsArticle[];
  factChecks: FactCheck[];
  briefing: PublicBriefing | null;
}

// ── Source labels we surface in the meta line above the lede ────────────────
type LedeSource =
  | { kind: "brain"; date: string } // briefing matches local date
  | { kind: "live-registraduria"; stamp: number } // hero generated from preconteo
  | { kind: "fallback" }; // briefing stale, no live data yet

/** Take the first N sentences for the typing pass. */
function firstSentences(text: string, max = 1): string {
  const parts = text.split(/(?<=\.)\s+/).slice(0, max);
  return parts.join(" ").trim();
}

function formatLocalDate(iso: string | undefined, locale: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "long" });
}

// ── Live preconteo lede generator ───────────────────────────────────────────
interface RgSnapshot {
  candidates: Array<{ displayName: string; votes: number; percentage: number }>;
  progress: { percentage: number; counted: number; total: number; updatedAt: number };
}

function ledeFromPreconteo(snap: RgSnapshot | null, country: { electionDateSecondRound?: string; locale: string }): string | null {
  if (!snap) return null;
  const { progress, candidates } = snap;
  const fmt = new Intl.NumberFormat(country.locale.replace("_", "-"));
  // 0% scrutinized — distinguish "voting in progress" vs "closing, awaiting first boletín"
  if (progress.percentage === 0) {
    const nowHour = new Date().toLocaleString("en-US", { timeZone: "America/Bogota", hour: "numeric", hour12: false });
    const h = parseInt(nowHour, 10);
    if (Number.isFinite(h) && h >= 16) {
      return "Puestos de votación cerrados. Registraduría arranca con el preconteo — primeros boletines en minutos.";
    }
    return "Hoy domingo 31 de mayo, Colombia elige. Los puestos de votación cierran a las 4:00 p.m. hora colombiana.";
  }

  // We have actual progress — surface the top two and the % escrutado
  const top = candidates[0];
  const second = candidates[1];
  if (!top) {
    return `Preconteo en curso. ${progress.percentage.toFixed(1)}% de las mesas escrutadas (${fmt.format(progress.counted)} de ${fmt.format(progress.total)}).`;
  }

  // 100% scrutinized: outright winner vs runoff
  if (progress.percentage >= 99.99) {
    if (top.percentage > 50) {
      return `Conteo cerrado. ${top.displayName} gana la presidencia con el ${top.percentage.toFixed(2)}% de los votos válidos.`;
    }
    if (second) {
      const runoffDate = country.electionDateSecondRound
        ? new Date(country.electionDateSecondRound + "T12:00:00").toLocaleDateString(country.locale.replace("_", "-"), { day: "numeric", month: "long" })
        : "junio";
      return `Conteo cerrado. Segunda vuelta el ${runoffDate}: ${top.displayName} (${top.percentage.toFixed(2)}%) vs ${second.displayName} (${second.percentage.toFixed(2)}%).`;
    }
  }

  // Mid-count: factual one-liner with the leader and runner-up
  if (second) {
    return `Preconteo en curso. ${progress.percentage.toFixed(1)}% de mesas escrutadas. ${top.displayName} lidera con ${top.percentage.toFixed(2)}%, ${second.displayName} con ${second.percentage.toFixed(2)}%.`;
  }
  return `Preconteo en curso. ${progress.percentage.toFixed(1)}% de mesas escrutadas. ${top.displayName} con ${top.percentage.toFixed(2)}%.`;
}

/** Insights derivados de los datos que YA cargamos. */
function buildInsights(args: {
  articles: NewsArticle[];
  factChecks: FactCheck[];
  candidates: Candidate[];
}) {
  const { articles, factChecks } = args;
  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recent = articles.filter((a) => {
    const t = a.time ? new Date(a.time).getTime() : NaN;
    return Number.isFinite(t) && t >= last24h;
  });
  const sources = new Set(recent.map((a) => a.source));
  const falseFC = factChecks.filter((f) => f.verdict === "FALSO" || f.verdict === "ENGANOSO").length;
  const verifiedFC = factChecks.filter((f) => f.verdict === "VERDADERO").length;
  const breakingCount = recent.filter((a) => a.isBreaking).length;
  const insights: Array<{ icon: typeof Activity; text: string }> = [];
  if (recent.length > 0) {
    insights.push({ icon: Activity, text: `${recent.length} noticias procesadas en últimas 24h de ${sources.size} fuentes` });
  }
  if (falseFC > 0) {
    insights.push({ icon: Zap, text: `${falseFC} afirmaciones marcadas como engañosas o falsas` });
  }
  if (verifiedFC > 0) {
    insights.push({ icon: ShieldCheck, text: `${verifiedFC} afirmaciones verificadas como ciertas` });
  }
  if (breakingCount > 0) {
    insights.push({ icon: Zap, text: `${breakingCount} ${breakingCount === 1 ? "alerta" : "alertas"} de última hora detectadas` });
  }
  return insights;
}

export function CondorAIHero({ candidates, articles, factChecks, briefing }: AIHeroProps) {
  const country = useCountry();
  const searchParams = useSearchParams();
  const phaseOverride = searchParams?.get("phase");
  const locale = country.locale.replace("_", "-");
  const insights = useMemo(() => buildInsights({ articles, factChecks, candidates }), [articles, factChecks, candidates]);

  // Calendar phase derived from the user's country tz. `?phase=election-day`
  // and `?phase=post` let us preview the day-of layout before D-day.
  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: country.timezone });
  const realIsElectionDay = todayLocal === country.electionDate;
  const realIsPostElection = todayLocal > country.electionDate;
  const isElectionDay = phaseOverride === "election-day" ? true : realIsElectionDay;
  const isPostElection = phaseOverride === "post" ? true : realIsPostElection;
  const isCO = country.code === "co";

  // Briefing freshness — Brain is supposed to run daily ~8 a.m. Bogotá. If the
  // briefing_date doesn't match today, we treat it as stale and fall back.
  const briefingFresh = briefing?.briefing_date === todayLocal;

  // ── Live preconteo poll (CO + election-day or past) ───────────────────────
  // Only fetches when we'd actually use it. Polls every 3 minutes to track the
  // Registraduría upstream (which itself updates every few seconds).
  const useLivePreconteo = isCO && (isElectionDay || isPostElection);
  const [snap, setSnap] = useState<RgSnapshot | null>(null);
  const fetchSnap = useCallback(async () => {
    if (!useLivePreconteo) return;
    try {
      const res = await fetch("/api/registraduria-results");
      if (!res.ok) return;
      const json = (await res.json()) as RgSnapshot;
      setSnap(json);
    } catch {
      /* keep previous snap on error */
    }
  }, [useLivePreconteo]);
  useEffect(() => {
    if (!useLivePreconteo) return;
    fetchSnap();
    const id = setInterval(fetchSnap, 3 * 60 * 1000);
    return () => clearInterval(id);
  }, [useLivePreconteo, fetchSnap]);

  // ── Decide which lede to show ─────────────────────────────────────────────
  // Priority: live preconteo (election-day/post) > fresh briefing > stale fallback
  const livePreconteoLede = useLivePreconteo ? ledeFromPreconteo(snap, country) : null;

  let lede = "";
  let source: LedeSource = { kind: "fallback" };
  if (livePreconteoLede) {
    lede = livePreconteoLede;
    source = { kind: "live-registraduria", stamp: snap?.progress.updatedAt ?? Date.now() };
  } else if (briefingFresh && briefing?.editorial_summary) {
    lede = firstSentences(briefing.editorial_summary, 1);
    source = { kind: "brain", date: briefing.briefing_date };
  } else if (briefing?.editorial_summary) {
    // Briefing exists but is from yesterday or earlier — still better than nothing
    // outside of election-day, but flag it as a known-stale fallback.
    lede = firstSentences(briefing.editorial_summary, 1);
    source = { kind: "fallback" };
  } else {
    lede = "CONDOR AI está procesando la información del día. Cobertura electoral en tiempo real.";
    source = { kind: "fallback" };
  }

  // ── Typing effect ─────────────────────────────────────────────────────────
  const [typedLen, setTypedLen] = useState(0);
  useEffect(() => {
    setTypedLen(0);
    if (!lede) return;
    let i = 0;
    const id = setInterval(() => {
      const ch = lede[i] ?? "";
      // Faster on whitespace, slower on punctuation — mimics LLM tokens.
      i = Math.min(i + (/[\s]/.test(ch) ? 3 : 1), lede.length);
      setTypedLen(i);
      if (i >= lede.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [lede]);

  // ── Rotating insights ─────────────────────────────────────────────────────
  const [insightIdx, setInsightIdx] = useState(0);
  useEffect(() => {
    if (insights.length <= 1) return;
    const id = setInterval(() => setInsightIdx((i) => (i + 1) % insights.length), 4000);
    return () => clearInterval(id);
  }, [insights.length]);
  const currentInsight = insights[insightIdx];
  const CurrentIcon = currentInsight?.icon ?? Activity;

  if (!lede) return null;

  const typing = typedLen < lede.length;

  // Meta line under the brain badge
  let metaLine = "Análisis en tiempo real";
  if (source.kind === "brain") {
    metaLine = `Análisis del ${formatLocalDate(source.date, locale)}`;
  } else if (source.kind === "live-registraduria") {
    const t = new Date(source.stamp).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: country.timezone });
    metaLine = `Síntesis en vivo · datos Registraduría ${t}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-[#FCD116]/30 bg-gradient-to-br from-[#001a4d] via-[#003893] to-[#001a4d]"
    >
      {/* animated AI glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#FCD116]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#CE1126]/15 blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-[#FCD116]/10 blur-3xl" />
      </div>

      <div className="relative px-5 sm:px-7 py-5 sm:py-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Brain className="h-5 w-5 text-[#FCD116]" />
              <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white uppercase tracking-[0.18em]">
                  CONDOR AI
                </span>
                <span className="text-[10px] text-white/60 font-mono">/{country.code}</span>
                <AnimatePresence>
                  {typing && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[9px] text-emerald-300/80 font-mono uppercase tracking-wider flex items-center gap-1"
                    >
                      <span className="h-1 w-1 rounded-full bg-emerald-400 pulse-dot" />
                      generando
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-white/60 font-mono">{metaLine}</p>
            </div>
          </div>
          <Link
            href={`/${country.code}/metodologia`}
            className="inline-flex items-center gap-1 text-[10px] text-white/70 hover:text-[#FCD116] font-mono"
          >
            ¿Cómo funciona? <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Lede — LLM-style streaming */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-mono flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-amber-300" /> Lo que CONDOR AI ve hoy
          </p>
          <div className="text-lg sm:text-xl text-white leading-snug font-medium min-h-[3em]">
            {lede.slice(0, typedLen)}
            {typing && (
              <span className="inline-block w-[3px] h-[1.1em] ml-0.5 bg-amber-300 align-text-bottom animate-pulse" />
            )}
          </div>
        </div>

        {/* Insight stream + CTA */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-white/60 font-mono shrink-0">DETECTANDO</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot shrink-0" />
            <AnimatePresence mode="wait">
              {currentInsight && (
                <motion.div
                  key={insightIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 min-w-0"
                >
                  <CurrentIcon className="h-3 w-3 text-amber-300 shrink-0" />
                  <span className="text-xs text-white/90 truncate">{currentInsight.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link
            href={`/${country.code}/en-vivo`}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-300 text-stone-950 hover:bg-amber-200 text-[11px] font-bold px-3 py-1.5 transition-colors"
          >
            Ver cobertura completa <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Sources footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#FCD116]/15 text-[9px] text-white/45 font-mono">
          <span>CONDOR AI procesa noticias, encuestas, planes y verificaciones · GPT-4 + reglas auditables</span>
        </div>
      </div>
    </motion.div>
  );
}
