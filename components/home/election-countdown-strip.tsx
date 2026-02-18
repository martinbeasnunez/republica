"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
}

export function ElectionCountdownStrip() {
  const electionDate = new Date("2026-04-12T08:00:00-05:00");
  const now = new Date();
  const daysToElection = Math.max(
    0,
    Math.floor((electionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const stats: StatItem[] = [
    { label: "Dias para la eleccion", value: daysToElection, highlight: true },
    { label: "Candidatos", value: 36 },
    { label: "Padron electoral", value: "25.3M" },
    { label: "Fake news detectadas", value: 287, color: "text-rose" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="rounded-xl border border-border bg-card"
    >
      {/* Desktop: horizontal strip */}
      <div className="hidden sm:flex items-center justify-between divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1 flex items-center justify-center gap-3 px-4 py-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              {stat.label}
            </span>
            <span
              className={cn(
                "font-mono text-lg font-bold tabular-nums",
                stat.highlight ? "text-gradient" : stat.color || "text-foreground"
              )}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 gap-px bg-border sm:hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card px-3 py-3 text-center">
            <span className="block text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </span>
            <span
              className={cn(
                "block font-mono text-xl font-bold tabular-nums mt-0.5",
                stat.highlight ? "text-gradient" : stat.color || "text-foreground"
              )}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
