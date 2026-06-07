"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import type { FactCheck } from "@/lib/data/fact-checks";
import Link from "next/link";

const verdictConfig: Record<string, { label: string; badgeClasses: string; iconColor: string }> = {
  FALSO: { label: "FALSO", badgeClasses: "bg-rose/15 text-rose border-rose/30", iconColor: "text-rose" },
  ENGANOSO: { label: "ENGAÑOSO", badgeClasses: "bg-amber/15 text-amber border-amber/30", iconColor: "text-amber" },
  PARCIALMENTE_VERDADERO: { label: "PARCIAL", badgeClasses: "bg-amber/15 text-amber border-amber/30", iconColor: "text-amber" },
  VERDADERO: { label: "VERDADERO", badgeClasses: "bg-emerald/15 text-emerald border-emerald/30", iconColor: "text-emerald" },
  NO_VERIFICABLE: { label: "NO VERIFICABLE", badgeClasses: "bg-muted text-muted-foreground border-border", iconColor: "text-muted-foreground" },
};

interface FactCheckSpotlightProps {
  factChecks: FactCheck[];
}

export function FactCheckSpotlight({ factChecks }: FactCheckSpotlightProps) {
  const country = useCountry();

  // Prioritize FALSO/ENGANOSO, then show others
  const sorted = [...factChecks].sort((a, b) => {
    const priority: Record<string, number> = { FALSO: 0, ENGANOSO: 1, PARCIALMENTE_VERDADERO: 2, VERDADERO: 3, NO_VERIFICABLE: 4 };
    return (priority[a.verdict] ?? 5) - (priority[b.verdict] ?? 5);
  });
  const display = sorted.slice(0, 5);

  if (display.length === 0) return null;

  const falseCount = factChecks.filter((fc) => fc.verdict === "FALSO" || fc.verdict === "ENGANOSO").length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose" />
          <h2 className="text-sm font-bold text-foreground">Verificador de Hechos</h2>
          {falseCount > 0 && (
            <span className="rounded-full bg-rose/10 text-rose text-[10px] font-bold px-2 py-0.5">
              {falseCount} alertas
            </span>
          )}
        </div>
        <Link
          href={`/${country.code}/verificador`}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Verificar más <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {display.map((fc, index) => {
          const config = verdictConfig[fc.verdict] || verdictConfig.NO_VERIFICABLE;
          return (
            <motion.div
              key={fc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-5 py-3 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  "flex-shrink-0 mt-0.5 inline-block text-[10px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded border",
                  config.badgeClasses
                )}>
                  {config.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 leading-snug">
                    &ldquo;{fc.claim}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {fc.claimant && fc.claimant !== "Desconocido" && fc.claimant !== "No especificado" && (
                      <span className="text-[10px] text-muted-foreground font-mono">— {fc.claimant}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">
                      Confianza: {Math.round(fc.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
