import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";
import { runBrainAll } from "@/lib/brain";

/**
 * CRON: CONDOR Brain — Autonomous Editorial Intelligence
 *
 * Runs 3 times daily (6am, 2pm, 10pm UTC = 1am, 9am, 5pm Peru/Colombia time).
 *
 * Three jobs execute in sequence:
 * 1. Data Integrity — verify candidate data against recent news
 * 2. News Curator — score articles by electoral impact, set breaking flags
 * 3. Briefing Generator — create daily editorial summary
 *
 * All actions are logged to brain_actions table for full audit trail.
 *
 * Supports ?country=pe or ?country=co to run for a specific country.
 * Defaults to running for ALL countries.
 *
 * Auth: Bearer CRON_SECRET
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
  const countryCode = countryParam && COUNTRY_CODES.includes(countryParam)
    ? countryParam
    : undefined;

  try {
    const result = await runBrainAll(countryCode);

    return NextResponse.json({
      success: result.success,
      runs: result.runs,
      total_duration_ms: result.total_duration_ms,
    });
  } catch (error) {
    console.error("[CONDOR Brain] Cron handler error:", error);
    return NextResponse.json(
      { error: "Brain execution failed", details: String(error) },
      { status: 500 }
    );
  }
}
