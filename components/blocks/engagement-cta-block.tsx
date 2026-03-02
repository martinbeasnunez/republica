"use client";

import { Zap, HelpCircle, GitCompare, Bell, Compass, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomepageBlock, EngagementCTAContent } from "@/lib/types/homepage-blocks";

interface Props {
  block: HomepageBlock;
  onClick: () => void;
}

const variantConfig: Record<
  string,
  {
    icon: typeof Zap;
    gradient: string;
    iconBg: string;
    iconColor: string;
    borderAccent: string;
    glowClass: string;
  }
> = {
  quiz: {
    icon: HelpCircle,
    gradient: "from-primary/10 via-transparent to-primary/5",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    borderAccent: "border-primary/25",
    glowClass: "",
  },
  compare: {
    icon: GitCompare,
    gradient: "from-sky-500/10 via-transparent to-sky-500/5",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-500",
    borderAccent: "border-sky-500/25",
    glowClass: "",
  },
  subscribe: {
    icon: Bell,
    gradient: "from-emerald-500/10 via-transparent to-emerald-500/5",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
    borderAccent: "border-emerald-500/25",
    glowClass: "glow-emerald",
  },
  explore: {
    icon: Compass,
    gradient: "from-amber-500/10 via-transparent to-amber-500/5",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
    borderAccent: "border-amber-500/25",
    glowClass: "glow-amber",
  },
};

export function EngagementCTABlock({ block, onClick }: Props) {
  const c = block.content as unknown as EngagementCTAContent;
  const variant = variantConfig[c.variant] || variantConfig.explore;
  const Icon = variant.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl overflow-hidden transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer",
        `bg-gradient-to-br ${variant.gradient}`,
        `border-2 ${variant.borderAccent}`,
        variant.glowClass
      )}
    >
      <div className="p-4">
        {/* Large icon in colored circle + title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
              variant.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", variant.iconColor)} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
              Explora
            </span>
            <p className="text-sm font-bold text-foreground line-clamp-1">
              {block.title}
            </p>
          </div>
        </div>

        {/* Description */}
        {c.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
            {c.description}
          </p>
        )}

        {/* CTA with animated arrow */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold transition-all",
            variant.iconColor
          )}
        >
          {c.cta_text || "Descubrir"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}
