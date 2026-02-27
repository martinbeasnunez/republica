/**
 * Shared poll utilities — weighted recency average, source detection, MoE, pollster colors.
 */

// ─── Constants ───

/** Default margin of error for LatAm polls (1,200-1,500 sample, 95% CI) */
export const DEFAULT_MOE = 2.5;

/** Recency weight tiers (Split Ticket model) */
const RECENCY_WEIGHTS = [
  { maxDays: 7, weight: 0.5 },
  { maxDays: 14, weight: 0.3 },
  { maxDays: 30, weight: 0.2 },
] as const;

/** Consistent pollster colors across all charts */
export const POLLSTER_COLORS: Record<string, Record<string, string>> = {
  pe: {
    Ipsos: "#6366f1",
    CPI: "#f59e0b",
    Datum: "#10b981",
    IEP: "#ec4899",
    "Vox Populi": "#8b5cf6",
    GfK: "#f97316",
  },
  co: {
    Invamer: "#6366f1",
    Guarumo: "#ec4899",
    CELAG: "#10b981",
    GAD3: "#f59e0b",
    Datexco: "#f97316",
    CNC: "#8b5cf6",
    "Cifras y Conceptos": "#14b8a6",
    YanHaas: "#a78bfa",
  },
};

/** Pollster metadata for inline ficha técnica */
export const POLLSTER_META: Record<
  string,
  Record<string, { reliability: number; methodology: string; sampleSize: string }>
> = {
  pe: {
    Ipsos: { reliability: 92, methodology: "Presencial + telefónica", sampleSize: "1,500" },
    CPI: { reliability: 88, methodology: "Presencial", sampleSize: "1,200" },
    Datum: { reliability: 90, methodology: "Presencial + online", sampleSize: "1,400" },
    IEP: { reliability: 91, methodology: "Presencial + telefónica", sampleSize: "1,300" },
  },
  co: {
    Invamer: { reliability: 91, methodology: "Presencial + telefónica", sampleSize: "1,600" },
    Guarumo: { reliability: 87, methodology: "Presencial", sampleSize: "4,245" },
    CELAG: { reliability: 85, methodology: "Presencial + telefónica", sampleSize: "1,200" },
    GAD3: { reliability: 88, methodology: "Telefónica", sampleSize: "2,108" },
    Datexco: { reliability: 89, methodology: "Presencial + telefónica", sampleSize: "1,400" },
    CNC: { reliability: 88, methodology: "Telefónica + online", sampleSize: "1,100" },
    "Cifras y Conceptos": { reliability: 90, methodology: "Presencial + online", sampleSize: "1,200" },
    YanHaas: { reliability: 86, methodology: "Presencial + telefónica", sampleSize: "1,300" },
  },
};

// ─── Types ───

export interface SourceInfo {
  isSingleSource: boolean;
  sourceName: string | null;
  sourceCount: number;
  pollsterNames: string[];
}

interface PollRow {
  date: string;
  value: number;
  pollster: string;
}

// ─── Recency-Weighted Average ───

