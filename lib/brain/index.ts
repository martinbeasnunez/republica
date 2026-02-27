import { getSupabase } from "@/lib/supabase";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";
import { runDataIntegrity, type DataIntegrityResult } from "./jobs/data-integrity";
import { runNewsCurator, type NewsCuratorResult } from "./jobs/news-curator";
import { runBriefingGenerator, type BriefingGeneratorResult } from "./jobs/briefing-generator";

// =============================================================================
// TYPES
// =============================================================================

export interface BrainRunResult {
  runId: string;
  country: string;
  integrity: DataIntegrityResult;
  curation: NewsCuratorResult;
  briefing: BriefingGeneratorResult;
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
 * Executes 3 jobs in sequence:
 * 1. Data Integrity — verify candidate data against news
 * 2. News Curator — score and prioritize articles
 * 3. Briefing Generator — create daily editorial summary
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
  console.log(`[CONDOR Brain] Job 1/3: Data Integrity`);
  let integrity: DataIntegrityResult;
  try {
    integrity = await runDataIntegrity(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] Data Integrity failed:`, err);
    integrity = { checked: 0, updated: 0, flagged: 0, errors: 1 };
  }

  // ─── Job 2: News Curation ─────────────────────────────────
  console.log(`[CONDOR Brain] Job 2/3: News Curation`);
  let curation: NewsCuratorResult;
  try {
    curation = await runNewsCurator(supabase, countryCode, runId);
  } catch (err) {
    console.error(`[CONDOR Brain] News Curation failed:`, err);
    curation = { reviewed: 0, set_breaking: 0, deactivated: 0, top_stories: [], errors: 1 };
  }

  // ─── Job 3: Briefing Generator ────────────────────────────
  console.log(`[CONDOR Brain] Job 3/3: Briefing Generator`);
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

  const duration_ms = Date.now() - startTime;

  console.log(`\n[CONDOR Brain] Run ${runId} completed in ${duration_ms}ms`);
  console.log(`  Data Integrity: ${integrity.checked} checked, ${integrity.updated} updated, ${integrity.flagged} flagged`);
  console.log(`  News Curation:  ${curation.reviewed} reviewed, ${curation.set_breaking} breaking, ${curation.deactivated} deactivated`);
  console.log(`  Briefing:       ${briefing.skipped ? "skipped (already exists)" : briefing.briefing_id ? "created" : "failed"}`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    runId,
    country: countryCode,
    integrity,
    curation,
    briefing,
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
        curation: { reviewed: 0, set_breaking: 0, deactivated: 0, top_stories: [], errors: 1 },
        briefing: { briefing_id: null, editorial_summary: "", skipped: false, errors: 1 },
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
