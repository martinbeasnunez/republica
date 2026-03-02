"use client";

import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HomepageBlock, PollShiftContent } from "@/lib/types/homepage-blocks";

interface Props {
  block: HomepageBlock;
  onClick: () => void;
}

export function PollShiftBlock({ block, onClick }: Props) {
  const c = block.content as unknown as PollShiftContent;
  const isUp = c.direction === "up";

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl glass p-0 overflow-hidden transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
    >
      <div className="flex">
        {/* Party color left accent bar */}
        <div
          className="w-1.5 flex-shrink-0 rounded-l-xl"
          style={{ backgroundColor: c.party_color || "#6366f1" }}
        />

        <div className="flex-1 p-4">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            {isUp ? (
              <TrendingUp className="h-[18px] w-[18px] text-emerald" />
            ) : (
              <TrendingDown className="h-[18px] w-[18px] text-rose" />
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Movimiento en encuestas
            </span>
          </div>

          {/* Candidate name */}
          <p className="text-sm font-bold text-foreground mb-1 line-clamp-1">
            {c.candidate_name}
          </p>

          {/* Big delta number + values row */}
          <div className="flex items-end gap-3 mt-2">
            {/* HERO NUMBER: the delta */}
            <span
              className={cn(
                "text-2xl sm:text-3xl font-mono font-black tabular-nums leading-none",
                isUp ? "terminal-text" : "terminal-text-rose"
              )}
            >
              {isUp ? "+" : ""}
              {c.delta?.toFixed(1)}
            </span>

            {/* Previous -> Current */}
            <div className="flex items-center gap-1.5 pb-0.5">
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {c.previous_value?.toFixed(1)}%
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
              <span
                className={cn(
                  "text-xs font-mono tabular-nums font-bold",
                  isUp ? "text-emerald" : "text-rose"
                )}
              >
                {c.current_value?.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Mini progress bar showing current value */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: c.party_color || "#6366f1" }}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((c.current_value || 0) * 2, 100)}%`,
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
