"use client";

import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import type { PublicBriefing } from "../page";
import type { FactCheck } from "@/lib/data/fact-checks";
import Link from "next/link";

interface LiveBriefingProps {
  briefing: PublicBriefing | null;
  factChecks: FactCheck[];
  articleCount: number;
  sourceCount: number;
}

export function LiveBriefing({ briefing, factChecks, articleCount, sourceCount }: LiveBriefingProps) {
  const country = useCountry();

  if (!briefing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card px-5 py-6 text-center"
      >
        <Brain className="h-6 w-6 text-primary mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">CONDOR AI está procesando la información del día...</p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-[10px] font-mono text-emerald-600 font-medium">PROCESANDO</span>
        </div>
      </motion.div>
    );
  }

  const fullText = (briefing.editorial_summary || "").trim();
  const sentences = fullText.split(/(?<=\.)\s+/).filter(Boolean);

  const latestFalseClaim = factChecks.find(
    (fc) => fc.verdict === "FALSO" || fc.verdict === "ENGANOSO"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">CONDOR AI — Resumen del día</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            {articleCount} noticias · {sourceCount} fuentes
          </span>
          {briefing._isToday && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
              <span className="text-[9px] font-mono font-medium text-emerald-700">HOY</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Editorial */}
        {sentences.length > 0 && (
          <>
            <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {sentences[0]}
            </p>
            {sentences.length > 1 && (
              <div className="border-l-2 border-primary/20 pl-4">
                {sentences.slice(1, 3).map((s, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-1.5">{s}</p>
                ))}
              </div>
            )}
          </>
        )}

        {/* Poll movements */}
        {briefing.poll_movements && briefing.poll_movements.length > 0 && (
          <Link href={`/${country.code}/encuestas`} className="block group">
            <div className="flex flex-wrap gap-2">
              {briefing.poll_movements
                .filter((m) => m.direction !== "stable")
                .slice(0, 4)
                .map((m, i) => {
                  const delta = Math.abs(m.current - m.previous).toFixed(1);
                  const isUp = m.direction === "up";
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all group-hover:shadow-sm",
                        isUp
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-rose-50 border-rose-200 text-rose-700"
                      )}
                    >
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="font-semibold">{m.candidate}</span>
                      <span className="font-mono tabular-nums">{isUp ? "+" : "-"}{delta}pp</span>
                    </div>
                  );
                })}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                Ver encuestas <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        )}

        {/* Fact-check spotlight */}
        {latestFalseClaim && (
          <Link
            href={`/${country.code}/verificador`}
            className="group flex items-start gap-3 rounded-lg bg-red-50/80 border border-red-200/60 px-4 py-3 hover:bg-red-50 transition-colors"
          >
            <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center h-5 w-12 rounded-full bg-red-600 text-[10px] font-bold text-white tracking-wide">
              FALSO
            </span>
            <span className="text-sm text-stone-700 leading-snug line-clamp-2 group-hover:text-stone-900">
              &ldquo;{latestFalseClaim.claim.length > 120 ? latestFalseClaim.claim.slice(0, 120) + "..." : latestFalseClaim.claim}&rdquo;
              {latestFalseClaim.claimant && latestFalseClaim.claimant !== "Desconocido" && (
                <span className="text-stone-400"> — {latestFalseClaim.claimant}</span>
              )}
            </span>
            <span className="flex-shrink-0 text-xs text-red-600 font-semibold mt-0.5 group-hover:underline whitespace-nowrap">
              Ver más →
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
