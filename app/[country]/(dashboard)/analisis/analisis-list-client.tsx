"use client";

import { motion } from "framer-motion";
import { Brain, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useCountry } from "@/lib/config/country-context";

interface BriefingSummary {
  briefing_date: string;
  editorial_summary: string;
}

interface AnalisisListClientProps {
  briefings: BriefingSummary[];
}

export default function AnalisisListClient({ briefings }: AnalisisListClientProps) {
  const country = useCountry();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            CONDOR AI
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Análisis electoral diario
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Cada día, CONDOR AI analiza encuestas, noticias y movimientos políticos en {country.name}.
          Aquí puedes leer todos los análisis generados.
        </p>
      </div>

      {/* Briefing list */}
      {briefings.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aún no hay análisis disponibles. CONDOR AI está procesando datos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {briefings.map((b, index) => {
            const firstSentence = b.editorial_summary.split(". ")[0] + ".";
            const dateFormatted = new Date(b.briefing_date + "T12:00:00").toLocaleDateString(
              "es-PE",
              { weekday: "long", day: "numeric", month: "long" }
            );

            return (
              <motion.div
                key={b.briefing_date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/${country.code}/analisis/${b.briefing_date}`}
                  className="group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground capitalize">
                      {dateFormatted}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {firstSentence}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                    Leer análisis completo
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
