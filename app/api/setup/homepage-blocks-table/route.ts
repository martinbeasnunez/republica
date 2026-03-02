import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Setup endpoint for homepage_blocks table.
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
    .from("homepage_blocks")
    .select("id")
    .limit(1);

  return NextResponse.json({
    homepage_blocks: error
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
      message: "homepage_blocks table created successfully.",
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
-- CONDOR: Homepage Blocks (AI-curated dynamic homepage content)
CREATE TABLE IF NOT EXISTS homepage_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL,
  run_id text NOT NULL,
  block_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  subtitle text,
  content jsonb NOT NULL DEFAULT '{}',
  click_count integer NOT NULL DEFAULT 0,
  impression_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  deactivated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_hb_country_active ON homepage_blocks(country_code, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hb_expires ON homepage_blocks(expires_at);

ALTER TABLE homepage_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "homepage_blocks_read" ON homepage_blocks FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION increment_block_click(block_id uuid)
RETURNS void AS $$
  UPDATE homepage_blocks SET click_count = click_count + 1 WHERE id = block_id AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER;
`.trim();
}
