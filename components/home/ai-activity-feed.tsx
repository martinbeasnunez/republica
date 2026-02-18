"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AIActivity {
  id: string;
  time: string;
  type: "verificacion" | "analisis" | "chat" | "plan";
  summary: string;
  result?: string;
  resultColor?: string;
}

const typeConfig = {
  verificacion: { label: "VERIFICACION", color: "text-emerald", bg: "bg-emerald/10 border-emerald/20" },
  analisis: { label: "ANALISIS", color: "text-sky", bg: "bg-sky/10 border-sky/20" },
  chat: { label: "CHAT", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  plan: { label: "PLAN", color: "text-amber", bg: "bg-amber/10 border-amber/20" },
};

const mockActivities: AIActivity[] = [
  {
    id: "1",
    time: "14:23",
    type: "verificacion",
    summary: '"Las elecciones se adelantan a marzo"',
    result: "FALSO (99%)",
    resultColor: "text-rose",
  },
  {
    id: "2",
    time: "14:21",
    type: "analisis",
    summary: "Noticia RPP sobre encuestas",
    result: "Sesgo: neutral",
    resultColor: "text-emerald",
  },
  {
    id: "3",
    time: "14:19",
    type: "chat",
    summary: "Usuario pregunto sobre planes de seguridad",
  },
  {
    id: "4",
    time: "14:18",
    type: "plan",
    summary: "Propuesta economica de Lopez Aliaga",
    result: "Viabilidad: media",
    resultColor: "text-amber",
  },
  {
    id: "5",
    time: "14:15",
    type: "verificacion",
    summary: '"El padron supera 25 millones"',
    result: "VERDADERO (98%)",
    resultColor: "text-emerald",
  },
  {
    id: "6",
    time: "14:12",
    type: "analisis",
    summary: "Articulo Gestion sobre crecimiento PBI",
    result: "Sesgo: leve",
    resultColor: "text-amber",
  },
];

export function AIActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative rounded-xl border border-border bg-card overflow-hidden scan-line"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald pulse-dot" />
          <h3 className="text-sm font-semibold text-foreground">
            Actividad de CONDOR AI
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          EN TIEMPO REAL
        </span>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-border/50">
        {mockActivities.map((activity, index) => {
          const config = typeConfig[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.06 }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-accent/30 transition-colors"
            >
              {/* Timestamp */}
              <span className="terminal-text text-[10px] sm:text-[11px] font-mono tabular-nums flex-shrink-0 w-8 sm:w-10">
                {activity.time}
              </span>

              {/* Type badge — hidden on mobile to save space */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[8px] font-mono h-4 px-1.5 flex-shrink-0 border hidden sm:inline-flex",
                  config.bg,
                  config.color
                )}
              >
                {config.label}
              </Badge>

              {/* Summary */}
              <span className="text-[11px] sm:text-xs text-muted-foreground truncate flex-1 min-w-0">
                {activity.summary}
              </span>

              {/* Result */}
              {activity.result && (
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-mono font-medium tabular-nums flex-shrink-0 text-right",
                  activity.resultColor || "text-muted-foreground"
                )}>
                  {activity.result}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
