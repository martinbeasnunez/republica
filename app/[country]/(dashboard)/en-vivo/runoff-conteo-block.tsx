"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, ExternalLink, Hourglass, TrendingUp, TrendingDown, Minus, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// CONDOR — Runoff Live Counter
// =============================================================================
// Single block that renders WHATEVER is the most authoritative result data
// available at this moment. Polls /api/runoff-conteo every 60 seconds.
//
// - Source "Esperando ONPE"   → waiting state (gray, hourglass, no numbers)
// - Source "Ipsos boca de urna" → exit-poll style (amber tint, "NO OFICIAL")
// - Source "ONPE"              → official conteo (emerald tint, actas bar)
// =============================================================================

interface ApiCandidate {
  slug?: string;
  name: string;
  shortName?: string;
  party?: string;
  partyColor?: string;
  percentage: number | null;
  votes: number | null;
}
interface ApiResponse {
  source: string;
  sourceType: "official" | "exit_poll" | "quick_count" | "waiting";
  isOfficial: boolean;
  capturedAt: string;
  actasPct: number | null;
  actasCounted: number | null;
  actasTotal: number | null;
  totalVotesEmitted: number | null;
  candidates: ApiCandidate[];
  note?: string;
}

function formatVotes(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("es-PE");
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    });
  } catch {
    return "—";
  }
}

// Source-aware badges. We only ever surface ONPE-official data or an
// "esperando ONPE" placeholder — no exit polls, no quick counts. Other
// sourceType values map to the placeholder treatment.
// Pill copy is intentionally short ("ONPE EN VIVO") so the header fits one
// line on mobile alongside the Compartir + Actualizado buttons. The longer
// "CONTEO OFICIAL ONPE" wrapped to two lines on iPhone widths.
const SOURCE_BADGE: Record<ApiResponse["sourceType"], { label: string; tint: string; ring: string; pillBg: string }> = {
  official:   { label: "ONPE EN VIVO",   tint: "from-emerald-50 to-white",  ring: "border-emerald-600/30",  pillBg: "bg-emerald-600" },
  waiting:    { label: "ESPERANDO ONPE", tint: "from-stone-100 to-white",   ring: "border-stone-300/60",   pillBg: "bg-stone-600" },
  exit_poll:  { label: "ESPERANDO ONPE", tint: "from-stone-100 to-white",   ring: "border-stone-300/60",   pillBg: "bg-stone-600" },
  quick_count:{ label: "ESPERANDO ONPE", tint: "from-stone-100 to-white",   ring: "border-stone-300/60",   pillBg: "bg-stone-600" },
};

/**
 * Track previous snapshots so we can compute insights: how the gap moved,
 * who gained / lost votes, since when. We keep only the LAST snapshot that
 * is meaningfully old (≥45s gap) and meaningfully different (actasPct moved)
 * so the insight reflects real movement, not a poll cache hit.
 */
interface InsightSnapshot {
  capturedAt: number;        // epoch ms when stored
  actasPct: number | null;
  leaderSlug: string;
  leaderVotes: number;
  leaderPct: number;
  runnerSlug: string;
  runnerVotes: number;
  runnerPct: number;
  voteGap: number;
  ppGap: number;
}

