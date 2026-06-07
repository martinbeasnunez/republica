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
      <div className="p-4 sm:p-5">
        {/* Header — human context */}
        <div className="flex items-center gap-2 mb-2">
          {isHighImpact && <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />}
          <Newspaper className="h-4 w-4 text-primary" />
          <span className={cn(
            "text-[11px] sm:text-xs font-semibold",
            isHighImpact ? "text-rose-700" : "text-foreground/70"
          )}>
            {isHighImpact ? "Lo que debes saber hoy" : "Noticia relevante"}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm sm:text-base font-bold text-foreground mb-1.5 line-clamp-2">
          {block.title}
        </p>

        {/* Summary */}
        {c.article_summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {c.article_summary}
          </p>
        )}

        {/* Footer: source + category badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-primary font-medium">
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
