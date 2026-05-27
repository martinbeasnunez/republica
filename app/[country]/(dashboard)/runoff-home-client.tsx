"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Vote,
  Users,
  MapPin,
  ArrowUpRight,
  Scale,
  Sparkles,
  Activity,
  Newspaper,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCountry } from "@/lib/config/country-context";
import { useChartTheme } from "@/lib/echarts-theme";
import { CATEGORIES_LABELS, type Candidate, type Category, type CandidateProposal } from "@/lib/data/candidates";
import type { NewsArticle } from "@/lib/data/news";
import type { PublicBriefing } from "./page";
import { cn } from "@/lib/utils";
import { LiveNewsFeed } from "./en-vivo/live-news-feed";
import { MediaSourcesPanel } from "./en-vivo/media-sources-panel";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface RunoffHomeClientProps {
  finalists: [Candidate, Candidate];
  articles: NewsArticle[];
  candidatesForPhotos: Candidate[];
  briefings?: PublicBriefing[];
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const TREND_COLOR = {
  up: "text-emerald-600",
  down: "text-rose-600",
  stable: "text-muted-foreground",
} as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, diff };
}

/**
 * FinalistPortrait — the editorial half of the head-to-head hero.
 * Designed to feel like an election-night magazine spread: party color floods the panel,
 * portrait dominates, candidate name in display typography, poll % as huge serifable numeral.
 */
function FinalistPortrait({
  candidate,
  side,
  leading,
}: {
  candidate: Candidate;
  side: "left" | "right";
  leading: boolean;
}) {
  const TrendIcon = TREND_ICON[candidate.pollTrend];
  const isLeft = side === "left";
  return (
    <Link
      href={`/pe/candidatos/${candidate.slug}`}
      className={cn(
        "group relative flex-1 overflow-hidden block",
        // Mobile: padding box; Desktop: edge-to-edge half
        "p-5 sm:p-6 md:p-8"
      )}
      style={{
        // Subtle party-color wash that bleeds in from the candidate's outer edge.
        background: isLeft
          ? `linear-gradient(135deg, ${candidate.partyColor}26 0%, ${candidate.partyColor}08 40%, transparent 80%)`
          : `linear-gradient(-135deg, ${candidate.partyColor}26 0%, ${candidate.partyColor}08 40%, transparent 80%)`,
      }}
    >
      {/* Decorative party-color accent line */}
      <div
        className={cn(
          "absolute top-0 h-1 w-24 sm:w-32",
          isLeft ? "left-6 sm:left-8 md:left-10" : "right-6 sm:right-8 md:right-10"
        )}
        style={{ backgroundColor: candidate.partyColor }}
      />

      {/* Use a fixed-row grid so the equivalent rows align across the two finalists,
          even when one side is missing the leading pill or the legal note.
          Rows: [pill] [portrait] [name] [stats] [legal] [cta]. */}
      <div
        className={cn(
          "grid h-full gap-3 sm:gap-4",
          "grid-rows-[1.75rem_auto_auto_auto_3rem_1rem]",
          !isLeft && "justify-items-end text-right"
        )}
      >
        {/* Row 1 — Leading pill (reserved height even when not leader) */}
        <div className="self-start">
          {leading ? (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: candidate.partyColor, color: "white" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white pulse-dot" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Lidera el promedio
              </span>
            </div>
          ) : null}
        </div>

        {/* Row 2 — Portrait */}
        <div className="relative">
          <div
            className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-36 md:w-36 overflow-hidden rounded-2xl"
            style={{
              boxShadow: `0 20px 60px -15px ${candidate.partyColor}66`,
              outline: `4px solid ${candidate.partyColor}`,
              outlineOffset: "2px",
            }}
          >
            {candidate.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={candidate.photo}
                alt={candidate.name}
                className="h-full w-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
          </div>
        </div>

        {/* Row 3 — Name + party */}
        <div className={cn("space-y-1", !isLeft && "text-right")}>
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: candidate.partyColor }}
          >
            {candidate.party}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-stone-900 leading-[0.95]">
            {candidate.shortName || candidate.name}
          </h2>
          <p className="text-xs text-stone-500 pt-0.5">
            {candidate.age} años
          </p>
        </div>

        {/* Row 4 — Massive poll number + trend */}
        <div className={cn(!isLeft && "text-right")}>
          <div className={cn("flex items-baseline gap-1 font-mono tabular-nums", !isLeft && "justify-end")}>
            <span
              className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none"
              style={{ color: candidate.partyColor }}
            >
              {candidate.pollAverage.toFixed(1)}
            </span>
            <span className="text-xl sm:text-2xl font-black text-stone-400">%</span>
          </div>
          <div className={cn("mt-1 flex items-center gap-1.5", !isLeft && "justify-end")}>
            <div className={cn("inline-flex items-center gap-1 text-xs font-bold", TREND_COLOR[candidate.pollTrend])}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{candidate.pollTrend === "stable" ? "estable" : candidate.pollTrend === "up" ? "subiendo" : "bajando"}</span>
            </div>
            <span className="text-[10px] text-stone-400">
              · {candidate.pollHistory.length} encuestas
            </span>
          </div>
        </div>

        {/* Row 5 — Legal note (reserved height even when none) */}
        <div className={cn("self-start", !isLeft && "w-full")}>
          {candidate.hasLegalIssues && candidate.legalNote ? (
            <div className={cn("flex items-start gap-1.5 text-[10px] text-amber-700 max-w-xs", !isLeft && "flex-row-reverse ml-auto")}>
              <ShieldAlert className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{candidate.legalNote}</span>
            </div>
          ) : null}
        </div>

        {/* Row 6 — Hover CTA */}
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity self-start",
            !isLeft && "flex-row-reverse"
          )}
          style={{ color: candidate.partyColor }}
        >
          Ver perfil completo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

