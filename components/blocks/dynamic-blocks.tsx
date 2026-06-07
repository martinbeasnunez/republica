"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCountry } from "@/lib/config/country-context";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { HomepageBlock, HomepageBlockType } from "@/lib/types/homepage-blocks";

// ── Block components ──
import { PollShiftBlock } from "./poll-shift-block";
import { BreakingNewsBlock } from "./breaking-news-block";
import { FactCheckAlertBlock } from "./fact-check-alert-block";
import { TrendingCandidateBlock } from "./trending-candidate-block";
import { EditorialHighlightBlock } from "./editorial-highlight-block";
import { EngagementCTABlock } from "./engagement-cta-block";

// ── Block type → component mapping ──
const BLOCK_COMPONENTS: Record<
  HomepageBlockType,
  React.ComponentType<{ block: HomepageBlock; onClick: () => void }>
> = {
  poll_shift: PollShiftBlock,
  breaking_news: BreakingNewsBlock,
  fact_check_alert: FactCheckAlertBlock,
  trending_candidate: TrendingCandidateBlock,
  editorial_highlight: EditorialHighlightBlock,
  engagement_cta: EngagementCTABlock,
};

// ── Block type → default navigation route ──
const BLOCK_ROUTES: Record<HomepageBlockType, string> = {
  poll_shift: "encuestas",
  breaking_news: "noticias",
  fact_check_alert: "verificador",
  trending_candidate: "candidatos",
  editorial_highlight: "noticias",
  engagement_cta: "", // Uses content.cta_link
};

// =============================================================================
// DYNAMIC BLOCKS — orchestrator
// =============================================================================

interface DynamicBlocksProps {
  blocks: HomepageBlock[];
}

export function DynamicBlocks({ blocks }: DynamicBlocksProps) {
  const router = useRouter();
  const country = useCountry();
  const { trackEvent } = useAnalytics();
  const impressionsSent = useRef(false);

  // Filter out engagement_cta blocks (deprecated — they link to nonexistent pages)
  const sortedBlocks = [...blocks]
    .filter((b) => b.block_type !== "engagement_cta")
    .sort((a, b) => a.position - b.position);

  // ── Track impressions once when blocks render ──
  useEffect(() => {
    if (impressionsSent.current || blocks.length === 0) return;
    impressionsSent.current = true;

    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      // Fire impression RPCs for all visible blocks
      blocks.forEach((block) => {
        Promise.resolve(
          supabase.rpc("increment_block_impression", { block_id: block.id })
        ).catch(() => {}); // silently fail if RPC doesn't exist yet
      });
    } catch {
      // silently fail
    }
  }, [blocks]);

  const handleBlockClick = useCallback(
    (block: HomepageBlock) => {
      // Track click in analytics
      trackEvent("click", "homepage_dynamic_block", {
        block_id: block.id,
        block_type: block.block_type,
        block_title: block.title,
        position: block.position,
      });

      // Increment click count in Supabase (fire and forget)
      try {
        const supabase = getSupabaseBrowser();
        if (supabase) {
          Promise.resolve(
            supabase.rpc("increment_block_click", { block_id: block.id })
          ).catch(() => {});
        }
      } catch {
        // silently fail
      }

      // Navigate
      if (
        block.block_type === "engagement_cta" &&
        block.content &&
        typeof block.content === "object" &&
        "cta_link" in block.content
      ) {
        const link = String(block.content.cta_link);
        if (link.startsWith("http")) {
          window.open(link, "_blank", "noopener,noreferrer");
        } else {
          router.push(
            link.startsWith("/") ? link : `/${country.code}/${link}`
          );
        }
        return;
      }

      if (
        block.block_type === "trending_candidate" &&
        block.content &&
        typeof block.content === "object" &&
        "candidate_slug" in block.content
      ) {
        router.push(
          `/${country.code}/candidatos/${block.content.candidate_slug}`
        );
        return;
      }

      if (
        block.block_type === "poll_shift" &&
        block.content &&
        typeof block.content === "object" &&
        "candidate_slug" in block.content
      ) {
        router.push(
          `/${country.code}/candidatos/${block.content.candidate_slug}`
        );
        return;
      }

      if (
        block.block_type === "breaking_news" &&
        block.content &&
        typeof block.content === "object" &&
        "source_url" in block.content &&
        block.content.source_url
      ) {
        window.open(
          String(block.content.source_url),
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      // Default: navigate to section
      const route = BLOCK_ROUTES[block.block_type as HomepageBlockType];
      if (route) {
        router.push(`/${country.code}/${route}`);
      }
    },
    [router, country.code, trackEvent]
  );

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Radar className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-tight">
              CONDOR AI detecta
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Señales importantes que deberías conocer
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] font-mono gap-1.5 h-6 px-2.5">
          <Activity className="h-3 w-3 text-emerald" />
          <span className="font-bold text-foreground">{sortedBlocks.length}</span>
          alertas
        </Badge>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedBlocks.map((block, index) => {
          const Component =
            BLOCK_COMPONENTS[block.block_type as HomepageBlockType];
          if (!Component) return null;

          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              whileHover={{ y: -2 }}
            >
              <Component
                block={block}
                onClick={() => handleBlockClick(block)}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
