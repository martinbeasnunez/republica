"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronRight, ChevronDown, Activity } from "lucide-react";
import Link from "next/link";
import { useCountry } from "@/lib/config/country-context";

// =============================================================================
// CONDOR AI Pulse — live feed cada 5 minutos
// =============================================================================
// El pulso más reciente arriba (con typing effect cuando recién llega), abajo
// el historial cronológico con "hace Xm". El cliente hace polling cada 30s
// al endpoint /api/pulse?country=co. Cuando llega un pulso nuevo, el anterior
// baja al historial con animación de push.
// =============================================================================

interface Pulse {
  id: string;
  generated_at: string;
  summary: string;
  metrics: Record<string, unknown> | null;
  phase: string | null;
}

interface Props {
  /** Pulses iniciales (server-rendered) — el cliente los reemplaza con poll */
  initialPulses: Pulse[];
}

// ── Formatting helpers ──────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora";
  if (mins === 1) return "hace 1 min";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "hace 1 hora";
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "hace 1 día" : `hace ${days} días`;
}

function formatTime(iso: string, locale: string, tz: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

// ── Main component ──────────────────────────────────────────────────────────
export function CondorAIPulse({ initialPulses }: Props) {
  const country = useCountry();
  const locale = country.locale.replace("_", "-");
  const tz = country.timezone;

  const [pulses, setPulses] = useState<Pulse[]>(initialPulses);
  const [nextRefreshAt, setNextRefreshAt] = useState<number>(() => Date.now() + 30_000);
  const [tick, setTick] = useState(0);
  const seenIdsRef = useRef<Set<string>>(new Set(initialPulses.map((p) => p.id)));

  // ── Poll for new pulses every 30s ─────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/pulse?country=${country.code}&limit=12`, { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { pulses: Pulse[] };
      const fresh = json.pulses ?? [];
      const newOnes = fresh.filter((p) => !seenIdsRef.current.has(p.id));
      if (newOnes.length > 0) {
        newOnes.forEach((p) => seenIdsRef.current.add(p.id));
        setPulses(fresh);
      } else if (fresh.length !== pulses.length) {
        // count changed (e.g. older pulse fell out of window) → still update
        setPulses(fresh);
      }
    } catch {
      /* swallow — try again next tick */
    } finally {
      setNextRefreshAt(Date.now() + 30_000);
    }
  }, [country.code, pulses.length]);

  useEffect(() => {
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [poll]);

  // ── Re-render every 15s so the "hace Xm" labels stay fresh ───────────────
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  // ── Typing effect for the most recent pulse ──────────────────────────────
  const latest = pulses[0];
  const latestText = latest?.summary ?? "";
  const latestId = latest?.id ?? "";
  const [typedLen, setTypedLen] = useState(0);

  useEffect(() => {
    if (!latestId || !latestText) return;
    setTypedLen(0);
    let i = 0;
    const id = setInterval(() => {
      const ch = latestText[i] ?? "";
      const step = /[\s]/.test(ch) ? 3 : 1;
      i = Math.min(i + step, latestText.length);
      setTypedLen(i);
      if (i >= latestText.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
    // Re-run on id+text change. Avoids dev StrictMode double-mount issues by
    // simply restarting the typing cleanly instead of guarding with a ref.
  }, [latestId, latestText]);

  // ── Expand/collapse for older pulses ─────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const HISTORY_PREVIEW = 5;
  const history = pulses.slice(1);
  const historyVisible = showAll ? history : history.slice(0, HISTORY_PREVIEW);

  // ── Countdown ─────────────────────────────────────────────────────────────
  const _ = tick; // ensure re-render
  void _;
  const msToNext = Math.max(0, nextRefreshAt - Date.now());
  const secsToNext = Math.ceil(msToNext / 1000);
  const countdownLabel =
    secsToNext > 60
      ? `próxima en ${Math.ceil(secsToNext / 60)} min`
      : secsToNext > 5
        ? `próxima en ${secsToNext}s`
        : "buscando…";

  const typing = latest ? typedLen < latestText.length : false;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!latest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#FCD116]/30 bg-gradient-to-br from-[#001a4d] via-[#003893] to-[#001a4d] px-5 sm:px-7 py-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-[#FCD116]" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.18em]">CONDOR AI</span>
          <span className="text-[10px] text-white/60 font-mono">/{country.code}</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          CONDOR AI está preparando el pulso en vivo. Primer reporte cuando inicie la jornada electoral.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      // 🇨🇴 Azul bandera (#003893) profundo + acentos amarillo (#FCD116) y rojo (#CE1126)
      className="relative overflow-hidden rounded-2xl border border-[#FCD116]/30 bg-gradient-to-br from-[#001a4d] via-[#003893] to-[#001a4d]"
    >
      {/* animated AI glow — amarillo + rojo bandera */}
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black text-white uppercase tracking-[0.18em]">
                  CONDOR AI · Pulso en vivo
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
              <p className="text-[10px] text-white/60 font-mono">
                Actualización cada 5 min · {countdownLabel}
              </p>
            </div>
          </div>
          <Link
            href={`/${country.code}/metodologia`}
            className="inline-flex items-center gap-1 text-[10px] text-white/70 hover:text-[#FCD116] font-mono"
          >
            ¿Cómo funciona? <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Explainer — "esto qué es" en 1 línea para que cualquiera entienda */}
        <div className="rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-[11px] text-white/85 leading-relaxed">
          Cada 5 minutos CONDOR AI lee El Tiempo, Semana, Infobae, La Silla Vacía, Caracol y Google News, y resume lo que está pasando en este momento.
        </div>

        {/* AHORA — latest pulse with typing */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FCD116] font-mono flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-[#FCD116]" /> Ahora · {formatTime(latest.generated_at, locale, tz)}
            </p>
            <span className="text-[10px] text-white/50 font-mono">{relativeTime(latest.generated_at)}</span>
          </div>
          <motion.div
            key={latest.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-lg sm:text-xl text-white leading-snug font-medium min-h-[3.5em]"
          >
            {latestText.slice(0, typedLen)}
            {typing && (
              <span className="inline-block w-[3px] h-[1.1em] ml-0.5 bg-[#FCD116] align-text-bottom animate-pulse" />
            )}
          </motion.div>
        </div>

        {/* HISTORIAL */}
        {history.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#FCD116]/15">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-mono flex items-center gap-2">
              <Activity className="h-3 w-3" /> Pulsos anteriores
            </p>
            <ul className="space-y-1">
              <AnimatePresence initial={false}>
                {historyVisible.map((p) => {
                  const isExpanded = expandedId === p.id;
                  return (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-white/[0.06] transition-colors group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FCD116]/70 mt-2 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-white/50">
                              <span>{formatTime(p.generated_at, locale, tz)}</span>
                              <span>·</span>
                              <span>{relativeTime(p.generated_at)}</span>
                            </div>
                            <p className={`text-xs text-white/85 leading-relaxed mt-0.5 ${isExpanded ? "" : "line-clamp-2"}`}>
                              {p.summary}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 text-white/40 mt-1.5 shrink-0 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            {history.length > HISTORY_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-[10px] font-mono text-[#FCD116]/80 hover:text-[#FCD116] ml-2.5"
              >
                {showAll
                  ? "Mostrar menos"
                  : `Ver historial completo (${history.length - HISTORY_PREVIEW} más)`}
              </button>
            )}
          </div>
        )}

        {/* Footer — technical credit */}
        <div className="flex items-center justify-between pt-2 border-t border-[#FCD116]/15 text-[9px] text-white/40 font-mono">
          <span>Modelo: GPT-4o · validación verificable contra titulares</span>
        </div>
      </div>
    </motion.div>
  );
}
