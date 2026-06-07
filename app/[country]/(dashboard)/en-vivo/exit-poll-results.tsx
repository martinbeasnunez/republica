"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnpeCandidate {
  name: string;
  party: string;
  votes: number;
  percentage: number;
  percentageEmitted: number;
  code: string;
  dni: string;
}

interface OnpeProgress {
  percentage: number;
  counted: number;
  total: number;
  pending: number;
  sentToJEE: number;
  totalVotesEmitted: number;
  totalValidVotes: number;
  updatedAt: number;
}

interface OnpeData {
  candidates: OnpeCandidate[];
  progress: OnpeProgress;
  blankVotes: number;
  nullVotes: number;
}

// Map ONPE party codes to colors matching our candidate data
const PARTY_COLORS: Record<string, string> = {
  "8": "#ff6600",   // Fuerza Popular
  "35": "#1e3a8a",  // Renovación Popular
  "16": "#7c3aed",  // Buen Gobierno
  "14": "#059669",  // Cívico Obras
  "23": "#f59e0b",  // País para Todos
  "10": "#0ea5e9",  // Ahora Nación
  "2": "#dc2626",   // Juntos por el Perú
  "33": "#6366f1",  // Primero la Gente
  "31": "#14b8a6",  // SICREO
  "21": "#8b5cf6",  // Frente de la Esperanza
};

