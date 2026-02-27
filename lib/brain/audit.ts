import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

export type ActionType = "update" | "create" | "deactivate" | "flag" | "set_breaking";
export type EntityType = "candidate" | "article" | "fact_check" | "poll" | "briefing";
export type JobName = "data-integrity" | "news-curator" | "briefing-generator";

export interface BrainAction {
  run_id: string;
  job: JobName;
  action_type: ActionType;
  entity_type: EntityType;
  entity_id?: string;
  description: string;
  before_value?: Record<string, unknown>;
  after_value?: Record<string, unknown>;
  confidence?: number;
  country_code: string;
}

export interface BrainBriefing {
  run_id: string;
  country_code: string;
  briefing_date: string; // YYYY-MM-DD
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
  poll_movements?: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: "up" | "down" | "stable";
  }>;
  new_fact_checks?: Array<{
    claim: string;
    verdict: string;
  }>;
  editorial_summary: string;
  data_issues?: Array<{
    candidate: string;
    field: string;
    issue: string;
  }>;
  health_status?: {
    last_scrape_ok: boolean;
    last_verify_ok: boolean;
    data_quality_score: number;
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function generateActionId(): string {
  return `ba-${randomUUID().slice(0, 8)}`;
}

function generateBriefingId(): string {
  return `bb-${randomUUID().slice(0, 8)}`;
}

// =============================================================================
// AUDIT FUNCTIONS
// =============================================================================

/**
 * Log a single brain action to the audit trail.
 * Every autonomous action gets recorded with before/after snapshots.
 */
export async function logAction(
  supabase: SupabaseClient,
  action: BrainAction
): Promise<string | null> {
  const id = generateActionId();

  try {
    const { error } = await supabase.from("brain_actions").insert({
      id,
      run_id: action.run_id,
      job: action.job,
      action_type: action.action_type,
      entity_type: action.entity_type,
      entity_id: action.entity_id || null,
      description: action.description,
      before_value: action.before_value || null,
      after_value: action.after_value || null,
      confidence: action.confidence || null,
      country_code: action.country_code,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`[brain-audit] Failed to log action:`, error);
      return null;
    }

    console.log(
      `[brain-audit] [${action.job}] ${action.action_type} ${action.entity_type} ${action.entity_id || ""}: ${action.description}`
    );
    return id;
  } catch (err) {
    console.error(`[brain-audit] Error logging action:`, err);
    return null;
  }
}

/**
 * Log a daily editorial briefing.
 * One briefing per country per day (idempotent).
 */
export async function logBriefing(
  supabase: SupabaseClient,
  briefing: BrainBriefing
): Promise<string | null> {
  const id = generateBriefingId();

  try {
    // Check if briefing already exists for today
    const { data: existing } = await supabase
      .from("brain_briefings")
      .select("id")
      .eq("country_code", briefing.country_code)
      .eq("briefing_date", briefing.briefing_date)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(
        `[brain-audit] Briefing already exists for ${briefing.country_code} on ${briefing.briefing_date}, skipping`
      );
      return existing[0].id;
    }

    const { error } = await supabase.from("brain_briefings").insert({
      id,
      run_id: briefing.run_id,
      country_code: briefing.country_code,
      briefing_date: briefing.briefing_date,
      top_stories: briefing.top_stories,
      poll_movements: briefing.poll_movements || null,
      new_fact_checks: briefing.new_fact_checks || null,
      editorial_summary: briefing.editorial_summary,
      data_issues: briefing.data_issues || null,
      health_status: briefing.health_status || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`[brain-audit] Failed to log briefing:`, error);
      return null;
    }

    console.log(
      `[brain-audit] Briefing ${id} saved for ${briefing.country_code} on ${briefing.briefing_date}`
    );
    return id;
  } catch (err) {
    console.error(`[brain-audit] Error logging briefing:`, err);
    return null;
  }
}

/**
 * Batch-log multiple actions at once for efficiency.
 */
export async function logActions(
  supabase: SupabaseClient,
  actions: BrainAction[]
): Promise<number> {
  if (actions.length === 0) return 0;

  const rows = actions.map((action) => ({
    id: generateActionId(),
    run_id: action.run_id,
    job: action.job,
    action_type: action.action_type,
    entity_type: action.entity_type,
    entity_id: action.entity_id || null,
    description: action.description,
    before_value: action.before_value || null,
    after_value: action.after_value || null,
    confidence: action.confidence || null,
    country_code: action.country_code,
    created_at: new Date().toISOString(),
  }));

  try {
    const { error } = await supabase.from("brain_actions").insert(rows);

    if (error) {
      console.error(`[brain-audit] Failed to batch-log actions:`, error);
      return 0;
    }

    console.log(`[brain-audit] Batch-logged ${rows.length} actions`);
    return rows.length;
  } catch (err) {
    console.error(`[brain-audit] Error batch-logging actions:`, err);
    return 0;
  }
}
