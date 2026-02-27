import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/config/countries";
import { logAction } from "@/lib/brain/audit";

// =============================================================================
// TYPES
// =============================================================================

export interface HealthAlert {
  severity: "critical" | "warning" | "info";
  system: string;
  message: string;
  details?: string;
}

export interface HealthMonitorResult {
  status: "healthy" | "degraded" | "critical";
  alerts: HealthAlert[];
  checks: {
    scraper: { ok: boolean; lastRun: string | null; articleCount24h: number };
    verifier: { ok: boolean; lastRun: string | null; checkCount24h: number };
    polls: { ok: boolean; lastUpdate: string | null; staleCandidates: number };
    candidates: { ok: boolean; missingFields: number; inactiveCandidates: number };
    brain: { ok: boolean; lastRun: string | null; actionsToday: number };
  };
  errors: number;
}

// =============================================================================
// THRESHOLDS
// =============================================================================

/** Max hours since last scrape before alert */
const SCRAPE_STALE_HOURS = 36;
/** Max hours since last fact-check before alert */
const VERIFY_STALE_HOURS = 72;
/** Max days since last poll update before alert */
const POLL_STALE_DAYS = 10;

// =============================================================================
// MAIN JOB
// =============================================================================

/**
 * Health Monitor Job
 *
 * Checks the health of all automated systems:
 * - News scraper (last run, article count)
 * - Fact-check verifier (last run, check count)
 * - Poll updates (last update, stale candidates)
 * - Candidate data quality (missing fields)
 * - Brain itself (last run, actions)
 *
 * Generates alerts for anything that looks wrong.
 */
