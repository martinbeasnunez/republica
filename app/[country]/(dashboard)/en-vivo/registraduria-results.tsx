"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// CONDOR — Preconteo Registraduría (Colombia)
// =============================================================================
// Consumes /api/registraduria-results which proxies+normalizes the public
// upstream `https://resultados.registraduria.gov.co/json/ACT/PR/00.json`.
// Auto-refresh every 5s during the live day; backs off if upstream is down.
//
// Mirror of ExitPollResults (PE/ONPE) so /co/en-vivo gets the same UX when
// the country switches to MODE A (post-election with official results).
// =============================================================================

interface RgCandidate {
  code: string;
  partyCode: string;
  name: string;
  displayName: string;
  runningMate?: string;
  votes: number;
  percentage: number;
}

interface RgProgress {
  percentage: number;
  counted: number;
  total: number;
  pending: number;
  totalVotesEmitted: number;
  totalValidVotes: number;
  updatedAt: number;
}

interface RgData {
  candidates: RgCandidate[];
  progress: RgProgress;
  blankVotes: number;
  nullVotes: number;
}

// Map Registraduría party codes to the candidate party colors we already use
// in lib/data/candidates.ts. Defaults to a neutral grey when a party is new.
const PARTY_COLORS: Record<string, string> = {
  "2": "#003893",   // Centro Democrático (Paloma Valencia)
  "3": "#FF8C00",   // Dignidad y Compromiso (Sergio Fajardo)
  "4": "#1B3A5C",   // Movimiento Valientes / similar
  "5": "#888888",
  "6": "#7C3AED",   // La Fuerza de la Paz (Roy Barreras)
  "7": "#CE1126",   // Pacto Histórico (Iván Cepeda)
  "8": "#666666",
  "9": "#10b981",
  "10": "#1B3A5C",  // Colombia Justa Libres (Abelardo)
  "11": "#FCD116",  // Imparables (Claudia López)
  "12": "#0EA5E9",
  "13": "#EF4444",
  "14": "#A855F7",
};

function formatNumber(n: number): string {
  return n.toLocaleString("es-CO");
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}


/** Cierre de mesas en Colombia: 4:00 p.m. hora local. El preconteo sólo
 *  cobra protagonismo después; antes mantenemos el bloque colapsado. */
function isPollsClosedInBogota(): boolean {
  const hour = parseInt(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Bogota",
      hour: "numeric",
      hour12: false,
    }),
    10,
  );
  return Number.isFinite(hour) && hour >= 16;
}

