"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Hourglass, Sparkles } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";

interface RunoffCierreHeroProps {
  finalists: [Candidate, Candidate];
  /**
   * If the upstream ONPE proxy already returned runoff-shaped data (<=2 candidates),
   * skip rendering this hero — the live counter will take over.
   */
  hidden?: boolean;
}

type Phase =
  | "pre-open"     // before 8:00 a.m. — mesas opening
  | "voting"       // 8:00 a.m. — 5:00 p.m. — voting in progress
  | "cierre"       // 5:00 p.m. — 5:30 p.m. — mesas closing
  | "boletines"    // 5:30 p.m. onwards — first ONPE bulletins
  | "next-day";    // past midnight Lima but still no counter

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Compute current state in Lima time and time-to-cierre (5:00 p.m. Lima).
 */
function useLimaCierre() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Get current time in Lima (UTC-5)
  const now = new Date();
  // Lima offset is -5; convert by reading the iso minutes via toLocaleString.
  const limaParts = now.toLocaleString("en-US", {
    timeZone: "America/Lima",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const [hStr, mStr, sStr] = limaParts.split(":");
  const limaH = parseInt(hStr, 10);
  const limaM = parseInt(mStr, 10);
  const limaS = parseInt(sStr, 10);
  const limaTotalSec = limaH * 3600 + limaM * 60 + limaS;

  // Anchor seconds for milestones (Lima local seconds-since-midnight)
  const OPEN_SEC = 8 * 3600;       // 08:00
  const CIERRE_SEC = 17 * 3600;     // 17:00
  const BOLETIN_SEC = 17 * 3600 + 30 * 60; // 17:30

  let phase: Phase;
  let secsRemaining = 0;
  if (limaTotalSec < OPEN_SEC) {
    phase = "pre-open";
    secsRemaining = OPEN_SEC - limaTotalSec;
  } else if (limaTotalSec < CIERRE_SEC) {
    phase = "voting";
    secsRemaining = CIERRE_SEC - limaTotalSec;
  } else if (limaTotalSec < BOLETIN_SEC) {
    phase = "cierre";
    secsRemaining = BOLETIN_SEC - limaTotalSec;
  } else if (limaTotalSec < 24 * 3600) {
    phase = "boletines";
    secsRemaining = 0;
  } else {
    phase = "next-day";
    secsRemaining = 0;
  }

  const hh = Math.floor(secsRemaining / 3600);
  const mm = Math.floor((secsRemaining % 3600) / 60);
  const ss = secsRemaining % 60;

  return { phase, secsRemaining, hh, mm, ss, limaH, limaM, limaTotalSec, _t: tick };
}

const PHASE_COPY: Record<
  Phase,
  { eyebrow: string; title: string; subtitle: string; cta: string }
> = {
  "pre-open": {
    eyebrow: "Día E — Balotaje",
    title: "Mesas abren a las 8:00 a.m.",
    subtitle:
      "Faltan minutos para el inicio oficial de la jornada. CONDOR AI ya está monitoreando las primeras señales desde todo el país.",
    cta: "El conteo oficial comienza tras el cierre de mesas a las 5:00 p.m.",
  },
  voting: {
    eyebrow: "Mesas abiertas",
    title: "Faltan para el cierre",
    subtitle:
      "Las mesas cierran a las 5:00 p.m. hora Lima. Mientras tanto seguimos la jornada en tiempo real: votación de los candidatos, MOE, incidentes, regiones, voto del exterior.",
    cta: "ONPE publica los primeros boletines tras el cierre. CONDOR AI verifica titulares cada pocos minutos.",
  },
  cierre: {
    eyebrow: "Cierre en curso",
    title: "Esperando primeros boletines de ONPE",
    subtitle:
      "Las mesas cerraron. ONPE inicia la transmisión de actas. Los primeros boletines suelen aparecer entre las 5:30 y 6:00 p.m.",
    cta: "El contador oficial aparecerá aquí en cuanto ONPE publique datos del balotaje.",
  },
  boletines: {
    eyebrow: "Boletines en camino",
    title: "ONPE inició la transmisión",
    subtitle:
      "Primeros porcentajes están saliendo desde mesas de mayor velocidad de cómputo. CONDOR AI cruza los boletines con prensa y veedores en cada departamento.",
    cta: "El contador oficial aparecerá aquí apenas el flujo del balotaje sea estable.",
  },
  "next-day": {
    eyebrow: "Día E",
    title: "Esperando datos del balotaje",
    subtitle:
      "ONPE continúa procesando actas a lo largo del día siguiente. El conteo oficial será publicado apenas esté disponible.",
    cta: "CONDOR AI seguirá cubriendo cualquier novedad en tiempo real.",
  },
};

export function RunoffCierreHero({ finalists, hidden }: RunoffCierreHeroProps) {
  const { phase, hh, mm, ss, secsRemaining } = useLimaCierre();

  if (hidden) return null;

  const copy = PHASE_COPY[phase];
  const showCountdown = phase === "pre-open" || phase === "voting" || phase === "cierre";
  const [a, b] = finalists;

  // Progress through the voting day (0 → 100 as the day approaches 5pm)
  let progressPct = 0;
  if (phase === "voting") {
    const total = 9 * 3600; // 8am → 5pm = 9 hours
    progressPct = 100 - (secsRemaining / total) * 100;
  } else if (phase === "cierre" || phase === "boletines" || phase === "next-day") {
    progressPct = 100;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border-2 border-stone-800 bg-gradient-to-br from-stone-950 via-stone-900 to-red-950"
    >
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 70%, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative px-5 sm:px-8 py-6 sm:py-8">
        {/* Top row */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white pulse-dot" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {copy.eyebrow}
              </span>
            </span>
            <span className="hidden sm:inline text-[11px] font-semibold text-red-200/60">
              Domingo 7 de junio 2026 · Hora Lima
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-red-100/70">
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px] font-mono">CONDOR AI · live</span>
          </div>
        </div>

        {/* Title + subtitle */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-[0.95] mb-2">
          {copy.title}
        </h2>
        <p className="text-sm sm:text-base text-red-100/70 max-w-2xl leading-relaxed mb-5">
          {copy.subtitle}
        </p>

        {/* Countdown digits or status */}
        {showCountdown && secsRemaining > 0 ? (
          <div className="flex items-end gap-3 sm:gap-5 font-mono tabular-nums mb-5">
            {[
              { label: "horas", value: hh },
              { label: "min", value: mm },
              { label: "seg", value: ss },
            ].map((u, i) => (
              <div key={u.label} className="flex items-end gap-2 sm:gap-3">
                <div className="flex flex-col items-center">
                  <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-3 sm:px-5 py-2 sm:py-3">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none">
                      {pad(u.value)}
                    </div>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-red-200/50 mt-2">
                    {u.label}
                  </div>
                </div>
                {i < 2 && (
                  <span className="text-3xl sm:text-4xl font-black text-red-300/30 pb-7">:</span>
                )}
              </div>
            ))}
          </div>
        ) : phase === "cierre" || phase === "boletines" ? (
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 mb-5 max-w-md">
            <Hourglass className="h-5 w-5 text-amber-300 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-200">
                En espera
              </p>
              <p className="text-xs text-amber-100/70">
                Recibiendo flujo de ONPE — recargamos cada 3 minutos.
              </p>
            </div>
          </div>
        ) : null}

        {/* Day progress bar (only during voting hours) */}
        {phase === "voting" && (
          <div className="mb-5 max-w-2xl">
            <div className="flex items-center justify-between text-[10px] text-red-200/40 mb-1.5 font-mono">
              <span>08:00 a.m. — apertura</span>
              <span>{Math.round(progressPct)}% del día E</span>
              <span>05:00 p.m. — cierre</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Finalists mini-strip inside the dark hero (reminds the viewer who's competing) */}
        <div className="grid grid-cols-2 gap-3 max-w-2xl mb-4">
          {[a, b].map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/10 px-3 py-2"
            >
              <div
                className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg"
                style={{ outline: `2px solid ${c.partyColor}`, outlineOffset: "1px" }}
              >
                {c.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-white/10" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
                  style={{ color: c.partyColor }}
                >
                  {c.party}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {c.shortName || c.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA / footer */}
        <div className="flex items-center gap-2 text-[11px] text-red-100/60 border-t border-white/5 pt-3">
          <Clock className="h-3 w-3" />
          <span>{copy.cta}</span>
        </div>
      </div>
    </motion.section>
  );
}
