"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCountry } from "@/lib/config/country-context";
import type { Candidate } from "@/lib/data/candidates";
import type { NewsArticle } from "@/lib/data/news";
import type { FactCheck } from "@/lib/data/fact-checks";
import type { HomepageBlock } from "@/lib/types/homepage-blocks";
import type { ElectoralEvent } from "@/lib/config/countries";
import type { PublicBriefing } from "../page";
import { LiveHeader } from "./live-header";
import { ExitPollResults } from "./exit-poll-results";
import { RegistraduriaResults } from "./registraduria-results";
import { FlashResults } from "./flash-results";
import { ElectionPulse } from "./election-pulse";
import { LiveTimeline } from "./live-timeline";
import { LiveBroadcast } from "./live-broadcast";
import { LiveNewsFeed } from "./live-news-feed";
import { LiveBriefing } from "./live-briefing";
import { LiveAnalysis } from "./live-analysis";
import { AIPulse } from "./ai-pulse";
import { FactCheckSpotlight } from "./fact-check-spotlight";
import { PollStandingsSidebar } from "./poll-standings-sidebar";
import { MediaSourcesPanel } from "./media-sources-panel";
import { CondorAIHero } from "./condor-ai-hero";
import { CondorAIPulse } from "./condor-ai-pulse";
import { RunoffCierreHero } from "./runoff-cierre-hero";
import { ShareModal } from "./share-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Vote, MapPin, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PulseUpdate {
  id: string;
  generated_at: string;
  summary: string;
  metrics: Record<string, unknown> | null;
  phase: string | null;
}

interface EnVivoClientProps {
  candidates?: Candidate[];
  topCandidates: Candidate[];
  articles?: NewsArticle[];
  factChecks?: FactCheck[];
  briefing?: PublicBriefing | null;
  homepageBlocks?: HomepageBlock[];
  activeEvent?: ElectoralEvent | null;
  nextEvent?: ElectoralEvent | null;
  upcomingEvents?: ElectoralEvent[];
  /** CONDOR AI pulse feed — newest first */
  pulses?: PulseUpdate[];
}

// ── Election phase detection ───────────────────────────────────────────────
type Phase = "pre" | "election-day" | "post";

/**
 * Compute the live coverage phase relative to the next-upcoming election.
 * Once the first round has passed, the phase anchors to the runoff date so the
 * live hub doesn't get stuck in "post" forever between rounds.
 */
function getPhase(
  electionDate: string,
  electionDateSecondRound: string | undefined,
  timezone: string
): { phase: Phase; activeDate: string; isRunoff: boolean } {
  const now = new Date();
  const todayLocal = now.toLocaleDateString("en-CA", { timeZone: timezone });
  // If first round is in the past and we have a runoff, anchor to runoff.
  let activeDate = electionDate;
  let isRunoff = false;
  if (electionDateSecondRound && todayLocal > electionDate) {
    activeDate = electionDateSecondRound;
    isRunoff = true;
  }
  if (todayLocal === activeDate) return { phase: "election-day", activeDate, isRunoff };
  if (todayLocal > activeDate) return { phase: "post", activeDate, isRunoff };
  return { phase: "pre", activeDate, isRunoff };
}