/** Horizontal "balance" bar — both party colors fill proportional to poll %, sharing space. */
function BalanceBar({ finalists }: { finalists: [Candidate, Candidate] }) {
  const [a, b] = finalists;
  const total = a.pollAverage + b.pollAverage;
  const aPct = (a.pollAverage / total) * 100;
  const bPct = 100 - aPct;
  const delta = Math.abs(a.pollAverage - b.pollAverage);
  const tight = delta < 5;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-stone-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
            Reparto del promedio actual
          </span>
        </div>
        <span className={cn(
          "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
          tight ? "bg-amber-100 text-amber-800" : "bg-stone-200 text-stone-700"
        )}>
          {tight ? "Empate técnico" : "Δ"} {delta.toFixed(1)} pp
        </span>
      </div>

      <div className="relative h-10 sm:h-12 overflow-hidden rounded-xl bg-stone-200 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${aPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 flex items-center justify-end pr-3"
          style={{ backgroundColor: a.partyColor }}
        >
          <span className="text-white font-mono font-black text-sm sm:text-base tabular-nums drop-shadow">
            {a.pollAverage.toFixed(1)}%
          </span>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-y-0 right-0 flex items-center justify-start pl-3"
          style={{ backgroundColor: b.partyColor }}
        >
          <span className="text-white font-mono font-black text-sm sm:text-base tabular-nums drop-shadow">
            {b.pollAverage.toFixed(1)}%
          </span>
        </motion.div>
        {/* 50% marker */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/50" />
      </div>

      <p className="text-[11px] text-stone-500 mt-2 leading-snug">
        {tight ? (
          <>La diferencia de <strong className="text-stone-700">{delta.toFixed(1)} pp</strong> cae dentro del margen de error (±2.5pp) de la mayoría de encuestas. Carrera virtualmente empatada.</>
        ) : (
          <><strong className="text-stone-700">{(a.pollAverage > b.pollAverage ? a.shortName : b.shortName)}</strong> lidera por {delta.toFixed(1)} puntos en el promedio ponderado de encuestadoras.</>
        )}
      </p>
    </div>
  );
}

