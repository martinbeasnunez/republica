"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Sparkles } from "lucide-react";
import type { PublicBriefing } from "../page";

interface LiveAnalysisProps {
  briefing: PublicBriefing | null;
}

export function LiveAnalysis({ briefing }: LiveAnalysisProps) {
  if (!briefing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent px-5 py-6 text-center"
      >
        <Brain className="h-6 w-6 text-primary mx-auto mb-2 animate-pulse" />
        <p className="text-sm font-medium text-foreground">CONDOR AI está analizando la jornada electoral...</p>
        <p className="text-xs text-muted-foreground mt-1">El primer análisis en vivo estará disponible pronto.</p>
      </motion.div>
    );
  }

  const fullText = (briefing.editorial_summary || "").trim();
  const sentences = fullText.split(/(?<=\.)\s+/).filter(Boolean);

  // Briefing age
  const briefingDate = new Date(briefing.briefing_date + "T12:00:00");
  const ageHours = briefing._ageHours ?? Math.floor((Date.now() - briefingDate.getTime()) / (1000 * 60 * 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-primary/20 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Análisis CONDOR AI en vivo</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Clock className="h-3 w-3" />
          {ageHours <= 0 ? "Actualizado ahora" : `Hace ${ageHours}h`}
        </div>
      </div>

      {/* Analysis content */}
      <div className="px-5 py-5">
        {sentences.length > 0 && (
          <div className="space-y-4">
            {/* First sentence — THE LEAD */}
            <p className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
              {sentences[0]}
            </p>

            {/* Remaining sentences */}
            {sentences.length > 1 && (
              <div className="border-l-2 border-primary/20 pl-4 space-y-2">
                {sentences.slice(1).map((s, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key takeaways — if the briefing has them */}
        {briefing.top_stories && briefing.top_stories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Lo que CONDOR AI está monitoreando
            </p>
            <div className="space-y-1.5">
              {briefing.top_stories.slice(0, 3).map((story, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <p className="text-xs text-foreground leading-snug">{story.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-border/50 bg-muted/20">
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          Análisis generado automáticamente por CONDOR AI · Se actualiza cada hora durante la jornada electoral
        </p>
      </div>
    </motion.div>
  );
}
