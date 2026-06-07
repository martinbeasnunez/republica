// =============================================================================
// CONDOR — Public pulse feed
// =============================================================================
// GET /api/pulse?country=co&limit=12  → últimos pulses ordenados desc.
// Lo consume <CondorAIPulse /> tanto en server (initial) como en client (poll).
// =============================================================================

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") ?? "co").toLowerCase();
  const limitParam = parseInt(searchParams.get("limit") ?? "12", 10);
  const limit = Math.min(Math.max(1, Number.isFinite(limitParam) ? limitParam : 12), 50);

  if (!["co", "pe"].includes(country)) {
    return NextResponse.json({ error: "invalid country" }, { status: 400 });
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("pulse_updates")
      .select("id, generated_at, summary, metrics, phase")
      .eq("country_code", country)
      .order("generated_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message, pulses: [] }, { status: 500 });
    }

    return NextResponse.json(
      { country, pulses: data ?? [] },
      {
        headers: {
          // Browser cache 20s — client polls every 30s anyway
          "Cache-Control": "public, s-maxage=20, max-age=20, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err), pulses: [] }, { status: 500 });
  }
}
