import { getSupabase } from "@/lib/supabase";
import { BrainClient } from "./brain-client";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

export const dynamic = "force-dynamic";

// =============================================================================
// TYPES
// =============================================================================

interface BrainAction {
  id: string;
  run_id: string;
  job: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  confidence: number | null;
  country_code: string;
  created_at: string;
}

interface BrainBriefing {
  id: string;
  run_id: string;
  country_code: string;
  briefing_date: string;
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
  poll_movements: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: string;
  }> | null;
  new_fact_checks: Array<{
    claim: string;
    verdict: string;
  }> | null;
  editorial_summary: string;
  data_issues: Array<{
    candidate: string;
    field: string;
    issue: string;
  }> | null;
  health_status: {
    last_scrape_ok: boolean;
    last_verify_ok: boolean;
    data_quality_score: number;
  } | null;
  created_at: string;
}

export interface BrainData {
  countryName: string;
  countryEmoji: string;
  countryCode: string;
  // Recent actions
  actions: BrainAction[];
  totalActions: number;
  // Recent briefings
  briefings: BrainBriefing[];
  // Stats
  stats: {
    totalRuns: number;
    totalUpdates: number;
    totalFlags: number;
    totalBreaking: number;
    totalDeactivated: number;
    totalBriefings: number;
    lastRunTime: string | null;
    actionsToday: number;
  };
  // Actions by job
  actionsByJob: Record<string, number>;
  // Actions by type
  actionsByType: Record<string, number>;
  // Recent runs
  recentRuns: Array<{
    runId: string;
    actionsCount: number;
    createdAt: string;
  }>;
}

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getBrainData(country: CountryCode): Promise<BrainData> {
  const supabase = getSupabase();
  const config = COUNTRIES[country];

  // Timezone offset for Peru/Colombia (UTC-5)
  const TZ_OFFSET = -5 * 60 * 60 * 1000;
  const now = new Date();
  const localNow = new Date(now.getTime() + TZ_OFFSET);
  const todayStart = new Date(
    Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()) - TZ_OFFSET
  ).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Fetch recent actions (last 7 days, max 100)
  const { data: actionsRaw } = await supabase
    .from("brain_actions")
    .select("*")
    .eq("country_code", country)
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false })
    .limit(100);

  const actions = (actionsRaw || []) as BrainAction[];

  // ── Total actions count
  const { count: totalActions } = await supabase
    .from("brain_actions")
    .select("id", { count: "exact", head: true })
    .eq("country_code", country);

  // ── Actions today
  const actionsToday = actions.filter((a) => a.created_at >= todayStart).length;

  // ── Fetch recent briefings (last 7)
  const { data: briefingsRaw } = await supabase
    .from("brain_briefings")
    .select("*")
    .eq("country_code", country)
    .order("briefing_date", { ascending: false })
    .limit(7);

  const briefings = (briefingsRaw || []) as BrainBriefing[];

  // ── Stats
  const totalUpdates = actions.filter((a) => a.action_type === "update").length;
  const totalFlags = actions.filter((a) => a.action_type === "flag").length;
  const totalBreaking = actions.filter((a) => a.action_type === "set_breaking").length;
  const totalDeactivated = actions.filter((a) => a.action_type === "deactivate").length;

  const uniqueRuns = [...new Set(actions.map((a) => a.run_id))];
  const lastRunTime = actions.length > 0 ? actions[0].created_at : null;

  // ── Actions by job
  const actionsByJob: Record<string, number> = {};
  for (const a of actions) {
    actionsByJob[a.job] = (actionsByJob[a.job] || 0) + 1;
  }

  // ── Actions by type
  const actionsByType: Record<string, number> = {};
  for (const a of actions) {
    actionsByType[a.action_type] = (actionsByType[a.action_type] || 0) + 1;
  }

  // ── Recent runs
  const recentRuns = uniqueRuns.slice(0, 10).map((runId) => {
    const runActions = actions.filter((a) => a.run_id === runId);
    return {
      runId,
      actionsCount: runActions.length,
      createdAt: runActions[0]?.created_at || "",
    };
  });

  return {
    countryName: config.name,
    countryEmoji: config.emoji,
    countryCode: country,
    actions,
    totalActions: totalActions || 0,
    briefings,
    stats: {
      totalRuns: uniqueRuns.length,
      totalUpdates,
      totalFlags,
      totalBreaking,
      totalDeactivated,
      totalBriefings: briefings.length,
      lastRunTime,
      actionsToday,
    },
    actionsByJob,
    actionsByType,
    recentRuns,
  };
}

// =============================================================================
// PAGE
// =============================================================================

export default async function AdminBrainPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: countryParam } = await searchParams;
  const country = (countryParam === "co" ? "co" : "pe") as CountryCode;

  let data: BrainData;
  try {
    data = await getBrainData(country);
  } catch (err) {
    console.error("[admin/brain] Error fetching data:", err);
    data = {
      countryName: COUNTRIES[country].name,
      countryEmoji: COUNTRIES[country].emoji,
      countryCode: country,
      actions: [],
      totalActions: 0,
      briefings: [],
      stats: {
        totalRuns: 0,
        totalUpdates: 0,
        totalFlags: 0,
        totalBreaking: 0,
        totalDeactivated: 0,
        totalBriefings: 0,
        lastRunTime: null,
        actionsToday: 0,
      },
      actionsByJob: {},
      actionsByType: {},
      recentRuns: [],
    };
  }

  return <BrainClient data={data} />;
}