function daysBetween(dateStr: string, now: Date): number {
  const d = new Date(dateStr + "T12:00:00");
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function getRecencyWeight(daysSince: number): number {
  for (const tier of RECENCY_WEIGHTS) {
    if (daysSince <= tier.maxDays) return tier.weight;
  }
  return 0; // >30 days: excluded
}

/**
 * Recalculate poll_average and poll_trend for a candidate using
 * recency-weighted average (Split Ticket model).
 *
 * - Polls from last 7 days: 50% weight
 * - Polls from 8-14 days: 30% weight
 * - Polls from 15-30 days: 20% weight
 * - Polls older than 30 days: excluded
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recalculatePollStats(supabase: any, candidateId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

  // Fetch all polls from the last 30 days
  const { data: recentPolls, error: fetchError } = await supabase
    .from("poll_data_points")
    .select("date, value, pollster")
    .eq("candidate_id", candidateId)
    .gte("date", cutoffDate)
    .order("date", { ascending: false });

  if (fetchError) throw fetchError;

  // Fallback: if no recent polls, try last 3 regardless of date (backwards compat)
  if (!recentPolls || recentPolls.length === 0) {
    const { data: fallbackPolls, error: fbError } = await supabase
      .from("poll_data_points")
      .select("value")
      .eq("candidate_id", candidateId)
      .order("date", { ascending: false })
      .limit(3);

    if (fbError) throw fbError;
    if (!fallbackPolls || fallbackPolls.length === 0) return;

    // Simple average as fallback
    const poll_average =
      fallbackPolls.reduce((sum: number, p: { value: number }) => sum + p.value, 0) /
      fallbackPolls.length;

    await supabase
      .from("candidates")
      .update({
        poll_average: Math.round(poll_average * 100) / 100,
        poll_trend: "stable",
      })
      .eq("id", candidateId);
    return;
  }

  // Calculate weighted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const poll of recentPolls as PollRow[]) {
    const days = daysBetween(poll.date, now);
    const weight = getRecencyWeight(days);
    if (weight > 0) {
      weightedSum += poll.value * weight;
      totalWeight += weight;
    }
  }

  const poll_average = totalWeight > 0 ? weightedSum / totalWeight : (recentPolls as PollRow[])[0].value;

  // Trend: compare last 7 days avg vs 8-14 days avg
  const lastWeekPolls = (recentPolls as PollRow[]).filter((p) => daysBetween(p.date, now) <= 7);
  const prevWeekPolls = (recentPolls as PollRow[]).filter((p) => {
    const d = daysBetween(p.date, now);
    return d > 7 && d <= 14;
  });

  let poll_trend: "up" | "down" | "stable" = "stable";
  if (lastWeekPolls.length > 0 && prevWeekPolls.length > 0) {
    const lastWeekAvg = lastWeekPolls.reduce((s, p) => s + p.value, 0) / lastWeekPolls.length;
    const prevWeekAvg = prevWeekPolls.reduce((s, p) => s + p.value, 0) / prevWeekPolls.length;
    if (lastWeekAvg > prevWeekAvg + 0.5) poll_trend = "up";
    else if (lastWeekAvg < prevWeekAvg - 0.5) poll_trend = "down";
  } else if (lastWeekPolls.length >= 2) {
    // Fallback: compare two most recent polls
    const latest = lastWeekPolls[0].value;
    const second = lastWeekPolls[1].value;
    if (latest > second) poll_trend = "up";
    else if (latest < second) poll_trend = "down";
  }

  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      poll_average: Math.round(poll_average * 100) / 100,
      poll_trend,
    })
    .eq("id", candidateId);

  if (updateError) throw updateError;
}

// ─── Source Info (for components) ───

/**
 * Analyze poll history to detect single-source vs multi-source.
 * Checks polls from the last 30 days.
 */
export function getSourceInfo(
  pollHistory: { date: string; pollster: string }[]
): SourceInfo {
  const now = new Date();
  const recent = pollHistory.filter((p) => daysBetween(p.date, now) <= 30);
  const pollsters = [...new Set(recent.map((p) => p.pollster))];

  // Clean up estimated pollster names (e.g., "Ipsos (estimado)" → "Ipsos")
  const cleanPollsters = [...new Set(pollsters.map((p) => p.replace(/\s*\(estimado\)/i, "")))];

  return {
    isSingleSource: cleanPollsters.length <= 1,
    sourceName: cleanPollsters.length === 1 ? cleanPollsters[0] : null,
    sourceCount: cleanPollsters.length,
    pollsterNames: cleanPollsters,
  };
}

/**
 * Get pollster color, with fallback for unknown pollsters.
 */
export function getPollsterColor(pollster: string, countryCode: string): string {
  const cleaned = pollster.replace(/\s*\(estimado\)/i, "");
  const colors = POLLSTER_COLORS[countryCode] || POLLSTER_COLORS.pe;
  return colors[cleaned] || "#94a3b8";
}
