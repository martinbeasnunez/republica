import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Setup endpoint for CONDOR Brain tables.
 *
 * GET  — Check if brain tables exist
 * POST — Create brain tables (brain_actions, brain_briefings)
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

  // Check if tables exist
  const { error: actionsCheck } = await supabase
    .from("brain_actions")
    .select("id")
    .limit(1);

  const { error: briefingsCheck } = await supabase
    .from("brain_briefings")
    .select("id")
    .limit(1);

  return NextResponse.json({
    brain_actions: actionsCheck ? { exists: false, error: actionsCheck.message } : { exists: true },
    brain_briefings: briefingsCheck ? { exists: false, error: briefingsCheck.message } : { exists: true },
    setup_needed: !!(actionsCheck || briefingsCheck),
    sql: actionsCheck || briefingsCheck ? getCreateSQL() : undefined,
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const results: Record<string, { success: boolean; error?: string }> = {};

  // Create brain_actions table
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS brain_actions (
          id text PRIMARY KEY,
          run_id text NOT NULL,
          job text NOT NULL,
          action_type text NOT NULL,
          entity_type text NOT NULL,
          entity_id text,
          description text NOT NULL,
          before_value jsonb,
          after_value jsonb,
          confidence float,
          country_code text NOT NULL,
          created_at timestamptz DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_brain_actions_run ON brain_actions(run_id);
        CREATE INDEX IF NOT EXISTS idx_brain_actions_created ON brain_actions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_brain_actions_country ON brain_actions(country_code);
      `,
    });

    if (error) {
      results.brain_actions = { success: false, error: error.message };
    } else {
      results.brain_actions = { success: true };
    }
  } catch (err) {
    results.brain_actions = {
      success: false,
      error: `RPC not available. Create tables manually with SQL below.`,
    };
  }

  // Create brain_briefings table
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS brain_briefings (
          id text PRIMARY KEY,
          run_id text NOT NULL,
          country_code text NOT NULL,
          briefing_date date NOT NULL,
          top_stories jsonb NOT NULL,
          poll_movements jsonb,
          new_fact_checks jsonb,
          editorial_summary text NOT NULL,
          data_issues jsonb,
          health_status jsonb,
          created_at timestamptz DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_brain_briefings_date ON brain_briefings(briefing_date DESC);
        CREATE INDEX IF NOT EXISTS idx_brain_briefings_country ON brain_briefings(country_code);
      `,
    });

    if (error) {
      results.brain_briefings = { success: false, error: error.message };
    } else {
      results.brain_briefings = { success: true };
    }
  } catch (err) {
    results.brain_briefings = {
      success: false,
      error: `RPC not available. Create tables manually with SQL below.`,
    };
  }

  // If RPC failed, provide SQL for manual creation
  const anyFailed = Object.values(results).some((r) => !r.success);

  return NextResponse.json({
    results,
    manual_sql: anyFailed ? getCreateSQL() : undefined,
    message: anyFailed
      ? "Some tables could not be created via RPC. Use the SQL below in the Supabase SQL editor."
      : "All tables created successfully.",
  });
}

function getCreateSQL(): string {
  return `
-- CONDOR Brain: Audit Trail
CREATE TABLE IF NOT EXISTS brain_actions (
  id text PRIMARY KEY,
  run_id text NOT NULL,
  job text NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  description text NOT NULL,
  before_value jsonb,
  after_value jsonb,
  confidence float,
  country_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_actions_run ON brain_actions(run_id);
CREATE INDEX IF NOT EXISTS idx_brain_actions_created ON brain_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_actions_country ON brain_actions(country_code);

-- Enable RLS (read-only public access for transparency)
ALTER TABLE brain_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brain_actions_read" ON brain_actions FOR SELECT USING (true);

-- CONDOR Brain: Daily Briefings
CREATE TABLE IF NOT EXISTS brain_briefings (
  id text PRIMARY KEY,
  run_id text NOT NULL,
  country_code text NOT NULL,
  briefing_date date NOT NULL,
  top_stories jsonb NOT NULL,
  poll_movements jsonb,
  new_fact_checks jsonb,
  editorial_summary text NOT NULL,
  data_issues jsonb,
  health_status jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_briefings_date ON brain_briefings(briefing_date DESC);
CREATE INDEX IF NOT EXISTS idx_brain_briefings_country ON brain_briefings(country_code);

-- Enable RLS (read-only public access for transparency)
ALTER TABLE brain_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brain_briefings_read" ON brain_briefings FOR SELECT USING (true);
`.trim();
}