export async function runHealthMonitor(
  supabase: SupabaseClient,
  countryCode: CountryCode,
  runId: string
): Promise<HealthMonitorResult> {
  const alerts: HealthAlert[] = [];
  const now = Date.now();

  const result: HealthMonitorResult = {
    status: "healthy",
    alerts: [],
    checks: {
      scraper: { ok: true, lastRun: null, articleCount24h: 0 },
      verifier: { ok: true, lastRun: null, checkCount24h: 0 },
      polls: { ok: true, lastUpdate: null, staleCandidates: 0 },
      candidates: { ok: true, missingFields: 0, inactiveCandidates: 0 },
      brain: { ok: true, lastRun: null, actionsToday: 0 },
    },
    errors: 0,
  };

  try {
    console.log(`[brain][health][${countryCode}] Starting health check...`);

    // ─── 1. Check News Scraper ──────────────────────────────
    try {
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const staleThreshold = new Date(now - SCRAPE_STALE_HOURS * 60 * 60 * 1000).toISOString();

      const { data: recentArticles, count: articleCount } = await supabase
        .from("news_articles")
        .select("created_at", { count: "exact" })
        .eq("country_code", countryCode)
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastArticle = recentArticles?.[0]?.created_at || null;
      result.checks.scraper.lastRun = lastArticle;
      result.checks.scraper.articleCount24h = articleCount || 0;

      if (!lastArticle || lastArticle < staleThreshold) {
        result.checks.scraper.ok = false;
        alerts.push({
          severity: "critical",
          system: "scraper",
          message: `Scraper de noticias sin actividad hace ${lastArticle ? Math.round((now - new Date(lastArticle).getTime()) / 3600000) + "h" : "nunca"}`,
          details: `Ultimo articulo: ${lastArticle || "ninguno"}. Se esperan articulos cada ${SCRAPE_STALE_HOURS}h.`,
        });
      } else if ((articleCount || 0) < 3) {
        alerts.push({
          severity: "warning",
          system: "scraper",
          message: `Solo ${articleCount} articulos en las ultimas 24h (esperado: >5)`,
        });
      }
    } catch (err) {
      result.checks.scraper.ok = false;
      result.errors++;
      alerts.push({
        severity: "critical",
        system: "scraper",
        message: "Error al verificar scraper de noticias",
        details: String(err),
      });
    }

    // ─── 2. Check Fact-Check Verifier ───────────────────────
    try {
      const verifyThreshold = new Date(now - VERIFY_STALE_HOURS * 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

      const { data: recentChecks, count: checkCount } = await supabase
        .from("fact_checks")
        .select("created_at", { count: "exact" })
        .eq("country_code", countryCode)
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastCheck = recentChecks?.[0]?.created_at || null;
      result.checks.verifier.lastRun = lastCheck;
      result.checks.verifier.checkCount24h = checkCount || 0;

      // Check if there are ANY fact checks recently
      const { data: anyRecent } = await supabase
        .from("fact_checks")
        .select("created_at")
        .eq("country_code", countryCode)
        .gte("created_at", verifyThreshold)
        .limit(1);

      if (!anyRecent || anyRecent.length === 0) {
        result.checks.verifier.ok = false;
        alerts.push({
          severity: "warning",
          system: "verifier",
          message: `Verificador sin actividad hace mas de ${VERIFY_STALE_HOURS}h`,
          details: `Ultimo fact-check: ${lastCheck || "ninguno"}`,
        });
      }
    } catch (err) {
      result.checks.verifier.ok = false;
      result.errors++;
      alerts.push({
        severity: "critical",
        system: "verifier",
        message: "Error al verificar sistema de fact-checking",
        details: String(err),
      });
    }

    // ─── 3. Check Poll Data Freshness ───────────────────────
    try {
      const pollStaleDate = new Date(now - POLL_STALE_DAYS * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { data: candidates } = await supabase
        .from("candidates")
        .select("id, short_name")
        .eq("is_active", true)
        .eq("country_code", countryCode);

      let staleCandidates = 0;
      let lastPollDate: string | null = null;

      for (const c of candidates || []) {
        const { data: latestPoll } = await supabase
          .from("poll_data_points")
          .select("date")
          .eq("candidate_id", c.id)
          .order("date", { ascending: false })
          .limit(1);

        const pollDate = latestPoll?.[0]?.date || null;
        if (!lastPollDate || (pollDate && pollDate > lastPollDate)) {
          lastPollDate = pollDate;
        }
        if (!pollDate || pollDate < pollStaleDate) {
          staleCandidates++;
        }
      }

      result.checks.polls.lastUpdate = lastPollDate;
      result.checks.polls.staleCandidates = staleCandidates;

      if (staleCandidates > (candidates?.length || 0) / 2) {
        result.checks.polls.ok = false;
        alerts.push({
          severity: "warning",
          system: "polls",
          message: `${staleCandidates} de ${candidates?.length || 0} candidatos sin encuestas recientes (>${POLL_STALE_DAYS} dias)`,
        });
      }
    } catch (err) {
      result.checks.polls.ok = false;
      result.errors++;
      alerts.push({
        severity: "critical",
        system: "polls",
        message: "Error al verificar datos de encuestas",
        details: String(err),
      });
    }

    // ─── 4. Check Candidate Data Quality ────────────────────
    try {
      const { data: allCandidates } = await supabase
        .from("candidates")
        .select("id, short_name, bio, age, party, profession, photo, is_active")
        .eq("country_code", countryCode);

      const active = (allCandidates || []).filter((c) => c.is_active);
      const inactive = (allCandidates || []).filter((c) => !c.is_active);

      let missingFields = 0;
      const issues: string[] = [];

      for (const c of active) {
        if (!c.bio || c.bio.length < 20) {
          missingFields++;
          issues.push(`${c.short_name}: bio vacia o muy corta`);
        }
        if (!c.age || c.age < 25 || c.age > 90) {
          missingFields++;
          issues.push(`${c.short_name}: edad invalida (${c.age})`);
        }
        if (!c.party) {
          missingFields++;
          issues.push(`${c.short_name}: sin partido`);
        }
        if (!c.photo) {
          missingFields++;
          issues.push(`${c.short_name}: sin foto`);
        }
      }

      result.checks.candidates.missingFields = missingFields;
      result.checks.candidates.inactiveCandidates = inactive.length;

      if (missingFields > 0) {
        result.checks.candidates.ok = false;
        alerts.push({
          severity: missingFields > 3 ? "warning" : "info",
          system: "candidates",
          message: `${missingFields} campos faltantes en datos de candidatos`,
          details: issues.slice(0, 5).join("; "),
        });
      }
    } catch (err) {
      result.checks.candidates.ok = false;
      result.errors++;
      alerts.push({
        severity: "critical",
        system: "candidates",
        message: "Error al verificar datos de candidatos",
        details: String(err),
      });
    }

    // ─── 5. Check Brain itself ──────────────────────────────
    try {
      const todayStart = new Date().toISOString().split("T")[0];

      const { data: brainActions, count: actionsToday } = await supabase
        .from("brain_actions")
        .select("created_at", { count: "exact" })
        .eq("country_code", countryCode)
        .gte("created_at", todayStart)
        .order("created_at", { ascending: false })
        .limit(1);

      result.checks.brain.lastRun = brainActions?.[0]?.created_at || null;
      result.checks.brain.actionsToday = actionsToday || 0;
    } catch {
      // Non-critical — brain is running right now
    }

    // ─── 6. Determine overall status ────────────────────────
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const warningCount = alerts.filter((a) => a.severity === "warning").length;

    if (criticalCount > 0) {
      result.status = "critical";
    } else if (warningCount > 0) {
      result.status = "degraded";
    } else {
      result.status = "healthy";
    }

    result.alerts = alerts;

    // ─── 7. Log alerts to audit trail ───────────────────────
    for (const alert of alerts.filter((a) => a.severity === "critical" || a.severity === "warning")) {
      await logAction(supabase, {
        run_id: runId,
        job: "health-monitor" as "data-integrity",
        action_type: "flag",
        entity_type: "candidate",
        entity_id: alert.system,
        description: `[HEALTH ${alert.severity.toUpperCase()}] ${alert.message}`,
        after_value: { details: alert.details || "" },
        confidence: alert.severity === "critical" ? 1.0 : 0.7,
        country_code: countryCode,
      });
    }

    console.log(
      `[brain][health][${countryCode}] Status: ${result.status} (${criticalCount} critical, ${warningCount} warning, ${alerts.length - criticalCount - warningCount} info)`
    );

    return result;
  } catch (err) {
    console.error(`[brain][health][${countryCode}] Fatal error:`, err);
    result.errors++;
    result.status = "critical";
    result.alerts = [
      {
        severity: "critical",
        system: "health-monitor",
        message: "Health monitor crashed",
        details: String(err),
      },
    ];
    return result;
  }
}