function formatNumber(n: number): string {
  return n.toLocaleString("es-PE");
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  });
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length <= 2) return fullName;
  // Take first name + last last name
  return `${parts[0]} ${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
}

export function ExitPollResults() {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState<OnpeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/onpe-results");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || "error" in json) {
        const detail =
          (json && typeof json === "object" && "detail" in json && typeof json.detail === "string"
            ? json.detail
            : null) ||
          (json && typeof json === "object" && "error" in json && typeof json.error === "string"
            ? json.error
            : null);
        throw new Error(detail || `HTTP ${res.status}`);
      }
      setData(json as OnpeData);
      setError(false);
      setErrorDetail(null);
      setLastFetch(Date.now());
    } catch (err) {
      setError(true);
      setErrorDetail(err instanceof Error ? err.message : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchResults, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  const top8 = data?.candidates.slice(0, 8) || [];
  const maxVotes = top8.length > 0 ? top8[0].votes : 1;

  // Top 2 for collapsed summary
  const top2 = top8.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-emerald-600/30 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-white" />
          <span className="text-sm font-black text-white uppercase tracking-wider">
            Conteo Oficial ONPE
          </span>
          <span className="text-[10px] font-mono text-white bg-red-500/90 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            Balotaje
          </span>
          {data && (
            <span className="text-[10px] font-mono text-emerald-200 bg-emerald-900/40 px-2 py-0.5 rounded-full">
              {data.progress.percentage.toFixed(1)}% actas
            </span>
          )}
          <span className="h-2 w-2 rounded-full bg-white pulse-dot" />
        </div>
        <div className="flex items-center gap-3">
          {!open && top2.length > 0 && (
            <span className="text-[11px] text-white/80 font-mono hidden sm:inline">
              {top2.map((c) => {
                const last = c.name.split(" ").pop();
                return `${last} ${c.percentage.toFixed(1)}%`;
              }).join(" · ")}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-white transition-transform", open && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Progress bar */}
            {data && (
              <div className="px-5 py-3 bg-emerald-50/80 border-b border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Actas contabilizadas
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700">
                    {formatNumber(data.progress.counted)} / {formatNumber(data.progress.total)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-emerald-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${data.progress.percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[22px] font-black font-mono text-emerald-800 tabular-nums">
                    {data.progress.percentage.toFixed(3)}%
                  </span>
                  <span className="text-[10px] text-emerald-600">
                    Pendientes: {formatNumber(data.progress.pending)}
                  </span>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && !data && (
              <div className="flex items-center justify-center py-10 bg-card">
                <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando resultados ONPE...</span>
              </div>
            )}

            {/* Error state */}
            {error && !data && (
              <div className="px-5 py-6 bg-card text-center">
                <p className="text-sm font-semibold text-foreground">
                  ONPE no está respondiendo
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  El portal oficial{" "}
                  <a
                    href="https://resultadoelectoral.onpe.gob.pe/main/presidenciales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-emerald-700"
                  >
                    resultadoelectoral.onpe.gob.pe
                  </a>{" "}
                  está temporalmente no disponible. Volveremos a intentarlo automáticamente cada 3 minutos.
                </p>
                {errorDetail && (
                  <p className="mt-2 text-[10px] font-mono text-muted-foreground/70">
                    {errorDetail}
                  </p>
                )}
                <button
                  onClick={fetchResults}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Reintentar ahora
                </button>
              </div>
            )}

            {/* Results table */}
            {data && (
              <div className="bg-card">
                <div className="flex items-center px-5 py-2 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="flex-1">Candidato</span>
                  <span className="w-20 text-right hidden sm:block">Votos</span>
                  <span className="w-20 text-center">%</span>
                </div>

                {top8.map((candidate, i) => {
                  const barWidth = (candidate.votes / maxVotes) * 100;
                  const isTop2 = i < 2;
                  const color = PARTY_COLORS[candidate.code] || "#6b7280";

                  return (
                    <motion.div
                      key={candidate.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "flex items-center px-5 py-2.5 border-b border-border/50 relative",
                        isTop2 && "bg-emerald-50/50"
                      )}
                    >
                      {/* Background bar */}
                      <div
                        className="absolute inset-y-0 left-0 opacity-[0.07]"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: color,
                        }}
                      />

                      <div className="flex-1 min-w-0 flex items-center gap-2 relative z-10">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[8px] font-mono text-muted-foreground/60">{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-semibold truncate", isTop2 && "text-emerald-900")}>
                            {shortenName(candidate.name)}
                          </p>
                          <p className="text-[9px] text-muted-foreground truncate">{candidate.party}</p>
                        </div>
                      </div>
                      <span className="w-20 text-right font-mono text-[11px] tabular-nums text-muted-foreground hidden sm:block relative z-10">
                        {formatNumber(candidate.votes)}
                      </span>
                      <div className="w-20 flex items-center justify-center gap-1.5 relative z-10">
                        <span className={cn(
                          "font-mono text-sm tabular-nums font-bold",
                          isTop2 ? "text-emerald-700" : "text-foreground"
                        )}>
                          {candidate.percentage.toFixed(2)}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Blank + null votes */}
                <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-muted/30">
                  <div className="flex gap-4 text-[10px] text-muted-foreground">
                    <span>Votos en blanco: <span className="font-mono font-medium tabular-nums">{formatNumber(data.blankVotes)}</span></span>
                    <span>Votos nulos: <span className="font-mono font-medium tabular-nums">{formatNumber(data.nullVotes)}</span></span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    Total emitidos: {formatNumber(data.progress.totalVotesEmitted)}
                  </span>
                </div>
              </div>
            )}

            {/* ONPE link + refresh */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <a
                  href="https://resultadoelectoral.onpe.gob.pe/main/resumen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver en ONPE
                </a>
                {data?.progress.updatedAt && (
                  <span className="text-[10px] text-emerald-600 font-mono">
                    ONPE actualizado: {formatTime(data.progress.updatedAt)}
                  </span>
                )}
              </div>
              <button
                onClick={fetchResults}
                disabled={loading}
                className="flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-900 font-medium disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                Actualizar
              </button>
            </div>

            {/* Election-day note */}
            <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-primary/5 border-t border-emerald-100">
              <p className="text-[11px] text-emerald-800 font-bold">
                Mesas abiertas hasta las 5:00 p.m. hora Lima
              </p>
              <p className="text-[11px] text-primary font-medium mt-1">
                Los primeros boletines oficiales de ONPE inician tras el cierre. CONDOR AI actualiza esta tabla cada 3 minutos y verifica titulares en tiempo real.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
