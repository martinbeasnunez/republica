"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import type { Candidate } from "@/lib/data/candidates";
import { CandidateSocialBar } from "./candidate-social-bar";
import Link from "next/link";

interface PollStandingsSidebarProps {
  candidates: Candidate[];
}

const trendIcons = {
  up: <TrendingUp className="h-3 w-3 text-emerald" />,
  down: <TrendingDown className="h-3 w-3 text-rose" />,
  stable: <Minus className="h-3 w-3 text-muted-foreground" />,
};

export function PollStandingsSidebar({ candidates }: PollStandingsSidebarProps) {
  const country = useCountry();
  const sorted = [...candidates]
    .sort((a, b) => (b.pollAverage ?? 0) - (a.pollAverage ?? 0))
    .slice(0, 8);
  const maxPoll = Math.max(...sorted.map((c) => c.pollAverage ?? 0), 1);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Encuestas</h2>
        </div>
        <Link
          href={`/${country.code}/encuestas`}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Detalle <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {sorted.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04 }}
          >
            <Link
              href={`/${country.code}/candidatos/${candidate.slug}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50 transition-colors group"
            >
              {/* Position */}
              <span className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                index === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>

              {/* Photo */}
              {candidate.photo ? (
                <img
                  src={candidate.photo}
                  alt={candidate.shortName}
                  className="flex-shrink-0 h-9 w-9 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div
                  className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: candidate.partyColor }}
                >
                  {candidate.shortName.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.partyColor }} />
                  <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {candidate.shortName}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{candidate.party}</span>
              </div>

              {/* Poll + trend */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {trendIcons[candidate.pollTrend || "stable"]}
                <span className="font-mono text-sm font-bold tabular-nums">
                  {candidate.pollAverage?.toFixed(1)}%
                </span>
              </div>
            </Link>

            {/* Social media + mini bar */}
            <div className="px-5 pb-2 -mt-1 flex items-center gap-3">
              <div className="flex-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: candidate.partyColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((candidate.pollAverage ?? 0) / maxPoll) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                  />
                </div>
              </div>
              <CandidateSocialBar
                twitter={candidate.socialMedia?.twitter}
                facebook={candidate.socialMedia?.facebook}
                instagram={candidate.socialMedia?.instagram}
                tiktok={candidate.socialMedia?.tiktok}
                website={candidate.socialMedia?.website}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
