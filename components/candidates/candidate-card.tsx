"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/lib/data/candidates";
import { IDEOLOGY_LABELS } from "@/lib/data/candidates";
import Link from "next/link";
import { useCountry } from "@/lib/config/country-context";

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  rank?: number;
}

export function CandidateCard({ candidate, index, rank }: CandidateCardProps) {
  const country = useCountry();
  const trendIcon = {
    up: <TrendingUp className="h-3 w-3 text-emerald" />,
    down: <TrendingDown className="h-3 w-3 text-rose" />,
    stable: <Minus className="h-3 w-3 text-muted-foreground" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/${country.code}/candidatos/${candidate.slug}`}>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          {/* Top color band */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: candidate.partyColor }}
          />

          <div className="p-5">
            {/* Rank badge */}
            {rank && (
              <div className="absolute top-3 right-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-muted-foreground">
                  #{rank}
                </span>
              </div>
            )}

            {/* Avatar */}
            <div className="mb-4 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 overflow-hidden"
                style={{
                  backgroundColor: candidate.partyColor + "20",
                  borderColor: candidate.partyColor,
                }}
              >
                {candidate.photo && candidate.photo.startsWith("http") ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    className="h-7 w-7"
                    style={{ color: candidate.partyColor }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {candidate.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: candidate.partyColor }}
                  />
                  <p className="text-xs text-muted-foreground truncate">
                    {candidate.party}
                  </p>
                </div>
              </div>
            </div>

            {/* Ideology + Profession */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0.5"
              >
                {IDEOLOGY_LABELS[candidate.ideology].es}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {candidate.profession}
              </span>
            </div>

            {/* Key proposal */}
            {candidate.keyProposals[0] && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                {candidate.keyProposals[0].summary}
              </p>
            )}

            {/* Poll + Trend */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {candidate.pollAverage.toFixed(1)}%
                </span>
                {trendIcon[candidate.pollTrend]}
              </div>

              {candidate.hasLegalIssues && (
                <div className="flex items-center gap-1 text-amber">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-[10px] font-medium">
                    Antecedentes
                  </span>
                </div>
              )}

              {/* Mini poll bar */}
              <div className="w-16">
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: candidate.partyColor,
                      width: `${(candidate.pollAverage / 15) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