function RunoffHero({ finalists }: { finalists: [Candidate, Candidate] }) {
  const country = useCountry();
  const runoffDate = useMemo(
    () => new Date(country.electionDateSecondRound + "T08:00:00-05:00"),
    [country.electionDateSecondRound]
  );
  const { days, hours, minutes, seconds } = useCountdown(runoffDate);
  const dateLong = runoffDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Lima",
  });

  const [a, b] = finalists;
  const leadingId = a.pollAverage >= b.pollAverage ? a.id : b.id;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-stone-50 border border-stone-200/60 shadow-xl shadow-stone-900/5"
    >
      {/* Decorative dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top ribbon — segunda vuelta + date + countdown */}
      <div className="relative bg-stone-900 text-stone-100 px-6 sm:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white pulse-dot" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
              Segunda Vuelta
            </span>
          </span>
          <span className="hidden sm:inline text-[11px] font-semibold capitalize text-stone-300">
            {dateLong} · 2026
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 font-mono tabular-nums">
          <span className="text-[9px] uppercase tracking-widest text-stone-400 hidden sm:inline">Faltan</span>
          {[
            { label: "d", value: days },
            { label: "h", value: hours },
            { label: "m", value: minutes },
            { label: "s", value: seconds },
          ].map((u, i) => (
            <div key={u.label} className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-white">{pad(u.value)}</span>
              <span className="text-[9px] uppercase tracking-widest text-stone-500">{u.label}</span>
              {i < 3 && <span className="text-stone-700 ml-1 hidden sm:inline">·</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Head-to-head — full split, no padding wrappers, edge to edge */}
      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <FinalistPortrait candidate={a} side="left" leading={a.id === leadingId} />

        {/* Center VS divider */}
        <div className="relative flex md:flex-col items-center justify-center py-4 md:py-0 md:px-2 bg-stone-100 md:bg-transparent">
          {/* Vertical line on desktop */}
          <div className="hidden md:block absolute inset-y-8 left-1/2 -translate-x-1/2 w-px bg-stone-200" />
          {/* Horizontal line on mobile */}
          <div className="md:hidden absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-stone-200" />
          <div className="relative bg-stone-50 px-3 py-2 md:py-3 md:px-2">
            <span
              className="block text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter italic"
              style={{
                background: "linear-gradient(135deg, #8B1A1A, #C42B2B 50%, #E84040)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 8px 24px rgba(139,26,26,0.25)",
              }}
            >
              vs
            </span>
          </div>
        </div>

        <FinalistPortrait candidate={b} side="right" leading={b.id === leadingId} />
      </div>

      {/* Balance bar foot */}
      <div className="relative bg-white/60 backdrop-blur border-t border-stone-200/60 px-6 sm:px-10 py-5">
        <BalanceBar finalists={finalists} />
      </div>
    </motion.section>
  );
}

/** Friendly relative-day label (Hoy / Ayer / Anteayer / fecha). */
function relativeDayLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (dateStr === todayStr) return "Hoy";
  const d = new Date(dateStr + "T12:00:00");
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 1) return "Ayer";
  if (diffDays === 2) return "Anteayer";
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

/**
 * DayPulse — editorial summary card for the runoff home.
 * Shows today's AI-generated briefing (editorial_summary + 2-3 top headlines)
 * with a compact timeline of the previous two days underneath.
 */