export function EnVivoClient({
  candidates,
  topCandidates,
  articles = [],
  factChecks = [],
  briefing = null,
  homepageBlocks = [],
  activeEvent,
  nextEvent,
  upcomingEvents = [],
  pulses = [],
}: EnVivoClientProps) {
  const country = useCountry();
  const router = useRouter();
  const searchParams = useSearchParams();
  const allCandidates = candidates || topCandidates;
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [minutesSinceRefresh, setMinutesSinceRefresh] = useState(0);

  // Optional override `?phase=election-day|post|pre` — useful for previewing
  // the day-of layout before D-day. Falls back to the real calendar phase.
  const phaseOverride = searchParams?.get("phase");
  const phaseInfo = getPhase(country.electionDate, country.electionDateSecondRound, country.timezone);
  const phase: Phase = (phaseOverride === "pre" || phaseOverride === "election-day" || phaseOverride === "post")
    ? phaseOverride
    : phaseInfo.phase;
  const isRunoffWindow = phaseInfo.isRunoff;
  const activeElectionDate = phaseInfo.activeDate;

  // Days until election (for víspera previews) — anchored to whichever election is current.
  const electionDate = new Date(activeElectionDate + "T12:00:00");
  const daysToElection = Math.floor((electionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Veda electoral activa: CO prohíbe publicar encuestas 7 días antes y hasta el cierre.
  // Durante ese período cualquier "ranking de encuestas" en pantalla es stale y ruidoso.
  const inPollBlackout = country.code === "co" && daysToElection >= 0 && daysToElection <= 7;

  // Official live results scrapers:
  //   PE → ONPE (ExitPollResults + /api/onpe-results)
  //   CO → Registraduría (RegistraduriaResults + /api/registraduria-results)
  const officialResultsAvailable = country.code === "pe" || country.code === "co";
  const showOfficialResults = (phase === "election-day" || phase === "post") && officialResultsAvailable;
  const OfficialResultsComponent = country.code === "co" ? RegistraduriaResults : ExitPollResults;

  // Candidate photos for news image matching
  const candidatePhotos = allCandidates
    .filter((c) => c.photo)
    .map((c) => ({ shortName: c.shortName, name: c.name, photo: c.photo, partyColor: c.partyColor }));

  // ── Runoff finalists (only when country is mid-runoff window) ──────────────
  const finalistSlugs = country.runoffCandidateSlugs;
  const finalists = useMemo(() => {
    if (!isRunoffWindow || !finalistSlugs) return [] as Candidate[];
    return finalistSlugs
      .map((slug) => allCandidates.find((c) => c.slug === slug))
      .filter(Boolean) as Candidate[];
  }, [allCandidates, finalistSlugs, isRunoffWindow]);
  const showFinalistsStrip = isRunoffWindow && finalists.length === 2;

  // ── ONPE shape probe ─────────────────────────────────────────────────────
  // On runoff day ONPE may still be serving the closed first-round dataset
  // (36 candidates, 100% actas). Showing that as "Conteo Oficial · Balotaje"
  // is misleading. Probe the API on mount and decide whether to render the
  // real counter or our cierre-countdown hero.
  const [onpeReady, setOnpeReady] = useState(false);
  useEffect(() => {
    if (!isRunoffWindow || country.code !== "pe") return;
    let cancelled = false;
    const probe = async () => {
      try {
        const res = await fetch("/api/onpe-results");
        const json = await res.json().catch(() => null);
        if (!json || cancelled) return;
        const count = Array.isArray(json.candidates) ? json.candidates.length : 0;
        // Runoff-shape = at most 2 candidates. Anything more is first-round leftover.
        setOnpeReady(count > 0 && count <= 2);
      } catch {
        if (!cancelled) setOnpeReady(false);
      }
    };
    probe();
    const id = setInterval(probe, 3 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [isRunoffWindow, country.code]);
  const useCierreHero = isRunoffWindow && country.code === "pe" && !onpeReady && finalists.length === 2;

  // ── Filter "hot" articles for the day-E live feed ──────────────────────
  // En día E o post-elección, el feed de "Noticias en Tiempo Real" sólo debe
  // mostrar noticias DEL DÍA (≥ 00:00 hora local del país). Notas de ayer o
  // más viejas no son "tiempo real" — son contexto que ya pasó.
  const hotArticles = useMemo(() => {
    if (phase === "pre") return articles; // víspera: dejamos todo
    // Day-of cutoff = 00:00 local time of the country (epoch ms)
    const localMidnightStr = new Date().toLocaleString("en-CA", {
      timeZone: country.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const localMidnight = new Date(`${localMidnightStr}T00:00:00`).getTime();
    return articles.filter((a) => {
      if (!a.time) return false;
      const t = new Date(a.time).getTime();
      return Number.isFinite(t) && t >= localMidnight;
    });
  }, [articles, phase, country.timezone]);

  // Timeline entries from Brain briefing.timeline (if present)
  const timelineEntries =
    briefing?.timeline?.map((t) => ({
      time: typeof t === "object" && "time" in t ? String(t.time) : "",
      text: typeof t === "object" && "text" in t ? String(t.text) : "",
      source: typeof t === "object" && "source" in t ? String(t.source) : "",
    })) ?? [];

  // Auto-refresh every 5 minutes
  const doRefresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    setLastRefresh(Date.now());
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [router]);

  useEffect(() => {
    const autoRefresh = setInterval(doRefresh, 5 * 60 * 1000);
    const trackTime = setInterval(() => {
      setMinutesSinceRefresh(Math.floor((Date.now() - lastRefresh) / 60000));
    }, 30000);
    return () => { clearInterval(autoRefresh); clearInterval(trackTime); };
  }, [doRefresh, lastRefresh]);

  // ── Track preconteo % to decide layout priority ─────────────────────────
  // Cuando el preconteo arranca (>0% escrutado), el dato duro pasa arriba y
  // el Pulse AI baja a segundo plano. Antes del cierre el Pulse domina.
  const [preconteoActive, setPreconteoActive] = useState(false);
  useEffect(() => {
    if (!showOfficialResults || country.code !== "co") return;
    const check = async () => {
      try {
        const res = await fetch("/api/registraduria-results");
        if (!res.ok) return;
        const json = await res.json();
        const pct = Number(json?.progress?.percentage ?? 0);
        if (Number.isFinite(pct)) setPreconteoActive(pct > 0);
      } catch { /* keep previous value */ }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [showOfficialResults, country.code]);

  // Shared: unique source count for briefing badge
  const uniqueSources = new Set(articles.map((a) => a.source)).size;

  // Shared auto-refresh indicator
  const RefreshIndicator = (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
        <span className="font-mono">
          {isRefreshing ? "Actualizando..." : minutesSinceRefresh > 0 ? `Actualizado hace ${minutesSinceRefresh}m` : "Actualizado ahora"}
        </span>
        <span className="text-muted-foreground/40">· auto-refresh cada 5 min</span>
      </div>
      <button
        onClick={doRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
        Actualizar
      </button>
    </div>
  );

  // CONDOR AI block — Pulse feed when available, else Hero (briefing/preconteo fallback)
  const AIBlock = pulses.length > 0
    ? <CondorAIPulse initialPulses={pulses} />
    : (
      <CondorAIHero
        candidates={allCandidates}
        articles={articles}
        factChecks={factChecks}
        briefing={briefing}
      />
    );

  // ── Finalists head-to-head strip (runoff election day / window) ───────────
  // Compact strip: party-color band, portrait, name. Sits between LiveHeader and
  // the ONPE counter so the runoff context is unmissable.
  const FinalistsStrip = showFinalistsStrip ? (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white pulse-dot" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
              Finalistas
            </span>
          </span>
          <span className="text-[11px] font-semibold text-stone-600">
            Balotaje presidencial — domingo 7 de junio
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-stone-500 font-mono">
          <Clock className="h-3 w-3" />
          <span>Mesas 8:00 a.m. — 5:00 p.m. (Lima)</span>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-stone-100">
        {finalists.map((c, i) => (
          <div
            key={c.id}
            className={cn(
              "flex items-center gap-3 sm:gap-4 p-3 sm:p-4",
              i === 1 && "flex-row-reverse text-right"
            )}
            style={{
              background: i === 0
                ? `linear-gradient(90deg, ${c.partyColor}10 0%, transparent 80%)`
                : `linear-gradient(-90deg, ${c.partyColor}10 0%, transparent 80%)`,
            }}
          >
            <div
              className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-xl"
              style={{ outline: `3px solid ${c.partyColor}`, outlineOffset: "2px" }}
            >
              {c.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photo} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5"
                style={{ color: c.partyColor }}
              >
                {c.party}
              </p>
              <p className="text-sm sm:text-base font-black tracking-tight text-stone-900 leading-tight truncate">
                {c.shortName || c.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // Shared right-column "Datos de la Elección" card — adapts to runoff mode
  const ElectionDataCard = (
    <Card className="bg-card border-border">
      <CardContent className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {isRunoffWindow ? "Datos del Balotaje" : "Datos de la Elección"}
        </h3>
        <div className="space-y-2.5">
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
              <p className="text-xs font-medium text-foreground">
                {isRunoffWindow ? "Segunda vuelta presidencial" : country.electionType}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRunoffWindow
                  ? "Gana el candidato con más votos válidos"
                  : country.electionSystem}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">
                {country.departments.length} departamentos
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRunoffWindow
                  ? "Mesas abiertas de 8:00 a.m. a 5:00 p.m. (hora Lima)"
                  : country.legislatureInfo ?? ""}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ════════════════════════════════════════════════════════════════════════
  // MODE A: POST-ELECCIÓN con conteo oficial disponible (PE post 12 abril)
  // Conteo oficial es la estrella. Noticias del runoff abajo. Sin pre-election
  // pulses ni AI briefings que no apliquen.
  // ════════════════════════════════════════════════════════════════════════
  if (showOfficialResults) {
    return (
      <div className="space-y-6">
        <ShareModal />
        <LiveHeader activeEvent={activeEvent} nextEvent={nextEvent} />
        {FinalistsStrip}
        {/*
          Runoff day routing:
          - If we're in runoff window but ONPE still serves first-round leftover
            (>2 candidates), we MUST NOT render its counter — it would show
            stale 1ra vuelta percentages as "balotaje" and mislead the user.
            Render the RunoffCierreHero with a live countdown to 5:00 p.m.
            instead, until ONPE flips to runoff-shape data.
          - Otherwise apply the usual phase-aware reorder for the live counter.
        */}
        {useCierreHero ? (
          <>
            <RunoffCierreHero finalists={[finalists[0], finalists[1]]} />
            {AIBlock}
          </>
        ) : preconteoActive ? (
          <>
            <OfficialResultsComponent />
            {AIBlock}
          </>
        ) : (
          <>
            {AIBlock}
            <OfficialResultsComponent />
          </>
        )}
        {RefreshIndicator}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {articles.length > 0 && (
              <LiveNewsFeed articles={hotArticles} candidatePhotos={candidatePhotos} />
            )}
          </div>
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <MediaSourcesPanel />
            {ElectionDataCard}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MODE B: ELECTION-DAY sin scraper aún (CO el 31 may si Fase 2 no está)
  // Foco en boca de urna, broadcast en vivo, noticias en tiempo real.
  // ════════════════════════════════════════════════════════════════════════
  if (phase === "election-day") {
    return (
      <div className="space-y-6">
        <ShareModal />
        <LiveHeader activeEvent={activeEvent} nextEvent={nextEvent} />
        {FinalistsStrip}
        {AIBlock}
        <FlashResults articles={articles} />
        {RefreshIndicator}
        <ElectionPulse articles={articles} factChecks={factChecks} briefing={briefing} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {articles.length > 0 && (
              <LiveNewsFeed articles={hotArticles} candidatePhotos={candidatePhotos} />
            )}
            {factChecks.length > 0 && <FactCheckSpotlight factChecks={factChecks} />}
            <AIPulse articles={articles} factChecks={factChecks} candidates={allCandidates} />
          </div>
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <LiveBroadcast />
            {!inPollBlackout && <PollStandingsSidebar candidates={allCandidates} />}
            <MediaSourcesPanel />
            {ElectionDataCard}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MODE C: PRE-ELECCIÓN (CO ahora, días antes del E)
  // Briefing AI + 5 categorías de cobertura + encuestas + fact-checks +
  // canales en vivo + noticias en tiempo real. La versión PRO completa.
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
        <ShareModal />
        <LiveHeader activeEvent={activeEvent} nextEvent={nextEvent} />
        {FinalistsStrip}

      {/* CONDOR AI: Pulse feed cuando ya hay pulses, Hero como fallback */}
      {AIBlock}

      {/* ═══ Preview del preconteo en víspera (CO, D-1) ═══
          El componente ya maneja "Preconteo aún no inicia" hasta 4 p.m. del día E. */}
      {country.code === "co" && daysToElection >= 0 && daysToElection <= 1 && <RegistraduriaResults />}

      <FlashResults articles={articles} />

      {timelineEntries.length > 0 && <LiveTimeline entries={timelineEntries} />}

      {RefreshIndicator}

      <ElectionPulse articles={articles} factChecks={factChecks} briefing={briefing} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {articles.length > 0 && (
            <LiveNewsFeed articles={hotArticles} candidatePhotos={candidatePhotos} />
          )}
          {factChecks.length > 0 && <FactCheckSpotlight factChecks={factChecks} />}
          <AIPulse articles={articles} factChecks={factChecks} candidates={allCandidates} />
        </div>
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {!inPollBlackout && <PollStandingsSidebar candidates={allCandidates} />}
          <LiveBroadcast />
          <MediaSourcesPanel />
          {ElectionDataCard}
        </div>
      </div>
    </div>
  );
}