export function RegistraduriaResults() {
  // SSR-safe: render closed initially, then expand after mount if mesas cerraron.
  // Evita hydration mismatch porque el server siempre dice `false`.
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<RgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // After mount: auto-expand if it's already past closing time
  useEffect(() => {
    if (isPollsClosedInBogota()) setOpen(true);
    // Re-check every minute in case the user has the page open through 4 p.m.
    const id = setInterval(() => {
      if (isPollsClosedInBogota()) setOpen(true);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/registraduria-results");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || "error" in json) {
        const detail =
          (json && typeof json === "object" && "detail" in json && typeof json.detail === "string"
            ? json.detail
            : null) ||
          (json && typeof json === "object" && "error" in json && typeof json.error === "string"
            ? json.error
            : null);
        setError(true);
        setErrorDetail(detail);
        return;
      }
      setData(json as RgData);
      setError(false);
      setErrorDetail(null);
      setLastFetch(Date.now());
    } catch (e) {
      setError(true);
      setErrorDetail(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 3 * 60 * 1000); // 3 min polling
    return () => clearInterval(interval);
  }, [fetchResults]);

  const leader = data?.candidates[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      // 🇨🇴 Paleta bandera de Colombia: amarillo (#FCD116) → azul (#003893) → rojo (#CE1126)
      className="rounded-2xl border-2 border-[#FCD116]/40 bg-gradient-to-br from-[#003893] via-[#002461] to-[#CE1126]/80 overflow-hidden"
    >
      {/* Header — franja amarillo bandera */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-[#FCD116]/15 border-b border-[#FCD116]/30 hover:bg-[#FCD116]/20 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="h-5 w-5 text-[#FCD116]" />
          <span className="text-sm font-black text-[#FCD116] uppercase tracking-wider">
            Preconteo Oficial · Registraduría
          </span>
          {data && (
            <span className="text-[11px] text-white/80 font-mono tabular-nums">
              {data.progress.percentage.toFixed(1)}% mesas
            </span>
          )}
          <span className="h-2 w-2 rounded-full bg-[#FCD116] pulse-dot" />
        </div>
        <ChevronDown className={cn("h-4 w-4 text-[#FCD116] transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 py-4 space-y-4">
              {loading && !data && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 text-[#FCD116] animate-spin" />
                  <span className="ml-2 text-sm text-white/70">Cargando preconteo Registraduría...</span>
                </div>
              )}

              {error && !data && (
                <div className="rounded-lg border border-[#CE1126]/50 bg-[#CE1126]/15 p-4">
                  <p className="text-sm font-bold text-white">Registraduría no está respondiendo</p>
                  {errorDetail && <p className="text-xs text-white/70 font-mono mt-1">{errorDetail}</p>}
                  <a
                    href="https://resultados.registraduria.gov.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#FCD116] hover:underline mt-2"
                  >
                    Ver en Registraduría <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {data && (
                <>
                  {/* Progress bar — barra amarilla, fondo azul, accent rojo si avanza poco */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/70 font-mono">
                      <span>Mesas escrutadas</span>
                      <span>
                        {formatNumber(data.progress.counted)} / {formatNumber(data.progress.total)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#FCD116] transition-all"
                        style={{ width: `${Math.min(100, data.progress.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/60 font-mono">
                      <span className="text-base font-black text-[#FCD116] tabular-nums">
                        {data.progress.percentage.toFixed(3)}%
                      </span>
                      <span>Pendientes: {formatNumber(data.progress.pending)}</span>
                    </div>
                  </div>

                  {/* Candidates table */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-[28px_1fr_90px_60px] gap-2 text-[10px] uppercase tracking-wider text-white/50 font-mono px-2">
                      <span>#</span>
                      <span>Candidato</span>
                      <span className="text-right">Votos</span>
                      <span className="text-right">%</span>
                    </div>
                    {data.candidates.map((c, i) => {
                      const color = PARTY_COLORS[c.partyCode] || "#FFFFFF";
                      const isLeader = i === 0 && c.votes > 0;
                      return (
                        <div
                          key={c.code}
                          className={cn(
                            "grid grid-cols-[28px_1fr_90px_60px] gap-2 items-center px-2 py-1.5 rounded-lg",
                            isLeader && "bg-[#FCD116]/15 border border-[#FCD116]/50",
                          )}
                        >
                          <span className="text-xs font-mono text-white/60 tabular-nums">{i + 1}</span>
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className={cn("text-sm font-medium truncate", isLeader ? "text-[#FCD116]" : "text-white")}>
                              {c.displayName}
                            </span>
                          </div>
                          <span className="text-sm font-mono text-white text-right tabular-nums">
                            {formatNumber(c.votes)}
                          </span>
                          <span className={cn("text-sm font-mono font-bold text-right tabular-nums", isLeader ? "text-[#FCD116]" : "text-white")}>
                            {c.percentage.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Blanks / nulls — separador rojo bandera */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#CE1126]/40">
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                        Votos en blanco
                      </div>
                      <div className="text-sm font-mono text-white tabular-nums">
                        {formatNumber(data.blankVotes)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                        Votos nulos
                      </div>
                      <div className="text-sm font-mono text-white tabular-nums">
                        {formatNumber(data.nullVotes)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                        Total emitidos
                      </div>
                      <div className="text-sm font-mono text-white tabular-nums">
                        {formatNumber(data.progress.totalVotesEmitted)}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10px] text-white/60 font-mono">
                    <a
                      href="https://resultados.registraduria.gov.co/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-[#FCD116] transition-colors"
                    >
                      Ver en Registraduría <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="flex items-center gap-3">
                      {lastFetch > 0 && <span>Actualizado: {formatTime(lastFetch)}</span>}
                      <button
                        type="button"
                        onClick={fetchResults}
                        disabled={loading}
                        className="inline-flex items-center gap-1 hover:text-[#FCD116] transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {leader && leader.votes === 0 && data.progress.percentage === 0 && (
                    <p className="text-center text-xs text-white/70 italic pt-1">
                      Preconteo aún no inicia · los puestos de votación cierran a las 4:00 p.m. hora colombiana.
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
