"use client";

import { motion } from "framer-motion";
import type { CountryCode } from "@/lib/config/countries";
import { setCountryCookie } from "@/lib/utils";

interface CountryData {
  code: CountryCode;
  name: string;
  electionDate: string;
  electionType: string;
  primary: string;
  primaryLight: string;
}

function FlagSvg({ code, size = 100 }: { code: string; size?: number }) {
  const h = Math.round((size * 2) / 3);
  if (code === "co") {
    return (
      <svg width={size} height={h} viewBox="0 0 6 4">
        <rect fill="#FCD116" width="6" height="2" />
        <rect fill="#003893" y="2" width="6" height="1" />
        <rect fill="#CE1126" y="3" width="6" height="1" />
      </svg>
    );
  }
  return (
    <svg width={size} height={h} viewBox="0 0 3 2">
      <rect fill="#D91023" width="1" height="2" />
      <rect fill="#FFFFFF" x="1" width="1" height="2" />
      <rect fill="#D91023" x="2" width="1" height="2" />
    </svg>
  );
}

function getDaysLeft(dateStr: string): number {
  const target = new Date(dateStr + "T08:00:00");
  const now = new Date();
  return Math.max(
    0,
    Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function CountrySelector({
  countries,
}: {
  countries: CountryData[];
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#08060a] overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,26,26,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,26,26,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

      {/* C watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[28rem] font-black text-white/[0.02] select-none pointer-events-none leading-none">
        C
      </div>

      {/* Top classification bar */}
      <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center bg-white/[0.02] border-b border-white/[0.06] text-[11px] tracking-[0.2em] text-slate-500/60 font-mono">
        CONDOR &nbsp;&nbsp;// &nbsp;&nbsp;INTELIGENCIA ELECTORAL &nbsp;&nbsp;// &nbsp;&nbsp;LATAM 2026 &nbsp;&nbsp;// &nbsp;&nbsp;AI-POWERED
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-24 w-full max-w-3xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B1A1A] to-[#C42B2B]">
            <span className="font-mono text-xl font-bold text-white">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wider text-white">
              CONDOR
            </span>
            <span className="text-[10px] tracking-[0.3em] text-slate-500 font-mono">
              ELECTORAL AI
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-center text-white mb-3"
        >
          Elige tu país
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-400 text-center mb-14 max-w-md"
        >
          Selecciona tu país para acceder a la plataforma de inteligencia
          electoral con IA
        </motion.p>

        {/* Country cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {countries.map((country, i) => (
            <motion.a
              key={country.code}
              href={`/${country.code}/`}
              onClick={() => setCountryCookie(country.code)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative flex flex-col items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 transition-all duration-300 hover:bg-white/[0.04] cursor-pointer"
              style={{
                // @ts-expect-error -- CSS custom property for hover glow
                "--card-glow": country.primary,
              }}
            >
              {/* Hover glow border */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${country.primary}60, 0 0 40px ${country.primary}15`,
                  borderRadius: "1rem",
                }}
              />

              {/* Flag */}
              <div
                className="rounded-lg overflow-hidden border-2 border-white/10 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                style={{
                  boxShadow: `0 4px 20px ${country.primary}20`,
                }}
              >
                <FlagSvg code={country.code} size={120} />
              </div>

              {/* Country name */}
              <h2 className="text-2xl font-bold text-white">
                {country.name}
              </h2>

              {/* Election info */}
              <div className="text-center space-y-1.5">
                <p className="text-xs text-slate-500 tracking-wide">
                  {country.electionType}
                </p>
                <p
                  className="font-mono text-2xl font-bold tabular-nums"
                  style={{ color: country.primary }}
                >
                  {getDaysLeft(country.electionDate)} dias
                </p>
                <p className="text-[10px] font-mono text-slate-600 tracking-widest">
                  PARA LAS ELECCIONES
                </p>
              </div>

              {/* Enter button */}
              <div
                className="mt-1 rounded-full px-8 py-2.5 text-sm font-semibold text-white transition-all group-hover:scale-105 group-hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${country.primary}, ${country.primaryLight})`,
                  boxShadow: `0 2px 12px ${country.primary}30`,
                }}
              >
                Ingresar
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-emerald-500">
              CONDOR AI ONLINE
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-600 tracking-widest">
            condorlatam.com
          </p>
        </motion.div>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B1A1A] to-transparent" />
    </div>
  );
}
