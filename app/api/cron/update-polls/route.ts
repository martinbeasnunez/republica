import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";
import { runPollUpdater } from "@/lib/brain/jobs/poll-updater";

/**
 * CRON: /api/cron/update-polls
 *
 * Dedicated cron for keeping poll data fresh from official sources.
 * Runs twice a week (Mon & Thu at 12:20 UTC), as a backup to the
 * daily brain run.
 *
 * Strategy: delegates to runPollUpdater, which deterministically
 * parses Wikipedia anexo tables (no AI) and validates every row
 * through a strict gauntlet before upsert. Rejected rows are logged
 * to brain_actions for /admin/brain review.
 *
 * Supports ?country=pe or ?country=co to run for a specific country.
 * Defaults to running for ALL countries.
 */

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Country param ───────────────────────────────────────
  const countryParam = request.nextUrl.searchParams.get("country") as CountryCode | null;
  const countries = countryParam && COUNTRY_CODES.includes(countryParam)
    ? [countryParam]
    : COUNTRY_CODES;

  const supabase = getSupabase();
  const runId = `cron-update-polls-${Date.now()}`;
  const allStats: Record<string, object> = {};

  for (const countryCode of countries) {
    const start = Date.now();
    try {
      const stats = await runPollUpdater(supabase, countryCode, runId);
      allStats[countryCode] = { ...stats, duration_ms: Date.now() - start };
    } catch (err) {
      allStats[countryCode] = {
        error: err instanceof Error ? err.message : String(err),
        duration_ms: Date.now() - start,
      };
    }
  }

  return NextResponse.json({ success: true, stats: allStats });
}
