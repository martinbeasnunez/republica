"use client";

import { Brain } from "lucide-react";
import type { HomepageBlock, EditorialHighlightContent } from "@/lib/types/homepage-blocks";

interface Props {
  block: HomepageBlock;
  onClick: () => void;
}

export function EditorialHighlightBlock({ block, onClick }: Props) {
  const c = block.content as unknown as EditorialHighlightContent;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl glass overflow-hidden transition-all hover:shadow-md active:scale-[0.98] cursor-pointer glow-indigo"
    >
      {/* Classification header strip */}
      <div className="classification-header">
        CONDOR // ANÁLISIS EDITORIAL // AI-GENERATED
      </div>

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
            Análisis CONDOR
          </span>
        </div>

        {/* Title */}
        <p className="text-sm sm:text-base font-bold text-foreground mb-2 line-clamp-2">
          {block.title}
        </p>

        {/* Body summary */}
        {c.body && (
          <p className="text-[11px] text-muted-foreground line-clamp-3 mb-3">
            {c.body}
          </p>
        )}

        {/* Key takeaway — highlighted extraction */}
        {c.key_takeaway && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
            <span className="text-[9px] font-mono uppercase tracking-wider text-primary/70 block mb-0.5">
              Conclusión clave
            </span>
            <p className="text-xs text-foreground font-medium line-clamp-2">
              {c.key_takeaway}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}
