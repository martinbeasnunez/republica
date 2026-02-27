import { getSupabase } from "@/lib/supabase";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";
import { runDataIntegrity, type DataIntegrityResult } from "./jobs/data-integrity";
import { runNewsCurator, type NewsCuratorResult } from "./jobs/news-curator";
import { runBriefingGenerator, type BriefingGeneratorResult } from "./jobs/briefing-generator";
import { runPollVerifier, type PollVerifierResult } from "./jobs/poll-verifier";
import { runHealthMonitor, type HealthMonitorResult } from "./jobs/health-monitor";

// =============================================================================
// TYPES
// =============================================================================

export interface BrainRunResult {
  runId: string;
  country: string;
  integrity: DataIntegrityResult;
  pollVerifier: PollVerifierResult;
  curation: NewsCuratorResult;
  briefing: BriefingGeneratorResult;
  health: HealthMonitorResult;
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
 * Executes 5 jobs in sequence:
 * 1. Data Integrity — verify candidate data against news
 * 2. Poll Verifier — cross-verify poll data, detect anomalies
 * 3. News Curator — score and prioritize articles
 * 4. Briefing Generator — create daily editorial summary
 * 5. Health Monitor — check system health, generate alerts
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
  console.log(`[CONDOR Brain] Job 1/5: Data Integrity`);
  let integrity: DataIntegrityResult;
  try {
    integrity = await runDataIntegrity(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Data Integrity failed:`, err);
    integrity = { checked: 0, updated: 0, flagged: 0, errors: 1 };
  }

  // ─── Job 2: Poll Verifier ─────────────────────────────────
  console.log(`[CONDOR Brain] Job 2/5: Poll Verifier`);
  let pollVerifier: PollVerifierResult;
  try {
    pollVerifier = await runPollVerifier(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Poll Verifier failed:`, err);
    pollVerifier = { analyzed: 0, anomalies: 0, flagged: 0, removed: 0, errors: 1 };
  }

  // ─── Job 3: News Curation ─────────────────────────────────
  console.log(`[CONDOR Brain] Job 3/5: News Curation`);
  let curation: NewsCuratorResult;
  try {
    curation = await runNewsCurator(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] News Curation failed:`, err);
    curation = { reviewed: 0, set_breaking: 0, deactivated: 0, top_stories: [], errors: 1 };
  }

  // ─── Job 4: Briefing Generator ────────────────────────────
  console.log(`[CONDOR Brain] Job 4/5: Briefing Generator`);
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

  // ─── Job 5: Health Monitor ────────────────────────────────
  console.log(`[CONDOR Brain] Job 5/5: Health Monitor`);
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

  const duration_ms = Date.now() - startTime;

  console.log(`\n[CONDOR Brain] Run ${runId} completed in ${duration_ms}ms`);
  console.log(`  Data Integrity:  ${integrity.checked} checked, ${integrity.updated} updated, ${integrity.flagged} flagged`);
  console.log(`  Poll Verifier:   ${pollVerifier.analyzed} analyzed, ${pollVerifier.anomalies} anomalies, ${pollVerifier.flagged} flagged`);
  console.log(`  News Curation:   ${curation.reviewed} reviewed, ${curation.set_breaking} breaking, ${curation.deactivated} deactivated`);
  console.log(`  Briefing:        ${briefing.skipped ? "skipped (already exists)" : briefing.briefing_id ? "created" : "failed"}`);
  console.log(`  Health:          ${health.status} (${health.alerts.length} alerts)`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    runId,
    country: countryCode,
    integrity,
    pollVerifier,
    curation,
    briefing,
    health,
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
        pollVerifier: { analyzed: 0, anomalies: 0, flagged: 0, removed: 0, errors: 1 },
        curation: { reviewed: 0, set_breaking: 0, deactivated: 0, top_stories: [], errors: 1 },
        briefing: { briefing_id: null, editorial_summary: "", skipped: false, errors: 1 },
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
