import { getSupabase } from "@/lib/supabase";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";
import { runDataIntegrity, type DataIntegrityResult } from "./jobs/data-integrity";
import { runNewsCurator, type NewsCuratorResult } from "./jobs/news-curator";
import { runBriefingGenerator, type BriefingGeneratorResult } from "./jobs/briefing-generator";
import { runPollVerifier, type PollVerifierResult } from "./jobs/poll-verifier";
import { runPollUpdater, type PollUpdaterResult } from "./jobs/poll-updater";
import { runHealthMonitor, type HealthMonitorResult } from "./jobs/health-monitor";
import { runProfileResearcher, type ProfileResearcherResult } from "./jobs/profile-researcher";
import { runHomepageComposer, type HomepageComposerResult } from "./jobs/homepage-composer";
import { runSiteAuditor, type SiteAuditorResult } from "./jobs/site-auditor";

// =============================================================================
// TYPES
// =============================================================================

export interface BrainRunResult {
  runId: string;
  country: string;
  integrity: DataIntegrityResult;
  pollUpdater: PollUpdaterResult;
  pollVerifier: PollVerifierResult;
  curation: NewsCuratorResult;
  briefing: BriefingGeneratorResult;
  profileResearcher: ProfileResearcherResult;
  health: HealthMonitorResult;
  homepageComposer: HomepageComposerResult;
  siteAuditor: SiteAuditorResult;
  duration_ms: number;
}

export interface BrainResult {
  success: boolean;
  runs: Record<string, BrainRunResult>;
  total_duration_ms: number;
}

// =============================================================================
// ORCHESTRATOR
// =============================================================================

/**
 * Run the CONDOR Brain for a single country.
 *
 * Executes 9 jobs in sequence:
 * 1. Data Integrity — verify candidate data against news
 * 2. Poll Updater — fetch official polls from Wikipedia anexos (deterministic)
 * 3. Poll Verifier — cross-verify poll data, detect anomalies
 * 4. News Curator — score and prioritize articles
 * 5. Briefing Generator — create daily editorial summary
 * 6. Profile Researcher — compile verifiable candidate profiles
 * 7. Health Monitor — check system health, generate alerts
 * 8. Homepage Composer — AI-curate dynamic homepage blocks
 * 9. Site Auditor — comprehensive site health audit with scoring
 *
 * Each job logs its actions to brain_actions for full audit trail.
 */
export async function runBrain(countryCode: CountryCode): Promise<BrainRunResult> {
  const startTime = Date.now();
  const runId = `brain-${countryCode}-${Date.now()}`;
  const supabase = getSupabase();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`[CONDOR Brain] Run ${runId} starting for ${countryCode.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);

  // ─── Job 1: Data Integrity ────────────────────────────────
  console.log(`[CONDOR Brain] Job 1/9: Data Integrity`);
  let integrity: DataIntegrityResult;
  try {
    integrity = await runDataIntegrity(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Data Integrity failed:`, err);
    integrity = { checked: 0, updated: 0, flagged: 0, errors: 1 };
  }

  // ─── Job 2: Poll Updater ──────────────────────────────────
  console.log(`[CONDOR Brain] Job 2/9: Poll Updater`);
  let pollUpdater: PollUpdaterResult;
  try {
    pollUpdater = await runPollUpdater(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Poll Updater failed:`, err);
    pollUpdater = {
      fetched: 0,
      accepted: 0,
      rejected: 0,
      polls_inserted: 0,
      data_points_inserted: 0,
      data_points_skipped: 0,
      candidates_updated: 0,
      errors: 1,
      rejected_by_reason: {},
    };
  }

  // ─── Job 3: Poll Verifier ─────────────────────────────────
  console.log(`[CONDOR Brain] Job 3/9: Poll Verifier`);
  let pollVerifier: PollVerifierResult;
  try {
    pollVerifier = await runPollVerifier(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Poll Verifier failed:`, err);
    pollVerifier = { analyzed: 0, anomalies: 0, flagged: 0, removed: 0, errors: 1 };
  }

  // ─── Job 4: News Curation ─────────────────────────────────
  console.log(`[CONDOR Brain] Job 4/9: News Curation`);
  let curation: NewsCuratorResult;
  try {
    curation = await runNewsCurator(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] News Curation failed:`, err);
    curation = { reviewed: 0, set_breaking: 0, deactivated: 0, top_stories: [], errors: 1 };
  }

  // ─── Job 5: Briefing Generator ────────────────────────────
  console.log(`[CONDOR Brain] Job 5/9: Briefing Generator`);
  let briefing: BriefingGeneratorResult;
  try {
    briefing = await runBriefingGenerator(
      supabase,
      countryCode,
      runId,
      curation.top_stories
    );
  } catch (err) {
    console.error(`[CONDOR Brain] Briefing Generator failed:`, err);
    briefing = { briefing_id: null, editorial_summary: "", skipped: false, errors: 1 };
  }

  // ─── Job 6: Profile Researcher ────────────────────────────
  console.log(`[CONDOR Brain] Job 6/9: Profile Researcher`);
  let profileResearcher: ProfileResearcherResult;
  try {
    profileResearcher = await runProfileResearcher(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Profile Researcher failed:`, err);
    profileResearcher = { researched: 0, created: 0, updated: 0, skipped: 0, errors: 1 };
  }

  // ─── Job 7: Health Monitor ────────────────────────────────
  console.log(`[CONDOR Brain] Job 7/9: Health Monitor`);
  let health: HealthMonitorResult;
  try {
    health = await runHealthMonitor(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Health Monitor failed:`, err);
    health = {
      status: "critical",
      alerts: [{ severity: "critical", system: "health-monitor", message: "Monitor crashed" }],
      checks: {
        scraper: { ok: false, lastRun: null, articleCount24h: 0 },
        verifier: { ok: false, lastRun: null, checkCount24h: 0 },
        polls: { ok: false, lastUpdate: null, staleCandidates: 0 },
        candidates: { ok: false, missingFields: 0, inactiveCandidates: 0 },
        brain: { ok: false, lastRun: null, actionsToday: 0 },
      },
      errors: 1,
    };
  }

  // ─── Job 8: Homepage Composer ─────────────────────────────
  console.log(`[CONDOR Brain] Job 8/9: Homepage Composer`);
  let homepageComposer: HomepageComposerResult;
  try {
    homepageComposer = await runHomepageComposer(supabase, countryCode, runId, {
      briefing,
      curation,
      health,
    });
  } catch (err) {
    console.error(`[CONDOR Brain] Homepage Composer failed:`, err);
    homepageComposer = { blocks_created: 0, blocks_deactivated: 0, skipped: false, errors: 1 };
  }

  // ─── Job 9: Site Auditor ──────────────────────────────────
  console.log(`[CONDOR Brain] Job 9/9: Site Auditor`);
  let siteAuditor: SiteAuditorResult;
  try {
    siteAuditor = await runSiteAuditor(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Site Auditor failed:`, err);
    siteAuditor = {
      overall_score: 0,
      overall_status: "poor",
      content_score: 0,
      freshness_score: 0,
      quality_score: 0,
      seo_score: 0,
      trend_direction: null,
      trend_delta: 0,
      duration_ms: 0,
      errors: 1,
    };
  }

  const duration_ms = Date.now() - startTime;

  console.log(`\n[CONDOR Brain] Run ${runId} completed in ${duration_ms}ms`);
  console.log(`  Data Integrity:  ${integrity.checked} checked, ${integrity.updated} updated, ${integrity.flagged} flagged`);
  console.log(`  Poll Updater:    ${pollUpdater.polls_inserted} polls inserted, ${pollUpdater.rejected} rejected, ${pollUpdater.candidates_updated} candidates recalculated`);
  console.log(`  Poll Verifier:   ${pollVerifier.analyzed} analyzed, ${pollVerifier.anomalies} anomalies, ${pollVerifier.flagged} flagged`);
  console.log(`  News Curation:   ${curation.reviewed} reviewed, ${curation.set_breaking} breaking, ${curation.deactivated} deactivated`);
  console.log(`  Briefing:        ${briefing.skipped ? "skipped (already exists)" : briefing.briefing_id ? "created" : "failed"}`);
  console.log(`  Profiles:        ${profileResearcher.researched} researched, ${profileResearcher.created} created, ${profileResearcher.updated} updated`);
  console.log(`  Health:          ${health.status} (${health.alerts.length} alerts)`);
  console.log(`  Homepage:        ${homepageComposer.skipped ? "skipped (already exists)" : `${homepageComposer.blocks_created} blocks created`}`);
  console.log(`  Site Auditor:    ${siteAuditor.overall_score}/100 (${siteAuditor.overall_status})`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    runId,
    country: countryCode,
    integrity,
    pollUpdater,
    pollVerifier,
    curation,
    briefing,
    profileResearcher,
    health,
    homepageComposer,
    siteAuditor,
    duration_ms,
  };
}

