"use client";

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomepageBlock, FactCheckAlertContent } from "@/lib/types/homepage-blocks";

interface Props {
  block: HomepageBlock;
  onClick: () => void;
}

const verdictConfig: Record<
  string,
  {
    label: string;
    badgeClasses: string;
    glowClass: string;
    iconColor: string;
    bgAccent: string;
  }
> = {
  FALSO: {
    label: "FALSO",
    badgeClasses: "bg-rose/15 text-rose border-rose/30",
    glowClass: "glow-rose",
    iconColor: "text-rose",
    bgAccent: "bg-rose/5",
  },
  ENGANOSO: {
    label: "ENGANOSO",
    badgeClasses: "bg-amber/15 text-amber border-amber/30",
    glowClass: "glow-amber",
    iconColor: "text-amber",
    bgAccent: "bg-amber/5",
  },
  PARCIALMENTE_VERDADERO: {
    label: "PARCIAL",
    badgeClasses: "bg-amber/15 text-amber border-amber/30",
    glowClass: "glow-amber",
    iconColor: "text-amber",
    bgAccent: "bg-amber/5",
  },
  VERDADERO: {
    label: "VERDADERO",
    badgeClasses: "bg-emerald/15 text-emerald border-emerald/30",
    glowClass: "glow-emerald",
    iconColor: "text-emerald",
    bgAccent: "bg-emerald/5",
  },
  NO_VERIFICABLE: {
    label: "NO VERIFICABLE",
    badgeClasses: "bg-muted text-muted-foreground border-border",
    glowClass: "",
    iconColor: "text-muted-foreground",
    bgAccent: "bg-muted/50",
  },
};

export function FactCheckAlertBlock({ block, onClick }: Props) {
  const c = block.content as unknown as FactCheckAlertContent;
  const config =
    verdictConfig[c.verdict] || verdictConfig.NO_VERIFICABLE;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl glass overflow-hidden transition-all hover:shadow-md active:scale-[0.98] cursor-pointer",
        config.glowClass
      )}
    >
      <div className="p-4">
        {/* Header with icon and type label */}
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className={cn("h-5 w-5", config.iconColor)} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Fact Check
          </span>
        </div>

        {/* HERO VERDICT STAMP */}
        <div className="mb-3">
          <span
            className={cn(
              "inline-block text-base sm:text-lg font-mono font-black tracking-widest uppercase px-3 py-1 rounded-md border",
              config.badgeClasses
            )}
          >
            {config.label}
          </span>
        </div>

        {/* Claim in classification-style quote block */}
        {c.claim && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 mb-3 border border-border/50",
              config.bgAccent
            )}
          >
            <p className="text-[11px] text-muted-foreground italic line-clamp-2">
              &ldquo;{c.claim}&rdquo;
            </p>
          </div>
        )}

        {/* Claimant */}
        {c.claimant && (
          <p className="text-[10px] text-muted-foreground font-mono">
            &mdash; {c.claimant}
          </p>
        )}
      </div>
    </button>
  );
}
