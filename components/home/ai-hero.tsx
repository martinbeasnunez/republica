"use client";

import { motion } from "framer-motion";
import { Cpu, Activity, ShieldCheck, Sparkles } from "lucide-react";
import { useCountry } from "@/lib/config/country-context";

export function AIHero() {
  const country = useCountry();
  const year = country.electionDate.slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Background effects */}
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute inset-0 data-stream" />

      <div className="relative z-10">
        {/* Classification header */}
        <div className="classification-header px-4 py-2 text-center">
          CONDOR &nbsp;// &nbsp;SISTEMA DE INTELIGENCIA ELECTORAL &nbsp;// &nbsp;{country.name.toUpperCase()} {year} &nbsp;// &nbsp;AI-POWERED
        </div>

        {/* Main hero content */}
        <div className="px-4 sm:px-8 py-6 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                Inteligencia Artificial Electoral
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              <span className="text-gradient">
                La primera elección{" "}
                <img
                  src={`https://flagcdn.com/w40/${country.flag.toLowerCase()}.png`}
                  alt={`Bandera de ${country.name}`}
                  className="inline-block h-7 sm:h-8 lg:h-9 align-baseline -mb-0.5 rounded-sm"
                  width={40}
                  height={27}
                />
              </span>
              <br />
              <span className="text-foreground">
                con inteligencia artificial.
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              CONDOR analiza candidatos, verifica hechos y monitorea noticias en tiempo real con IA.
            </p>
          </motion.div>

          {/* AI Status strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald" />
              <span className="text-[11px] font-mono text-emerald font-medium">
                CONDOR AI ONLINE
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground tabular-nums">
              <ShieldCheck className="h-3 w-3 text-emerald" />
              <span>{country.mediaSources.length * 4} candidatos monitoreados</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground tabular-nums">
              <Cpu className="h-3 w-3 text-primary" />
              <span>{country.mediaSources.filter(s => s.rss).length} fuentes RSS activas</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground tabular-nums">
              <Activity className="h-3 w-3 text-sky" />
              <span>Actualización cada 4h</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
