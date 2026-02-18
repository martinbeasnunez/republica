"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { getTopCandidates } from "@/lib/data/candidates";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CandidateRanking() {
  const topCandidates = getTopCandidates(8);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Ranking de Candidatos
          </h3>
          <p className="text-xs text-muted-foreground">
            Promedio de encuestas
          </p>
        </div>
        <Link
          href="/encuestas"
          className="text-xs font-medium text-primary hover:text-indigo-glow transition-colors"
        >
          Ver todas →
        </Link>
      </div>

      <div className="p-2">
        {topCandidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={`/candidatos/${candidate.slug}`}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
            >
              {/* Position */}
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>

              {/* Party color dot */}
              <div
                className="h-3 w-3 rounded-full ring-2 ring-background"
                style={{ backgroundColor: candidate.partyColor }}
              />

              {/* Name and party */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {candidate.shortName}
                  </p>
                  {candidate.hasLegalIssues && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="h-3 w-3 text-amber" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{candidate.legalNote}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {candidate.party}
                </p>
              </div>

              {/* Poll average */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                  {candidate.pollAverage.toFixed(1)}%
                </span>
                {candidate.pollTrend === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald" />
                )}
                {candidate.pollTrend === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-rose" />
                )}
                {candidate.pollTrend === "stable" && (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Poll bar */}
              <div className="hidden w-20 sm:block">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: candidate.partyColor }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(candidate.pollAverage / 15) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
