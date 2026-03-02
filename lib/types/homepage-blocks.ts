// =============================================================================
// HOMEPAGE BLOCKS — Shared types (backend + frontend)
// =============================================================================

export type HomepageBlockType =
  | "poll_shift"
  | "breaking_news"
  | "fact_check_alert"
  | "trending_candidate"
  | "editorial_highlight"
  | "engagement_cta";

export interface HomepageBlock {
  id: string;
  country_code: string;
  block_type: HomepageBlockType;
  position: number;
  title: string;
  subtitle: string | null;
  content: Record<string, unknown>;
  click_count: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

// ── Content schemas per block type ──

export interface PollShiftContent {
  candidate_name: string;
  candidate_slug: string;
  party_color: string;
  previous_value: number;
  current_value: number;
  direction: "up" | "down";
  delta: number;
}

export interface BreakingNewsContent {
  article_title: string;
  article_summary: string;
  source: string;
  source_url: string;
  impact_score: number;
  category: string;
}

export interface FactCheckAlertContent {
  claim: string;
  verdict: string;
  claimant: string;
  summary: string;
}

export interface TrendingCandidateContent {
  candidate_name: string;
  candidate_slug: string;
  party_color: string;
  reason: string;
  mention_count: number;
  poll_average: number;
}

export interface EditorialHighlightContent {
  headline: string;
  body: string;
  key_takeaway: string;
}

export interface EngagementCTAContent {
  cta_text: string;
  cta_link: string;
  description: string;
  variant: "quiz" | "compare" | "subscribe" | "explore";
}

// ── AI response schema ──

export interface HomepageComposerAIBlock {
  block_type: HomepageBlockType;
  position: number;
  title: string;
  subtitle: string | null;
  content: Record<string, unknown>;
}

export interface HomepageComposerAIResponse {
  blocks: HomepageComposerAIBlock[];
  reasoning: string;
}
