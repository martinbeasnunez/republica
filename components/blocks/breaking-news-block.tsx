"use client";

import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HomepageBlock, BreakingNewsContent } from "@/lib/types/homepage-blocks";

interface Props {
  block: HomepageBlock;
  onClick: () => void;
}

export function BreakingNewsBlock({ block, onClick }: Props) {
  const c = block.content as unknown as BreakingNewsContent;
  const isHighImpact = c.impact_score >= 8;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl glass overflow-hidden transition-all hover:shadow-md active:scale-[0.98] cursor-pointer",
        isHighImpact && "glow-rose"
      )}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
          <Newspaper className="h-5 w-5 text-rose" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {isHighImpact ? "Alerta de impacto" : "Noticia relevante"}
          </span>

          {/* Impact score — always visible, color-graded */}
          <div className="ml-auto flex items-center gap-0.5">
            <span
              className={cn(
                "text-lg font-mono font-black tabular-nums leading-none",
                isHighImpact
                  ? "terminal-text-rose"
                  : c.impact_score >= 5
                    ? "terminal-text-amber"
                    : "text-muted-foreground"
              )}
            >
              {c.impact_score}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/60">
              /10
            </span>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm sm:text-base font-bold text-foreground mb-1.5 line-clamp-2">
          {block.title}
        </p>

        {/* Summary */}
        {c.article_summary && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
            {c.article_summary}
          </p>
        )}

        {/* Footer: source + category badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-primary font-medium">
            {c.source}
          </span>
          {c.category && (
            <Badge
              variant="secondary"
              className="text-[8px] font-mono h-4 px-1.5 ml-auto"
            >
              {c.category.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