export function RunoffConteoBlock() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);
  // Two snapshots: the most recent one we surfaced as "previous" for deltas
  // (snapshotForInsight) and the absolute last seen (snapshotPending) which
  // we promote once actas/votes have moved enough to be a real comparison.
  const snapshotForInsight = useRef<InsightSnapshot | null>(null);
  const snapshotPending = useRef<InsightSnapshot | null>(null);
  const [, force] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/runoff-conteo", { cache: "no-store" });
      if (!res.ok) return;
      const json: ApiResponse = await res.json();
      setData(json);
      setLastFetch(Date.now());

      // Build a snapshot we can diff against later.
      const candSorted = [...json.candidates].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
      const a = candSorted[0];
      const b = candSorted[1];
      if (a?.votes != null && b?.votes != null && a.slug && b.slug) {
        const newSnap: InsightSnapshot = {
          capturedAt: Date.now(),
          actasPct: json.actasPct ?? null,
          leaderSlug: a.slug,
          leaderVotes: a.votes,
          leaderPct: a.percentage ?? 0,
          runnerSlug: b.slug,
          runnerVotes: b.votes,
          runnerPct: b.percentage ?? 0,
          voteGap: a.votes - b.votes,
          ppGap: (a.percentage ?? 0) - (b.percentage ?? 0),
        };
        if (!snapshotForInsight.current) {
          // First load — nothing to compare yet; seed the pending bucket.
          snapshotForInsight.current = newSnap;
          snapshotPending.current = newSnap;
        } else {
          // Promote pending → forInsight when actas has moved ≥0.05% OR
          // ≥45s have passed since the last surfaced snapshot. This keeps
          // the insight talking about REAL movement.
          const prev = snapshotForInsight.current;
          const ageMs = newSnap.capturedAt - prev.capturedAt;
          const actasMoved = newSnap.actasPct != null && prev.actasPct != null
            && Math.abs(newSnap.actasPct - prev.actasPct) >= 0.05;
          const votesMoved = Math.abs(newSnap.voteGap - prev.voteGap) >= 50;
          if (ageMs >= 45_000 && (actasMoved || votesMoved)) {
            snapshotForInsight.current = snapshotPending.current ?? prev;
          }
          snapshotPending.current = newSnap;
        }
        // Force a re-render so the insight ticks even when data ref equality
        // would otherwise suppress it.
        force((x) => x + 1);
      }
    } catch {
      /* swallow — keep previous data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // ── Share handler ────────────────────────────────────────────────────────
  // Generates the 1080×1920 story image with the current snapshot + insight
  // and tries the native share sheet (Instagram/WhatsApp story, AirDrop, X).
  // Falls back to opening the image in a new tab + copying the page URL on
  // desktops / browsers without share-with-file support.
  const [shareState, setShareState] = useState<"idle" | "sharing" | "shared" | "error">("idle");
  const handleShare = useCallback(async () => {
    if (shareState === "sharing") return;
    setShareState("sharing");
    try {
      // Build the OG URL with current insight params so the image matches what
      // the user sees on screen at this moment.
      const params = new URLSearchParams();
      const cur = snapshotForInsight.current;
      const pen = snapshotPending.current;
      if (cur && pen) {
        const dir = pen.leaderSlug !== cur.leaderSlug
          ? "flip"
          : pen.voteGap > cur.voteGap + 49 ? "widen"
            : pen.voteGap < cur.voteGap - 49 ? "narrow"
              : "flat";
        params.set("dir", dir);
        params.set("dv", String(Math.round(pen.voteGap - cur.voteGap)));
        params.set("sm", String(Math.max(1, Math.round((pen.capturedAt - cur.capturedAt) / 60_000))));
        const leaderName = pen.leaderSlug === "keiko-fujimori" ? "K. Fujimori" : "R. Sánchez";
        const runnerName = pen.runnerSlug === "keiko-fujimori" ? "K. Fujimori" : "R. Sánchez";
        params.set("lead", leaderName);
        params.set("run", runnerName);
      }
      const imgUrl = `/api/og/conteo-story?${params.toString()}&t=${Date.now()}`;
      const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/pe` : "https://www.condorlatam.com/pe";
      const text = "Sigo el balotaje Perú 2026 en vivo con CONDOR AI 🇵🇪 — conteo ONPE y momentum cada 5 min.";

      // Try native share with the image file (Instagram/WhatsApp stories, AirDrop)
      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          const res = await fetch(imgUrl, { cache: "no-store" });
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], "balotaje-peru-2026.png", { type: "image/png" });
            // canShare check: some browsers reject files in `share()` silently.
            const canShareFile = typeof navigator.canShare === "function"
              ? navigator.canShare({ files: [file] })
              : true;
            if (canShareFile) {
              await navigator.share({
                title: "Balotaje Perú 2026 — conteo en vivo",
                text,
                url: pageUrl,
                files: [file],
              });
              setShareState("shared");
              setTimeout(() => setShareState("idle"), 2500);
              return;
            }
          }
        } catch {
          /* fall through to URL-only share */
        }
        try {
          await navigator.share({
            title: "Balotaje Perú 2026 — conteo en vivo",
            text,
            url: pageUrl,
          });
          setShareState("shared");
          setTimeout(() => setShareState("idle"), 2500);
          return;
        } catch {
          /* user canceled — keep idle */
        }
      }

      // Desktop / no-share fallback: open the image in a new tab and copy
      // the page URL to the clipboard so the user can paste it manually.
      window.open(imgUrl, "_blank", "noopener");
      try { await navigator.clipboard.writeText(pageUrl); } catch { /* ignore */ }
      setShareState("shared");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2500);
    }
  }, [shareState]);

  if (!data) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white px-5 py-6 text-center text-sm text-stone-500">
        Cargando conteo en vivo…
      </div>
    );
  }

  const badge = SOURCE_BADGE[data.sourceType] ?? SOURCE_BADGE.waiting;
  const hasNumbers = data.candidates.some((c) => c.percentage != null);
  const sorted = [...data.candidates].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
  const leader = sorted[0];
  const runner = sorted[1];
  const delta = leader?.percentage != null && runner?.percentage != null
    ? leader.percentage - runner.percentage
    : null;
  const voteDelta = leader?.votes != null && runner?.votes != null
    ? leader.votes - runner.votes
    : null;
  const tightRace = delta != null && delta < 2.5;

  /**
   * Insight = movement vs the last surfaced snapshot. We answer:
   *   "in the last N min, did the gap widen or narrow, and by how much?"
   * Returns null when there isn't a meaningful previous snapshot yet.
   */
  type Insight = {
    direction: "widen" | "narrow" | "flat" | "flip";
    leaderName: string;
    deltaVotes: number;
    deltaPp: number;
    sinceMin: number;
    actasDelta: number;
  };
  function computeInsight(): Insight | null {
    const prev = snapshotForInsight.current;
    if (!prev || !leader || !runner || leader.votes == null || runner.votes == null) return null;
    const curGap = leader.votes - runner.votes;
    const prevSameLeader = prev.leaderSlug === leader.slug;
    const sinceMin = Math.max(1, Math.round((Date.now() - prev.capturedAt) / 60_000));
    const actasDelta = (data?.actasPct ?? 0) - (prev.actasPct ?? 0);
    if (!prevSameLeader) {
      // Lead flipped between snapshots — huge headline.
      return {
        direction: "flip",
        leaderName: leader.shortName || leader.name,
        deltaVotes: curGap,
        deltaPp: (leader.percentage ?? 0) - (runner.percentage ?? 0),
        sinceMin,
        actasDelta,
      };
    }
    const gapDelta = curGap - prev.voteGap;
    const ppDelta = ((leader.percentage ?? 0) - (runner.percentage ?? 0)) - prev.ppGap;
    if (Math.abs(gapDelta) < 50 && Math.abs(ppDelta) < 0.01) {
      return { direction: "flat", leaderName: leader.shortName || leader.name, deltaVotes: 0, deltaPp: 0, sinceMin, actasDelta };
    }
    return {
      direction: gapDelta > 0 ? "widen" : "narrow",
      leaderName: leader.shortName || leader.name,
      deltaVotes: gapDelta,
      deltaPp: ppDelta,
      sinceMin,
      actasDelta,
    };
  }
  const insight = computeInsight();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border-2 overflow-hidden bg-gradient-to-br", badge.tint, badge.ring)}
    >
      {/* Header — pill + actions. Source label ("ONPE") and "X% actas" used
          to live here too, but they were redundant (pill already names ONPE,
          and actas % is the headline of the Actas progress block right
          below) — removed so the row fits one line on mobile. */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-stone-200/60 bg-white/60 backdrop-blur">
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="h-4 w-4 text-stone-700 shrink-0" />
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white whitespace-nowrap", badge.pillBg)}>
            <span className="h-1 w-1 rounded-full bg-white pulse-dot" />
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            disabled={shareState === "sharing"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all",
              "bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50",
            )}
            aria-label="Compartir conteo como imagen"
          >
            {shareState === "sharing" ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : shareState === "shared" ? (
              <Check className="h-3 w-3" />
            ) : (
              <Share2 className="h-3 w-3" />
            )}
            {shareState === "shared" ? "Listo" : shareState === "sharing" ? "Generando" : "Compartir"}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-700 font-medium disabled:opacity-50"
            aria-label={Math.round(Math.max(0, Date.now() - lastFetch) / 1000) < 5 ? "Actualizado hace segundos" : "Actualizar"}
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            {/* Hide label on the tightest screens — the share button is the
                priority action; refresh is auto-polled every 60s anyway. */}
            <span className="hidden sm:inline">
              {Math.round(Math.max(0, Date.now() - lastFetch) / 1000) < 5 ? "Actualizado" : "Actualizar"}
            </span>
          </button>
        </div>
      </div>

      {/* Actas progress (only when official + counted > 0) */}
      {data.actasPct != null && data.actasPct > 0 && (() => {
        const actasMissing = data.actasCounted != null && data.actasTotal != null
          ? Math.max(0, data.actasTotal - data.actasCounted)
          : null;
        // Estimación honesta: votos promedio por acta * actas que faltan.
        // Es una estimación, no un dato cerrado — las mesas no tienen tamaño
        // uniforme (rural vs urbano vs exterior). Lo etiquetamos como "≈".
        const estimatedRemainingVotes = (
          actasMissing != null &&
          data.totalVotesEmitted != null &&
          data.actasCounted != null &&
          data.actasCounted > 0
        )
          ? Math.round((data.totalVotesEmitted / data.actasCounted) * actasMissing)
          : null;
        return (
          <div className="px-5 py-3 bg-emerald-50/40 border-b border-emerald-100/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Actas escrutadas
              </span>
              {data.actasCounted != null && data.actasTotal != null && (
                <span className="text-[10px] font-mono text-emerald-700 tabular-nums">
                  {data.actasCounted.toLocaleString("es-PE")} / {data.actasTotal.toLocaleString("es-PE")}
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                initial={{ width: 0 }}
                animate={{ width: `${data.actasPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            {/* Falta por contar — actas exactas + votos estimados.
                "≈" marca la estimación; las actas son dato duro. */}
            {actasMissing != null && actasMissing > 0 && (
              <p className="mt-2 text-[11px] text-emerald-800/80">
                Faltan{" "}
                <strong className="font-mono tabular-nums text-emerald-900">
                  {actasMissing.toLocaleString("es-PE")} actas
                </strong>
                {estimatedRemainingVotes != null && estimatedRemainingVotes > 0 && (
                  <>
                    {" "}—{" "}
                    <strong className="font-mono tabular-nums text-emerald-900">
                      ≈ {estimatedRemainingVotes.toLocaleString("es-PE")} votos
                    </strong>{" "}
                    <span className="text-emerald-700/70">por contar (estimado)</span>
                  </>
                )}
              </p>
            )}
            {actasMissing === 0 && (
              <p className="mt-2 text-[11px] font-bold text-emerald-900">
                Cómputo al 100% — todas las actas escrutadas
              </p>
            )}
          </div>
        );
      })()}

      {/* Diferencia hero strip — designed to be readable in 2 seconds by
          anyone, no electoral background required. Reads like a sentence:
          "X,XXX votos los separan · Empate técnico · La distancia se cierra".
          The vote count is the headline, not buried on the side. */}
      {hasNumbers && voteDelta != null && delta != null && leader && runner && (() => {
        // Pick a plain-language tag for how tight the race is.
        const raceTag = delta < 0.5
          ? { label: "Prácticamente empate", className: "bg-amber-100 text-amber-900 border-amber-200" }
          : delta < 2.5
            ? { label: "Empate técnico", className: "bg-amber-100 text-amber-900 border-amber-200" }
            : delta < 5
              ? { label: "Diferencia ajustada", className: "bg-stone-200 text-stone-800 border-stone-300" }
              : { label: "Diferencia clara", className: "bg-stone-200 text-stone-800 border-stone-300" };

        return (
          <div
            className={cn(
              "px-5 py-4 border-b",
              tightRace ? "bg-amber-50/70 border-amber-100" : "bg-stone-50 border-stone-100",
            )}
          >
            {/* HERO: big number + sentence */}
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 font-mono tabular-nums leading-none">
                {formatVotes(voteDelta)}
              </span>
              <span className="text-sm sm:text-base text-stone-700 leading-tight">
                votos separan a{" "}
                <strong className="text-stone-900">{leader.shortName}</strong>{" "}
                de{" "}
                <strong className="text-stone-900">{runner.shortName}</strong>
              </span>
            </div>

            {/* Tag line: how tight is the race in plain words */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]", raceTag.className)}>
                {raceTag.label}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {delta < 0.1 ? "<0.1" : delta.toFixed(1)}% de diferencia
              </span>
            </div>

            {/* Live movement: SE ACHICA / SE AMPLÍA / SIN CAMBIOS / CAMBIO DE LÍDER */}
            {insight && (
              <div className="flex items-center gap-2 text-[11px] mt-2 flex-wrap">
                {insight.direction === "flip" ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]">
                      <TrendingUp className="h-3 w-3" />
                      Cambió el líder
                    </span>
                    <span className="text-stone-700">
                      Ahora va arriba <strong>{insight.leaderName}</strong>
                    </span>
                  </>
                ) : insight.direction === "widen" ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]">
                      <TrendingUp className="h-3 w-3" />
                      Se amplía
                    </span>
                    <span className="text-stone-700">
                      <strong>{insight.leaderName}</strong> sumó{" "}
                      <strong className="font-mono tabular-nums">+{formatVotes(insight.deltaVotes)} votos</strong>{" "}
                      en {insight.sinceMin} min
                    </span>
                  </>
                ) : insight.direction === "narrow" ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]">
                      <TrendingDown className="h-3 w-3" />
                      Se achica
                    </span>
                    <span className="text-stone-700">
                      <strong>{runner.shortName}</strong> recortó{" "}
                      <strong className="font-mono tabular-nums">{formatVotes(Math.abs(insight.deltaVotes))} votos</strong>{" "}
                      en {insight.sinceMin} min
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 text-stone-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em]">
                      <Minus className="h-3 w-3" />
                      Sin cambios
                    </span>
                    <span className="text-stone-500">
                      La distancia no se mueve
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Candidates rows — plain divs, no per-row Framer animations.
          Earlier we had a stagger animation here; it froze on slow mobile
          renders (some rows stayed at opacity:0 indefinitely on real devices),
          and the block parent already animates in. The bar width has its own
          CSS transition so we don't lose the "filling up" feel. */}
      <div className="bg-white">
        {sorted.map((c, i) => {
          const isLeader = i === 0 && c.percentage != null && c.percentage > (runner?.percentage ?? 0);
          const pct = c.percentage ?? 0;
          const barWidth = hasNumbers ? Math.max(2, pct) : 0;
          return (
            <div
              key={c.slug ?? c.name}
              className={cn("relative px-5 py-4 border-b border-stone-100 last:border-b-0", isLeader && "bg-stone-50/50")}
            >
              {/* Background bar (CSS transition only) */}
              <div
                className="absolute inset-y-0 left-0 opacity-[0.10] transition-[width] duration-700 ease-out"
                style={{ width: `${barWidth}%`, backgroundColor: c.partyColor ?? "#888" }}
              />
              <div className="relative flex items-center gap-3 sm:gap-4">
                <div className="flex flex-col items-center gap-0.5 w-8 sm:w-10 shrink-0">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.partyColor ?? "#888" }} />
                  <span className="text-[9px] font-mono text-stone-400">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-stone-900 truncate">
                    {c.shortName || c.name}
                  </p>
                  {c.party && (
                    <p className="text-[11px] text-stone-500 truncate">{c.party}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono tabular-nums">
                    <span className="text-2xl sm:text-3xl font-black" style={{ color: c.partyColor ?? "#111" }}>
                      {c.percentage != null ? c.percentage.toFixed(1) : "—"}
                    </span>
                    <span className="text-base text-stone-400">%</span>
                  </div>
                  {c.votes != null && (
                    <p className="text-[10px] font-mono text-stone-500 tabular-nums">
                      {formatVotes(c.votes)} votos
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — delta or waiting state */}
      <div className="px-5 py-3 border-t border-stone-200/60 bg-white/60 backdrop-blur">
        {!hasNumbers ? (
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Hourglass className="h-3.5 w-3.5" />
            <span>
              {data.note ?? "ONPE publica los primeros boletines tras el cierre de mesas."}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 text-[10px] text-stone-500 font-mono">
            <span>Captura: {formatTime(data.capturedAt)} (Lima)</span>
            {data.isOfficial && (
              <a
                href="https://resultadosegundavuelta.onpe.gob.pe/main/resumen"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-stone-700 underline"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                Ver ONPE
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
