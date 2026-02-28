import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Setup endpoint for candidate_profiles table.
 *
 * GET  — Check if table exists
 * POST — Create table via RPC (or return SQL for manual creation)
 *
 * Auth: Bearer CRON_SECRET
 */

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("id")
    .limit(1);

  return NextResponse.json({
    candidate_profiles: error
      ? { exists: false, error: error.message }
      : { exists: true, rows: data?.length ?? 0 },
    setup_needed: !!error,
    sql: error ? getCreateSQL() : undefined,
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: getCreateSQL(),
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        manual_sql: getCreateSQL(),
        message:
          "Could not create table via RPC. Use the SQL below in the Supabase SQL editor.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "candidate_profiles table created successfully.",
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: "RPC not available.",
      manual_sql: getCreateSQL(),
      message:
        "RPC not available. Create the table manually with the SQL below.",
    });
  }
}

function getCreateSQL(): string {
  return `
-- CONDOR: Candidate Profiles (verified public data)
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id text NOT NULL UNIQUE,
  country_code text NOT NULL,

  -- Verified profile data
  biography text,
  education jsonb DEFAULT '[]',
  career jsonb DEFAULT '[]',
  controversies jsonb DEFAULT '[]',
  legal_summary text,
  party_history jsonb DEFAULT '[]',
  previous_candidacies integer DEFAULT 0,
  years_in_politics integer DEFAULT 0,

  -- Metadata
  sources jsonb DEFAULT '[]',
  confidence real DEFAULT 0,
  last_researched_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_candidate ON candidate_profiles(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_country ON candidate_profiles(country_code);

-- Enable RLS (read-only public access)
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_profiles_read" ON candidate_profiles FOR SELECT USING (true);
`.trim();
}
