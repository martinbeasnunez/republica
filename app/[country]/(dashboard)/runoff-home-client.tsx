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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCountry } from "@/lib/config/country-context";
import { useChartTheme } from "@/lib/echarts-theme";
import { CATEGORIES_LABELS, type Candidate, type Category, type CandidateProposal } from "@/lib/data/candidates";
import type { NewsArticle } from "@/lib/data/news";
import { cn } from "@/lib/utils";
import { LiveNewsFeed } from "./en-vivo/live-news-feed";
import { MediaSourcesPanel } from "./en-vivo/media-sources-panel";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface RunoffHomeClientProps {
  finalists: [Candidate, Candidate];
  articles: NewsArticle[];
  candidatesForPhotos: Candidate[];
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

function FinalistCard({
  candidate,
  side,
  leading,
}: {
  candidate: Candidate;
  side: "left" | "right";
  leading: boolean;
}) {
  const TrendIcon = TREND_ICON[candidate.pollTrend];
  return (
    <Link
      href={`/pe/candidatos/${candidate.slug}`}
      className={cn(
        "group relative flex-1 rounded-2xl border-2 bg-card/95 backdrop-blur p-5 sm:p-6 transition-all hover:shadow-xl",
        leading
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/40"
      )}
    >
      {leading && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow">
          Arriba en encuestas
        </div>
      )}

      <div className={cn("flex items-center gap-4", side === "right" && "flex-row-reverse text-right")}>
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-full border-4" style={{ borderColor: candidate.partyColor }}>
          {candidate.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.photo} alt={candidate.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-black text-foreground leading-tight">
            {candidate.shortName || candidate.name}
          </h3>
          <p className="text-xs font-semibold mt-0.5" style={{ color: candidate.partyColor }}>
            {candidate.party}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {candidate.profession} · {candidate.region}
          </p>
        </div>
      </div>

      <div className={cn("mt-5 flex items-baseline gap-2", side === "right" && "justify-end")}>
        <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-foreground">
          {candidate.pollAverage.toFixed(1)}
        </span>
        <span className="text-lg font-bold text-muted-foreground">%</span>
        <div className={cn("ml-2 flex items-center gap-1 text-xs font-semibold", TREND_COLOR[candidate.pollTrend])}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span className="capitalize">{candidate.pollTrend === "stable" ? "estable" : candidate.pollTrend === "up" ? "sube" : "baja"}</span>
        </div>
      </div>
      <p className={cn("text-[10px] text-muted-foreground mt-1", side === "right" && "text-right")}>
        Promedio reciente · {candidate.pollHistory.length} encuestas
      </p>

      {candidate.hasLegalIssues && candidate.legalNote && (
        <div className={cn("mt-3 flex items-start gap-1.5 text-[10px] text-amber-700", side === "right" && "flex-row-reverse text-right")}>
          <ShieldAlert className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{candidate.legalNote}</span>
        </div>
      )}

      <div className={cn("mt-4 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity", side === "right" && "justify-end")}>
        Ver perfil completo
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function RunoffHero({ finalists }: { finalists: [Candidate, Candidate] }) {
  const country = useCountry();
  const runoffDate = useMemo(
    () => new Date(country.electionDateSecondRound + "T08:00:00-05:00"),
    [country.electionDateSecondRound]
  );
  const { days, hours, minutes, seconds } = useCountdown(runoffDate);
  const formattedDate = runoffDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });

  const [a, b] = finalists;
  const leadingId = a.pollAverage >= b.pollAverage ? a.id : b.id;

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-stone-50 to-stone-100"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 70%, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative px-5 sm:px-8 py-6 sm:py-8">
        {/* Top label */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1">
              <Vote className="h-3.5 w-3.5 text-primary-foreground" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                Segunda Vuelta
              </span>
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Elecciones Generales {country.name} 2026
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium capitalize">{formattedDate}</span>
          </div>
        </div>

        {/* Head-to-head */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
          <FinalistCard candidate={a} side="left" leading={a.id === leadingId} />

          <div className="flex md:flex-col items-center justify-center gap-2 px-2">
            <div className="hidden md:block text-[10px] font-black uppercase tracking-widest text-muted-foreground">VS</div>
            <div className="md:hidden h-px flex-1 bg-border" />
            <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">VS</div>
            <div className="md:hidden h-px flex-1 bg-border" />
            <div className="hidden md:block h-24 w-px bg-border" />
          </div>

          <FinalistCard candidate={b} side="right" leading={b.id === leadingId} />
        </div>

        {/* Countdown */}
        <div className="mt-6 rounded-2xl bg-card border border-border px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Faltan para el balotaje
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Domingo 7 de junio · 8:00 a 17:00 (hora Lima)
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 font-mono tabular-nums">
              {[
                { label: "días", value: days },
                { label: "hrs", value: hours },
                { label: "min", value: minutes },
                { label: "seg", value: seconds },
              ].map((u, i) => (
                <div key={u.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-primary">{pad(u.value)}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{u.label}</div>
                  </div>
                  {i < 3 && <span className="text-2xl sm:text-3xl font-black text-muted-foreground/30">:</span>}
                </div>
              ))}
            </div>
          </div>
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

export function RunoffHomeClient({ finalists, articles, candidatesForPhotos }: RunoffHomeClientProps) {
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
