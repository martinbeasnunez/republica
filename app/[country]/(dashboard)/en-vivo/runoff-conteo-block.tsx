"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, ExternalLink, Hourglass } from "lucide-react";
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
const SOURCE_BADGE: Record<ApiResponse["sourceType"], { label: string; tint: string; ring: string; pillBg: string }> = {
  official:   { label: "CONTEO OFICIAL ONPE", tint: "from-emerald-50 to-white",  ring: "border-emerald-600/30",  pillBg: "bg-emerald-600" },
  waiting:    { label: "ESPERANDO ONPE",       tint: "from-stone-100 to-white",  ring: "border-stone-300/60",   pillBg: "bg-stone-600" },
  exit_poll:  { label: "ESPERANDO ONPE",       tint: "from-stone-100 to-white",  ring: "border-stone-300/60",   pillBg: "bg-stone-600" },
  quick_count:{ label: "ESPERANDO ONPE",       tint: "from-stone-100 to-white",  ring: "border-stone-300/60",   pillBg: "bg-stone-600" },
};

export function RunoffConteoBlock() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/runoff-conteo", { cache: "no-store" });
      if (!res.ok) return;
      const json: ApiResponse = await res.json();
      setData(json);
      setLastFetch(Date.now());
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border-2 overflow-hidden bg-gradient-to-br", badge.tint, badge.ring)}
    >
      {/* Header — source + actas */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-stone-200/60 bg-white/60 backdrop-blur">
        <div className="flex items-center gap-2 flex-wrap">
          <BarChart3 className="h-5 w-5 text-stone-700" />
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-white", badge.pillBg)}>
            <span className="h-1 w-1 rounded-full bg-white pulse-dot" />
            {badge.label}
          </span>
          <span className="text-[11px] font-bold text-stone-700">
            {data.source}
          </span>
          {data.actasPct != null && (
            <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
              {data.actasPct.toFixed(1)}% actas
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-700 font-medium disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          {Math.round(Math.max(0, Date.now() - lastFetch) / 1000) < 5 ? "Actualizado" : "Actualizar"}
        </button>
      </div>

      {/* Actas progress (only when official + counted > 0) */}
      {data.actasPct != null && data.actasPct > 0 && (
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
        </div>
      )}

      {/* Live delta strip — leader gap in absolute votes + percentage points.
          The user asked for the vote-count gap to be visible so they don't have
          to do the subtraction in their head. Bold numbers, mono digits, clear
          "tight race" treatment when the lead is inside the MoE band. */}
      {hasNumbers && voteDelta != null && delta != null && (
        <div
          className={cn(
            "px-5 py-3 border-b flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1",
            tightRace
              ? "bg-amber-50/60 border-amber-100/60"
              : "bg-stone-50 border-stone-100",
          )}
        >
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.18em]",
                tightRace ? "text-amber-800" : "text-stone-500",
              )}
            >
              Diferencia
            </span>
            <span className="text-[11px] text-stone-600">
              <strong className="text-stone-900">{leader?.shortName}</strong>
              {" vs "}
              <strong className="text-stone-900">{runner?.shortName}</strong>
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-xl sm:text-2xl font-black text-stone-900">
              {formatVotes(voteDelta)}
            </span>
            <span className="text-[11px] text-stone-500">votos</span>
            <span className="text-stone-300">·</span>
            <span className="text-sm font-bold text-stone-700">
              {delta.toFixed(1)} pp
            </span>
            {tightRace && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded ml-1">
                Margen de error
              </span>
            )}
          </div>
        </div>
      )}

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