function DayPulse({ briefings, finalists }: { briefings: PublicBriefing[]; finalists: [Candidate, Candidate] }) {
  if (!briefings || briefings.length === 0) return null;
  const [today, ...prior] = briefings;
  const todayStories = (today.top_stories ?? []).slice(0, 3);

  // Extract poll deltas for the two finalists from today's poll_movements.
  const movements = (today.poll_movements ?? []).filter((m) => {
    const name = m.candidate?.toLowerCase() ?? "";
    return finalists.some(
      (f) =>
        name.includes(f.shortName.toLowerCase().split(" ").pop() || "") ||
        name.includes(f.name.toLowerCase().split(" ").pop() || "")
    );
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 border-b border-stone-100 bg-gradient-to-r from-primary/[0.04] via-white to-white">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
              Pulso del balotaje
            </h2>
            <p className="text-[10px] text-stone-500 -mt-0.5">
              Resumen diario generado por CONDOR AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
          <Sparkles className="h-3 w-3 text-primary" />
          {today._isToday ? (
            <span>Actualizado hoy</span>
          ) : (
            <span>Hace {today._ageHours ?? 0}h</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-0 lg:divide-x divide-stone-100">
        {/* TODAY — editorial summary + top stories */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white pulse-dot" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">
                {relativeDayLabel(today.briefing_date)}
              </span>
            </span>
            <span className="text-[11px] text-stone-500 capitalize">
              {new Date(today.briefing_date + "T12:00:00").toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-stone-700 font-serif italic">
            “{today.editorial_summary}”
          </p>

          {/* Poll deltas if any */}
          {movements.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-stone-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Movimientos en encuestas
              </span>
              {movements.slice(0, 4).map((m) => {
                const up = m.direction === "up";
                const stable = m.direction === "stable";
                const Icon = up ? TrendingUp : stable ? Minus : TrendingDown;
                const color = up ? "text-emerald-600" : stable ? "text-stone-400" : "text-rose-600";
                const delta = (m.current - m.previous).toFixed(1);
                return (
                  <span key={m.candidate} className={cn("inline-flex items-center gap-1 text-[11px] font-semibold font-mono tabular-nums", color)}>
                    <Icon className="h-3 w-3" />
                    {m.candidate.split(" ").slice(-1)[0]} {delta.startsWith("-") ? "" : "+"}{delta}pp
                  </span>
                );
              })}
            </div>
          )}

          {/* Top stories */}
          {todayStories.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <Newspaper className="h-3 w-3 text-stone-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Lo que mueve la agenda
                </span>
              </div>
              <ul className="space-y-1.5">
                {todayStories.map((s, i) => (
                  <li key={`${s.title}-${i}`} className="flex items-start gap-2.5 text-[13px] leading-snug text-stone-700">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/70" />
                    <span>
                      <span className="font-semibold text-stone-900">{s.title}</span>
                      {s.source && <span className="text-[11px] text-stone-400 ml-1.5">· {s.source}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* PRIOR DAYS — timeline */}
        <div className="p-5 sm:p-6 bg-stone-50/40">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              Cómo veníamos
            </span>
          </div>
          {prior.length === 0 ? (
            <p className="text-[11px] text-stone-400 italic">Sin briefings de días anteriores.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-stone-200 pl-4">
              {prior.map((b) => {
                const dayStories = (b.top_stories ?? []).slice(0, 1);
                return (
                  <li key={b.briefing_date} className="relative">
                    <span className="absolute -left-[1.30rem] top-1.5 h-2 w-2 rounded-full bg-stone-300 ring-4 ring-stone-50" />
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-700 capitalize">
                        {relativeDayLabel(b.briefing_date)}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(b.briefing_date + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-[12px] leading-snug text-stone-600 line-clamp-3">
                      {b.editorial_summary}
                    </p>
                    {dayStories[0] && (
                      <p className="mt-1.5 text-[11px] text-stone-500 italic line-clamp-2">
                        → {dayStories[0].title}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function RunoffPollsChart({ finalists }: { finalists: [Candidate, Candidate] }) {
  const ct = useChartTheme();
  const [a, b] = finalists;

  // Pair polls by date+pollster across both candidates and order by date.
  const { dates, seriesA, seriesB, pollsterCount } = useMemo(() => {
    const aByKey = new Map(a.pollHistory.map((p) => [`${p.date}|${p.pollster}`, p.value]));
    const bByKey = new Map(b.pollHistory.map((p) => [`${p.date}|${p.pollster}`, p.value]));
    const keys = new Set<string>([...aByKey.keys(), ...bByKey.keys()]);
    const sorted = Array.from(keys).sort((x, y) => x.localeCompare(y));
    const recent = sorted.slice(-20); // last ~20 polls for readability
    const pollsters = new Set<string>();
    const dates: string[] = [];
    const seriesA: (number | null)[] = [];
    const seriesB: (number | null)[] = [];
    for (const k of recent) {
      const [date, pollster] = k.split("|");
      pollsters.add(pollster);
      const d = new Date(date + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" });
      dates.push(d);
      seriesA.push(aByKey.get(k) ?? null);
      seriesB.push(bByKey.get(k) ?? null);
    }
    return { dates, seriesA, seriesB, pollsterCount: pollsters.size };
  }, [a, b]);

  const option = {
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    legend: {
      show: true,
      bottom: 0,
      textStyle: { color: ct.text.muted, fontSize: 11, fontWeight: 600 },
      itemWidth: 12,
      itemHeight: 12,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
      valueFormatter: (v: number) => (typeof v === "number" ? `${v.toFixed(1)}%` : "—"),
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: ct.axis.lineColor } },
      axisLabel: { color: ct.axis.labelColor, fontSize: 10 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 60,
      axisLabel: { color: ct.axis.labelColor, fontSize: 10, formatter: "{value}%" },
      splitLine: { lineStyle: { color: ct.axis.splitLineColor } },
    },
    series: [
      {
        name: a.shortName || a.name,
        type: "line",
        smooth: true,
        data: seriesA,
        connectNulls: true,
        lineStyle: { width: 3, color: a.partyColor },
        itemStyle: { color: a.partyColor },
        symbol: "circle",
        symbolSize: 7,
      },
      {
        name: b.shortName || b.name,
        type: "line",
        smooth: true,
        data: seriesB,
        connectNulls: true,
        lineStyle: { width: 3, color: b.partyColor },
        itemStyle: { color: b.partyColor },
        symbol: "circle",
        symbolSize: 7,
      },
    ],
  };

  if (dates.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
              Encuestas Segunda Vuelta
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {pollsterCount} encuestadoras · últimas {dates.length} mediciones
            </p>
          </div>
          <Link href="/pe/encuestas" className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1">
            Ver todas
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="h-72">
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
        </div>
      </CardContent>
    </Card>
  );
}

function ProposalsCompare({ finalists }: { finalists: [Candidate, Candidate] }) {
  const [a, b] = finalists;

  // Union of categories present in either candidate's proposals.
  const allCategories: Category[] = useMemo(() => {
    const set = new Set<Category>();
    for (const c of finalists) {
      for (const p of c.keyProposals || []) set.add(p.category);
    }
    return Array.from(set);
  }, [finalists]);

  function getProposal(c: Candidate, cat: Category): CandidateProposal | undefined {
    return c.keyProposals?.find((p) => p.category === cat);
  }

  if (allCategories.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
              Propuestas Cara a Cara
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Comparación directa por temática
            </p>
          </div>
          <Link href="/pe/planes/comparar" className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1">
            Comparador completo
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_2fr_2fr] gap-3 pb-2 border-b border-border mb-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tema</div>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: a.partyColor }}>
            {a.shortName || a.name}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: b.partyColor }}>
            {b.shortName || b.name}
          </div>
        </div>

        <div className="space-y-3">
          {allCategories.map((cat) => {
            const pa = getProposal(a, cat);
            const pb = getProposal(b, cat);
            const label = CATEGORIES_LABELS[cat]?.es || cat;
            return (
              <div key={cat} className="grid grid-cols-[1fr_2fr_2fr] gap-3 py-2 border-b border-border/40 last:border-b-0">
                <div className="text-xs font-bold text-foreground capitalize">{label}</div>
                <div>
                  {pa ? (
                    <>
                      <p className="text-xs font-semibold text-foreground leading-snug">{pa.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{pa.summary}</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">Sin propuesta registrada</p>
                  )}
                </div>
                <div>
                  {pb ? (
                    <>
                      <p className="text-xs font-semibold text-foreground leading-snug">{pb.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{pb.summary}</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">Sin propuesta registrada</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function RunoffHomeClient({ finalists, articles, candidatesForPhotos, briefings = [] }: RunoffHomeClientProps) {
  const country = useCountry();
  const finalistSlugSet = useMemo(
    () => new Set(finalists.map((f) => f.slug)),
    [finalists]
  );

  // Filter news to those mentioning at least one finalist. If the candidates_mentioned
  // array is empty across the board, fall back to all articles.
  const filtered = useMemo(() => {
    const hits = articles.filter((a) =>
      a.candidates?.some((slug) => finalistSlugSet.has(slug))
    );
    return hits.length >= 5 ? hits : articles;
  }, [articles, finalistSlugSet]);

  const candidatePhotos = candidatesForPhotos
    .filter((c) => c.photo)
    .map((c) => ({ shortName: c.shortName, name: c.name, photo: c.photo, partyColor: c.partyColor }));

  return (
    <div className="space-y-6">
      <RunoffHero finalists={finalists} />

      {briefings.length > 0 && (
        <DayPulse briefings={briefings} finalists={finalists} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RunoffPollsChart finalists={finalists} />
          <ProposalsCompare finalists={finalists} />
          {filtered.length > 0 && (
            <LiveNewsFeed articles={filtered} candidatePhotos={candidatePhotos} />
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Datos del Balotaje
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">7 de junio 2026</p>
                    <p className="text-[10px] text-muted-foreground">Segunda vuelta presidencial</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{country.electorateSize}</p>
                    <p className="text-[10px] text-muted-foreground">Electores habilitados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Vote className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Voto obligatorio</p>
                    <p className="text-[10px] text-muted-foreground">18 a 70 años · multa por no votar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{country.departments.length} departamentos</p>
                    <p className="text-[10px] text-muted-foreground">Mesas de 8:00 a 17:00 h</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <Link
                  href="/pe/en-vivo"
                  className="flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <span>Resultados oficiales 1ra vuelta (ONPE)</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <MediaSourcesPanel />

          <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20">
            <CardContent className="p-5">
              <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">¿Aún indeciso?</Badge>
              <h3 className="text-sm font-black text-foreground mb-1">
                ¿Con quién coincides más?
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
                Compara tus posturas con las de Keiko Fujimori y Roberto Sánchez en 15 preguntas.
              </p>
              <Link
                href="/pe/quiz"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold px-4 py-2 hover:bg-primary/90 transition-colors"
              >
                Tomar el quiz
                <ChevronRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
