"use client";

import { TrendingUp } from "lucide-react";
import type { HomepageBlock, TrendingCandidateContent } from "@/lib/types/homepage-blocks";

interface Props {
  block: HomepageBlock;
  onClick: () => void;
}

export function TrendingCandidateBlock({ block, onClick }: Props) {
  const c = block.content as unknown as TrendingCandidateContent;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl glass overflow-hidden transition-all hover:shadow-md active:scale-[0.98] cursor-pointer relative"
    >
      {/* Subtle hex pattern background */}
      <div className="absolute inset-0 hex-pattern opacity-[0.03]" />

      <div className="relative z-10">
        {/* Top gradient band in party color */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${c.party_color || "#6366f1"}, transparent)`,
          }}
        />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              En tendencia
            </span>
            <span className="h-2 w-2 rounded-full bg-primary pulse-dot ml-auto" />
          </div>

          {/* Candidate name row with party dot */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: c.party_color || "#6366f1",
                boxShadow: `0 0 0 2px ${(c.party_color || "#6366f1")}40`,
              }}
            />
            <p className="text-sm font-bold text-foreground line-clamp-1">
              {c.candidate_name}
            </p>
          </div>

          {/* Stats row: mention_count + poll_average */}
          <div className="flex items-end gap-4 mt-3">
            {/* Mention count as hero number */}
            {c.mention_count > 0 && (
              <div>
                <span className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">
                  Menciones
                </span>
                <span className="text-2xl font-mono font-black tabular-nums leading-none text-foreground">
                  {c.mention_count}
                </span>
              </div>
            )}

            {/* Poll average */}
            {c.poll_average > 0 && (
              <div>
                <span className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">
                  Encuestas
                </span>
                <span className="text-lg font-mono font-bold tabular-nums leading-none terminal-text">
                  {c.poll_average.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          {c.reason && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-3 pt-2 border-t border-border/50">
              {c.reason}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