/**
 * Run the CONDOR Brain for all countries or a specific one.
 */
export async function runBrainAll(
  countryCode?: CountryCode
): Promise<BrainResult> {
  const startTime = Date.now();
  const countries = countryCode ? [countryCode] : COUNTRY_CODES;
  const runs: Record<string, BrainRunResult> = {};

  for (const cc of countries) {
    try {
      runs[cc] = await runBrain(cc);
    } catch (err) {
      console.error(`[CONDOR Brain] Fatal error for ${cc}:`, err);
      runs[cc] = {
        runId: `brain-${cc}-${Date.now()}-error`,
        country: cc,
        integrity: { checked: 0, updated: 0, flagged: 0, errors: 1 },
        pollUpdater: {
          fetched: 0,
          accepted: 0,
          rejected: 0,
          polls_inserted: 0,
          data_points_inserted: 0,
          data_points_skipped: 0,
          candidates_updated: 0,
          errors: 1,
          rejected_by_reason: {},
        },
        pollVerifier: { analyzed: 0, anomalies: 0, flagged: 0, removed: 0, errors: 1 },
        curation: { reviewed: 0, set_breaking: 0, deactivated: 0, top_stories: [], errors: 1 },
        briefing: { briefing_id: null, editorial_summary: "", skipped: false, errors: 1 },
        profileResearcher: { researched: 0, created: 0, updated: 0, skipped: 0, errors: 1 },
        health: {
          status: "critical",
          alerts: [],
          checks: {
            scraper: { ok: false, lastRun: null, articleCount24h: 0 },
            verifier: { ok: false, lastRun: null, checkCount24h: 0 },
            polls: { ok: false, lastUpdate: null, staleCandidates: 0 },
            candidates: { ok: false, missingFields: 0, inactiveCandidates: 0 },
            brain: { ok: false, lastRun: null, actionsToday: 0 },
          },
          errors: 1,
        },
        homepageComposer: { blocks_created: 0, blocks_deactivated: 0, skipped: false, errors: 1 },
        siteAuditor: { overall_score: 0, overall_status: "poor", content_score: 0, freshness_score: 0, quality_score: 0, seo_score: 0, trend_direction: null, trend_delta: 0, duration_ms: 0, errors: 1 },
        duration_ms: 0,
      };
    }
  }

  return {
    success: true,
    runs,
    total_duration_ms: Date.now() - startTime,
  };
}
