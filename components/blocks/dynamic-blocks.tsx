"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

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
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Background texture layers */}
      <div className="absolute inset-0 grid-overlay opacity-[0.03]" />
      <div className="absolute inset-0 data-stream" />

      <div className="relative z-10">
        {/* Classification header */}
        <div className="classification-header px-4 py-2 text-center">
          CONDOR &nbsp;// &nbsp;RADAR DE INTELIGENCIA &nbsp;// &nbsp;
          {sortedBlocks.length} SEÑALES DETECTADAS &nbsp;// &nbsp;EN VIVO
        </div>

        {/* Section title area */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald pulse-dot" />
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Lo que CONDOR detecta hoy
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            {sortedBlocks.length} señales activas &middot; Actualizado cada 4h
          </p>
        </div>

        {/* Grid */}
        <div className="px-4 sm:px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedBlocks.map((block, index) => {
            const Component =
              BLOCK_COMPONENTS[block.block_type as HomepageBlockType];
            if (!Component) return null;

            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.35 }}
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
      </div>
    </section>
  );
}
