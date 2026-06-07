import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { COUNTRIES } from "@/lib/config/countries";
import { logAction } from "@/lib/brain/audit";
import type {
  SiteAuditReport,
  SiteAuditorResult,
  AuditStatus,
  ContentCheckResult,
  FreshnessCheckResult,
  QualityCheckResult,
  SeoCheckResult,
  TrendResult,
  ActionableFinding,
} from "@/lib/types/site-audit";

// =============================================================================
// CONSTANTS
// =============================================================================

const BASE_URL = "https://www.condorlatam.com";
const FETCH_TIMEOUT_MS = 3000;

const KEY_PAGES = [
  "",
  "/candidatos",
  "/encuestas",
  "/noticias",
  "/verificador",
  "/planes",
  "/quiz",
];

// =============================================================================
// MAIN JOB
// =============================================================================

export type { SiteAuditorResult };

export async function runSiteAuditor(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<SiteAuditorResult> {
  const startTime = Date.now();
  let errors = 0;

  try {
    console.log(`[brain][site-auditor][${countryCode}] Starting...`);

    // ─── Parallel: DB checks ──────────────────────────────────
    const [content, freshness, quality] = await Promise.all([
      checkContentCompleteness(supabase, countryCode),
      checkDataFreshness(supabase, countryCode),
      checkDataQuality(supabase, countryCode),
    ]);

    // ─── Sequential: SEO checks (HTTP) ────────────────────────
    const candidateSlugs = content.weakest_candidates
      .concat(
        content.zero_coverage.length > 0
          ? []
          : ([] as { name: string; slug: string; missing: string[] }[])
      )
      .slice(0, 3)
      .map((c) => c.slug);

    // Get some candidate slugs for SEO check
    const { data: sampleCandidates } = await supabase
      .from("candidates")
      .select("slug")
      .eq("country_code", countryCode)
      .eq("is_active", true)
      .limit(5);

    const slugsToCheck = (sampleCandidates || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.slug);

    const seo = await checkSeoHealth(countryCode, slugsToCheck);

    // ─── Compute scores ───────────────────────────────────────
    const content_score = computeContentScore(content);
    const freshness_score = computeFreshnessScore(freshness);
    const quality_score = computeQualityScore(quality);
    const seo_score = computeSeoScore(seo);
    const overall_score = Math.round(
      (content_score + freshness_score + quality_score + seo_score) / 4
    );
    const overall_status = getStatus(overall_score);

    // ─── Trends ───────────────────────────────────────────────
    const trends = await computeTrends(supabase, countryCode, {
      overall_score,
      content_score,
      freshness_score,
      quality_score,
      seo_score,
    });

    // ─── Actionable findings ──────────────────────────────────
    const actionable_findings = generateFindings(
      content,
      freshness,
      quality,
      seo,
      trends
    );

    // ─── Build report ─────────────────────────────────────────
    const report: SiteAuditReport = {
      content,
      freshness,
      quality,
      seo,
      trends,
      actionable_findings,
    };

    const duration_ms = Date.now() - startTime;
    const todayStr = new Date().toISOString().split("T")[0];

    // ─── Store (idempotent upsert) ────────────────────────────
    const { error: upsertError } = await supabase
      .from("site_audit_reports")
      .upsert(
        {
          id: `sar-${countryCode}-${todayStr}`,
          run_id: runId,
          country_code: countryCode,
          audit_date: todayStr,
          overall_score,
          overall_status,
          content_score,
          freshness_score,
          quality_score,
          seo_score,
          report,
          trend_direction: trends.direction,
          trend_delta: trends.delta,
          duration_ms,
        },
        { onConflict: "country_code,audit_date" }
      );

    if (upsertError) {
      console.error(
        `[brain][site-auditor][${countryCode}] Upsert error:`,
        upsertError
      );
      errors++;
    }

    // ─── Audit log ────────────────────────────────────────────
    const criticalCount = actionable_findings.filter(
      (f) => f.severity === "critical"
    ).length;
    const warningCount = actionable_findings.filter(
      (f) => f.severity === "warning"
    ).length;

    await logAction(supabase, {
      run_id: runId,
      job: "site-auditor" as never,
      action_type: "create",
      entity_type: "candidate" as never,
      description: `Site audit: ${overall_score}/100 (${overall_status}) — Content ${content_score}, Freshness ${freshness_score}, Quality ${quality_score}, SEO ${seo_score}. ${criticalCount} critical, ${warningCount} warnings. Trend: ${trends.direction} (${trends.delta >= 0 ? "+" : ""}${trends.delta})`,
      confidence: overall_score / 100,
      country_code: countryCode,
    });

    console.log(
      `[brain][site-auditor][${countryCode}] Done: ${overall_score}/100 (${overall_status}) in ${duration_ms}ms`
    );

    return {
      overall_score,
      overall_status,
      content_score,
      freshness_score,
      quality_score,
      seo_score,
      trend_direction: trends.direction,
      trend_delta: trends.delta,
      duration_ms,
      errors,
    };
  } catch (err) {
    console.error(`[brain][site-auditor][${countryCode}] Fatal error:`, err);
    return {
      overall_score: 0,
      overall_status: "poor",
      content_score: 0,
      freshness_score: 0,
      quality_score: 0,
      seo_score: 0,
      trend_direction: null,
      trend_delta: 0,
      duration_ms: Date.now() - startTime,
      errors: 1,
    };
  }
}

// =============================================================================
// CHECK: Content Completeness
// =============================================================================

async function checkContentCompleteness(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<ContentCheckResult> {
  const [candidatesRes, profilesRes, pollCandidatesRes, articlesRes] =
    await Promise.all([
      supabase
        .from("candidates")
        .select("id, slug, short_name, bio, photo, poll_average")
        .eq("country_code", countryCode)
        .eq("is_active", true),
      supabase
        .from("candidate_profiles")
        .select("candidate_id")
        .eq("country_code", countryCode),
      supabase
        .from("poll_data_points")
        .select("candidate_id")
        .eq("country_code", countryCode),
      supabase
        .from("news_articles")
        .select("candidates_mentioned")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);

  const candidates = candidatesRes.data || [];
  const total = candidates.length;
  if (total === 0) {
    return {
      total_active_candidates: 0,
      with_bio: 0,
      with_photo: 0,
      with_profile: 0,
      with_polls: 0,
      with_news: 0,
      completeness_pct: 0,
      weakest_candidates: [],
      zero_coverage: [],
    };
  }

  const profileSet = new Set(
    (profilesRes.data || []).map((p) => p.candidate_id)
  );
  const pollSet = new Set(
    (pollCandidatesRes.data || []).map((p) => p.candidate_id)
  );

  // Build mentioned set from articles
  const mentionedSet = new Set<string>();
  for (const article of articlesRes.data || []) {
    for (const m of article.candidates_mentioned || []) {
      mentionedSet.add(m);
    }
  }

  let with_bio = 0,
    with_photo = 0,
    with_profile = 0,
    with_polls = 0,
    with_news = 0;
  const weakest: ContentCheckResult["weakest_candidates"] = [];
  const zero_coverage: string[] = [];

  for (const c of candidates) {
    const missing: string[] = [];
    const hasBio = c.bio && c.bio.length > 50;
    const hasPhoto = !!c.photo;
    const hasProfile = profileSet.has(c.id);
    const hasPolls = pollSet.has(c.id);
    const hasNews =
      mentionedSet.has(c.id) ||
      mentionedSet.has(c.slug) ||
      mentionedSet.has(c.short_name);

    if (hasBio) with_bio++;
    else missing.push("bio");
    if (hasPhoto) with_photo++;
    else missing.push("foto");
    if (hasProfile) with_profile++;
    else missing.push("perfil");
    if (hasPolls) with_polls++;
    else missing.push("encuestas");
    if (hasNews) with_news++;
    else {
      missing.push("noticias");
      zero_coverage.push(c.short_name);
    }

    if (missing.length >= 2) {
      weakest.push({ name: c.short_name, slug: c.slug, missing });
    }
  }

  // Sort weakest by most missing
  weakest.sort((a, b) => b.missing.length - a.missing.length);

  const completeness_pct = Math.round(
    ((with_bio + with_photo + with_profile + with_polls + with_news) /
      (total * 5)) *
      100
  );

  return {
    total_active_candidates: total,
    with_bio,
    with_photo,
    with_profile,
    with_polls,
    with_news,
    completeness_pct,
    weakest_candidates: weakest.slice(0, 10),
    zero_coverage: zero_coverage.slice(0, 10),
  };
}

// =============================================================================
// CHECK: Data Freshness
// =============================================================================

async function checkDataFreshness(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<FreshnessCheckResult> {
  const now = Date.now();
  const todayStr = new Date().toISOString().split("T")[0];

  const [latestArticleRes, latestFactCheckRes, homepageBlocksRes, briefingRes, pollsRes] =
    await Promise.all([
      supabase
        .from("news_articles")
        .select("created_at")
        .eq("country_code", countryCode)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("fact_checks")
        .select("created_at")
        .eq("country_code", countryCode)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("homepage_blocks")
        .select("is_active, expires_at")
        .eq("country_code", countryCode)
        .eq("is_active", true),
      supabase
        .from("brain_briefings")
        .select("briefing_date")
        .eq("country_code", countryCode)
        .order("briefing_date", { ascending: false })
        .limit(1),
      supabase
        .from("poll_data_points")
        .select("date")
        .eq("country_code", countryCode)
        .order("date", { ascending: false })
        .limit(50),
    ]);

  // News recency
  const latestArticle = latestArticleRes.data?.[0];
  const news_recency_hours = latestArticle
    ? (now - new Date(latestArticle.created_at).getTime()) / (1000 * 60 * 60)
    : 999;

  // Fact-check recency
  const latestFC = latestFactCheckRes.data?.[0];
  const days_since_last_fact_check = latestFC
    ? (now - new Date(latestFC.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  // Homepage blocks
  const blocks = homepageBlocksRes.data || [];
  const homepage_blocks_total = blocks.length;
  const homepage_blocks_expired = blocks.filter(
    (b) => new Date(b.expires_at).getTime() < now
  ).length;

  // Briefing
  const latestBriefing = briefingRes.data?.[0];
  const briefing_is_current = latestBriefing?.briefing_date === todayStr;
  const briefing_last_date = latestBriefing?.briefing_date || null;

  // Poll staleness — average days since latest poll across unique candidates
  const pollDates = pollsRes.data || [];
  let avg_poll_staleness_days = 999;
  if (pollDates.length > 0) {
    const latestPollDate = new Date(pollDates[0].date);
    avg_poll_staleness_days =
      (now - latestPollDate.getTime()) / (1000 * 60 * 60 * 24);
  }

  return {
    avg_poll_staleness_days: Math.round(avg_poll_staleness_days * 10) / 10,
    news_recency_hours: Math.round(news_recency_hours * 10) / 10,
    days_since_last_fact_check:
      Math.round(days_since_last_fact_check * 10) / 10,
    homepage_blocks_expired,
    homepage_blocks_total,
    briefing_is_current,
    briefing_last_date,
  };
}

// =============================================================================
// CHECK: Data Quality
// =============================================================================

async function checkDataQuality(
  supabase: SupabaseClient,
  countryCode: CountryCode
): Promise<QualityCheckResult> {
  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [anomalyRes, totalPollsRes, articlesRes, profilesRes, integrityRes, candidatesRes] =
    await Promise.all([
      supabase
        .from("brain_actions")
        .select("id", { count: "exact", head: true })
        .eq("country_code", countryCode)
        .in("job", ["poll-verifier", "data-integrity"])
        .eq("action_type", "flag")
        .gte("created_at", oneWeekAgo),
      supabase
        .from("poll_data_points")
        .select("id", { count: "exact", head: true })
        .eq("country_code", countryCode)
        .gte("date", oneWeekAgo.split("T")[0]),
      supabase
        .from("news_articles")
        .select("source")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .gte("created_at", oneWeekAgo),
      supabase
        .from("candidate_profiles")
        .select("confidence")
        .eq("country_code", countryCode),
      supabase
        .from("brain_actions")
        .select("id", { count: "exact", head: true })
        .eq("country_code", countryCode)
        .eq("job", "data-integrity")
        .eq("action_type", "flag")
        .gte("created_at", oneWeekAgo),
      supabase
        .from("candidates")
        .select("id")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .gt("poll_average", 0),
    ]);

  // Poll anomaly rate
  const anomalyCount = anomalyRes.count || 0;
  const totalPolls = totalPollsRes.count || 1;
  const poll_anomaly_rate = Math.round((anomalyCount / totalPolls) * 100);

  // News source diversity
  const articles = articlesRes.data || [];
  const uniqueSources = new Set(articles.map((a) => a.source));
  const configuredSources = COUNTRIES[countryCode].mediaSources.length;
  const news_source_count = uniqueSources.size;
  const news_source_diversity = Math.min(
    100,
    Math.round((news_source_count / configuredSources) * 100)
  );

  // Fact-check coverage (simplified: % of top candidates that have been fact-checked)
  // For now use a heuristic based on candidate count vs fact-check volume
  const topCandidateCount = candidatesRes.data?.length || 1;
  const fact_check_coverage_pct = Math.min(
    100,
    Math.round((articles.length / (topCandidateCount * 2)) * 100)
  );

  // Profile confidence distribution
  const profiles = profilesRes.data || [];
  const dist = { high: 0, medium: 0, low: 0, none: 0 };
  const totalCandidates = topCandidateCount;
  for (const p of profiles) {
    const c = p.confidence || 0;
    if (c >= 0.8) dist.high++;
    else if (c >= 0.5) dist.medium++;
    else dist.low++;
  }
  dist.none = Math.max(0, totalCandidates - profiles.length);

  const profile_confidence_avg =
    profiles.length > 0
      ? Math.round(
          (profiles.reduce((sum, p) => sum + (p.confidence || 0), 0) /
            profiles.length) *
            100
        ) / 100
      : 0;

  const data_integrity_flags_week = integrityRes.count || 0;

  return {
    poll_anomaly_rate,
    news_source_count,
    news_source_diversity,
    fact_check_coverage_pct: Math.min(100, fact_check_coverage_pct),
    profile_confidence_avg,
    profile_confidence_distribution: dist,
    data_integrity_flags_week,
  };
}

// =============================================================================
// CHECK: SEO Health
// =============================================================================

async function checkSeoHealth(
  countryCode: CountryCode,
  candidateSlugs: string[]
): Promise<SeoCheckResult> {
  const pages_failed: SeoCheckResult["pages_failed"] = [];
  let pages_ok = 0;

  // Check key pages + candidate pages + sitemap in parallel
  const pageUrls = KEY_PAGES.map((p) => `${BASE_URL}/${countryCode}${p}`);
  const candidateUrls = candidateSlugs.map(
    (slug) => `${BASE_URL}/${countryCode}/candidatos/${slug}`
  );
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;

  const allUrls = [...pageUrls, ...candidateUrls];
  const results = await Promise.allSettled(
    allUrls.map((url) => fetchWithTimeout(url, FETCH_TIMEOUT_MS))
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const url = allUrls[i];
    if (result.status === "fulfilled") {
      if (result.value.ok) {
        pages_ok++;
      } else {
        pages_failed.push({ url, status: result.value.status });
      }
    } else {
      pages_failed.push({ url, status: null, error: "timeout" });
    }
  }

  // Check sitemap
  let sitemap_accessible = false;
  let sitemap_url_count = 0;
  try {
    const sitemapRes = await fetchWithTimeout(sitemapUrl, FETCH_TIMEOUT_MS);
    if (sitemapRes.ok) {
      sitemap_accessible = true;
      const text = await sitemapRes.text();
      sitemap_url_count = (text.match(/<loc>/g) || []).length;
    }
  } catch {
    sitemap_accessible = false;
  }

  return {
    pages_checked: allUrls.length,
    pages_ok,
    pages_failed,
    sitemap_accessible,
    sitemap_url_count,
    candidate_pages_checked: candidateUrls.length,
    candidate_pages_ok: candidateUrls.length - pages_failed.filter((f) =>
      f.url.includes("/candidatos/")
    ).length,
  };
}

// =============================================================================
// TRENDS
// =============================================================================

async function computeTrends(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  current: {
    overall_score: number;
    content_score: number;
    freshness_score: number;
    quality_score: number;
    seo_score: number;
  }
): Promise<TrendResult> {
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: prevReport } = await supabase
    .from("site_audit_reports")
    .select(
      "overall_score, content_score, freshness_score, quality_score, seo_score, audit_date"
    )
    .eq("country_code", countryCode)
    .lt("audit_date", todayStr)
    .order("audit_date", { ascending: false })
    .limit(1);

  if (!prevReport || prevReport.length === 0) {
    return {
      previous_overall_score: null,
      previous_date: null,
      direction: "stable",
      delta: 0,
      biggest_changes: [],
    };
  }

  const prev = prevReport[0];
  const delta = current.overall_score - prev.overall_score;
  const direction: TrendResult["direction"] =
    delta > 2 ? "improving" : delta < -2 ? "degrading" : "stable";

  const categories = [
    { category: "Contenido", previous: prev.content_score, current: current.content_score },
    { category: "Frescura", previous: prev.freshness_score, current: current.freshness_score },
    { category: "Calidad", previous: prev.quality_score, current: current.quality_score },
    { category: "SEO", previous: prev.seo_score, current: current.seo_score },
  ].map((c) => ({ ...c, delta: c.current - c.previous }));

  categories.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    previous_overall_score: prev.overall_score,
    previous_date: prev.audit_date,
    direction,
    delta,
    biggest_changes: categories,
  };
}

// =============================================================================
// SCORING
// =============================================================================

function computeContentScore(content: ContentCheckResult): number {
  if (content.total_active_candidates === 0) return 0;
  return content.completeness_pct;
}

function computeFreshnessScore(f: FreshnessCheckResult): number {
  // Polls: 30% weight
  const pollScore =
    f.avg_poll_staleness_days < 5 ? 100 : f.avg_poll_staleness_days < 10 ? 50 : 0;

  // News: 25% weight
  const newsScore =
    f.news_recency_hours < 12 ? 100 : f.news_recency_hours < 24 ? 75 : f.news_recency_hours < 36 ? 25 : 0;

  // Fact-checks: 15% weight
  const fcScore =
    f.days_since_last_fact_check < 3 ? 100 : f.days_since_last_fact_check < 7 ? 50 : 0;

  // Homepage: 15% weight
  const homepageScore =
    f.homepage_blocks_total > 0
      ? Math.round(
          ((f.homepage_blocks_total - f.homepage_blocks_expired) /
            f.homepage_blocks_total) *
            100
        )
      : 0;

  // Briefing: 15% weight
  const briefingScore = f.briefing_is_current ? 100 : f.briefing_last_date ? 30 : 0;

  return Math.round(
    pollScore * 0.3 +
      newsScore * 0.25 +
      fcScore * 0.15 +
      homepageScore * 0.15 +
      briefingScore * 0.15
  );
}

function computeQualityScore(q: QualityCheckResult): number {
  // Low anomaly rate: 25%
  const anomalyScore =
    q.poll_anomaly_rate === 0 ? 100 : q.poll_anomaly_rate < 5 ? 75 : q.poll_anomaly_rate < 10 ? 50 : 25;

  // Source diversity: 25%
  const diversityScore = q.news_source_diversity;

  // Fact-check coverage: 20%
  const fcCovScore = Math.min(100, q.fact_check_coverage_pct);

  // Profile confidence: 20%
  const confScore = Math.round(q.profile_confidence_avg * 100);

  // Low integrity flags: 10%
  const integrityScore =
    q.data_integrity_flags_week === 0 ? 100 : q.data_integrity_flags_week < 5 ? 60 : 30;

  return Math.round(
    anomalyScore * 0.25 +
      diversityScore * 0.25 +
      fcCovScore * 0.2 +
      confScore * 0.2 +
      integrityScore * 0.1
  );
}

function computeSeoScore(seo: SeoCheckResult): number {
  if (seo.pages_checked === 0) return 0;
  const pageScore = Math.round((seo.pages_ok / seo.pages_checked) * 100);
  const sitemapBonus = seo.sitemap_accessible ? 0 : -10;
  return Math.max(0, Math.min(100, pageScore + sitemapBonus));
}

function getStatus(score: number): AuditStatus {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

// =============================================================================
// FINDINGS
// =============================================================================

function generateFindings(
  content: ContentCheckResult,
  freshness: FreshnessCheckResult,
  quality: QualityCheckResult,
  seo: SeoCheckResult,
  trends: TrendResult
): ActionableFinding[] {
  const findings: ActionableFinding[] = [];

  // Content findings
  if (content.zero_coverage.length > 3) {
    findings.push({
      severity: "critical",
      category: "Contenido",
      message: `${content.zero_coverage.length} candidatos sin cobertura mediatica`,
      action: "Verificar RSS feeds y clasificacion de noticias",
    });
  } else if (content.zero_coverage.length > 0) {
    findings.push({
      severity: "warning",
      category: "Contenido",
      message: `${content.zero_coverage.length} candidatos sin noticias: ${content.zero_coverage.slice(0, 3).join(", ")}`,
      action: "Revisar si hay noticias no clasificadas",
    });
  }

  const noPhoto = content.total_active_candidates - content.with_photo;
  if (noPhoto > 3) {
    findings.push({
      severity: "warning",
      category: "Contenido",
      message: `${noPhoto} candidatos sin foto`,
      action: "Subir fotos en /admin",
    });
  }

  const noProfile = content.total_active_candidates - content.with_profile;
  if (noProfile > 5) {
    findings.push({
      severity: "warning",
      category: "Contenido",
      message: `${noProfile} candidatos sin perfil investigado`,
      action: "El Profile Researcher los completara en proximas corridas",
    });
  }

  // Freshness findings
  if (freshness.news_recency_hours > 36) {
    findings.push({
      severity: "critical",
      category: "Frescura",
      message: `Noticias desactualizadas: ultima hace ${Math.round(freshness.news_recency_hours)}h`,
      action: "Verificar que el scraper este corriendo",
    });
  }

  if (freshness.avg_poll_staleness_days > 10) {
    findings.push({
      severity: "warning",
      category: "Frescura",
      message: `Encuestas desactualizadas: ultima hace ${Math.round(freshness.avg_poll_staleness_days)} dias`,
      action: "Revisar si hay encuestas nuevas por registrar",
    });
  }

  if (!freshness.briefing_is_current) {
    findings.push({
      severity: "info",
      category: "Frescura",
      message: "No hay briefing de hoy",
      action: "Se genera automaticamente en la proxima corrida del Brain",
    });
  }

  // Quality findings
  if (quality.news_source_diversity < 40) {
    findings.push({
      severity: "warning",
      category: "Calidad",
      message: `Baja diversidad de fuentes: solo ${quality.news_source_count} fuentes activas`,
      action: "Revisar RSS feeds en scraper",
    });
  }

  if (quality.profile_confidence_avg < 0.5 && quality.profile_confidence_distribution.low > 3) {
    findings.push({
      severity: "warning",
      category: "Calidad",
      message: `${quality.profile_confidence_distribution.low} perfiles con baja confianza`,
      action: "Mas noticias mejoraran los perfiles automaticamente",
    });
  }

  // SEO findings
  if (seo.pages_failed.length > 0) {
    findings.push({
      severity: "critical",
      category: "SEO",
      message: `${seo.pages_failed.length} paginas con error: ${seo.pages_failed.map((p) => p.url.split("/").pop() || p.url).join(", ")}`,
      action: "Verificar el deploy y las rutas",
    });
  }

  if (!seo.sitemap_accessible) {
    findings.push({
      severity: "critical",
      category: "SEO",
      message: "Sitemap no accesible",
      action: "Verificar /sitemap.xml",
    });
  }

  // Trend findings
  if (trends.delta > 5) {
    findings.push({
      severity: "info",
      category: "Tendencia",
      message: `Score subio +${trends.delta} puntos vs ayer`,
      action: "Buen progreso",
    });
  } else if (trends.delta < -5) {
    findings.push({
      severity: "warning",
      category: "Tendencia",
      message: `Score bajo ${trends.delta} puntos vs ayer`,
      action: "Revisar que cambio desde la ultima auditoria",
    });
  }

  return findings;
}

// =============================================================================
// HELPERS
// =============================================================================

async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "CONDOR-Brain-Auditor/1.0" },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}
