// =============================================================================
// Site Audit Report Types
// =============================================================================

export interface ContentCheckResult {
  total_active_candidates: number;
  with_bio: number;
  with_photo: number;
  with_profile: number;
  with_polls: number;
  with_news: number;
  completeness_pct: number;
  weakest_candidates: Array<{
    name: string;
    slug: string;
    missing: string[];
  }>;
  zero_coverage: string[];
}

export interface FreshnessCheckResult {
  avg_poll_staleness_days: number;
  news_recency_hours: number;
  days_since_last_fact_check: number;
  homepage_blocks_expired: number;
  homepage_blocks_total: number;
  briefing_is_current: boolean;
  briefing_last_date: string | null;
}

export interface QualityCheckResult {
  poll_anomaly_rate: number;
  news_source_count: number;
  news_source_diversity: number;
  fact_check_coverage_pct: number;
  profile_confidence_avg: number;
  profile_confidence_distribution: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  data_integrity_flags_week: number;
}

export interface SeoCheckResult {
  pages_checked: number;
  pages_ok: number;
  pages_failed: Array<{ url: string; status: number | null; error?: string }>;
  sitemap_accessible: boolean;
  sitemap_url_count: number;
  candidate_pages_checked: number;
  candidate_pages_ok: number;
}

export interface TrendResult {
  previous_overall_score: number | null;
  previous_date: string | null;
  direction: "improving" | "stable" | "degrading";
  delta: number;
  biggest_changes: Array<{
    category: string;
    previous: number;
    current: number;
    delta: number;
  }>;
}

export interface ActionableFinding {
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  action: string;
}

export interface SiteAuditReport {
  content: ContentCheckResult;
  freshness: FreshnessCheckResult;
  quality: QualityCheckResult;
  seo: SeoCheckResult;
  trends: TrendResult;
  actionable_findings: ActionableFinding[];
}

export type AuditStatus = "excellent" | "good" | "fair" | "poor";

export interface SiteAuditorResult {
  overall_score: number;
  overall_status: AuditStatus;
  content_score: number;
  freshness_score: number;
  quality_score: number;
  seo_score: number;
  trend_direction: "improving" | "stable" | "degrading" | null;
  trend_delta: number;
  duration_ms: number;
  errors: number;
}
