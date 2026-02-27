import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Setup endpoint for Feedback tables.
 *
 * GET  — Check if feedback table exists
 * POST — Create feedback_submissions table
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

  const { error: feedbackCheck } = await supabase
    .from("feedback_submissions")
    .select("id")
    .limit(1);

  return NextResponse.json({
    feedback_submissions: feedbackCheck
      ? { exists: false, error: feedbackCheck.message }
      : { exists: true },
    setup_needed: !!feedbackCheck,
    sql: feedbackCheck ? getCreateSQL() : undefined,
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
      sql: `
        CREATE TABLE IF NOT EXISTS feedback_submissions (
          id text PRIMARY KEY,
          country_code text NOT NULL,
          conversation jsonb NOT NULL,
          raw_feedback text NOT NULL,
          suggestions jsonb NOT NULL DEFAULT '[]',
          category text,
          status text NOT NULL DEFAULT 'pending',
          admin_notes text,
          created_at timestamptz DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_submissions(status);
        CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_feedback_country ON feedback_submissions(country_code);
      `,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        manual_sql: getCreateSQL(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "feedback_submissions table created successfully.",
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: "RPC not available. Create table manually with SQL below.",
      manual_sql: getCreateSQL(),
    });
  }
}

function getCreateSQL(): string {
  return `
-- CONDOR Feedback: User Submissions
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id text PRIMARY KEY,
  country_code text NOT NULL,
  conversation jsonb NOT NULL,
  raw_feedback text NOT NULL,
  suggestions jsonb NOT NULL DEFAULT '[]',
  category text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_country ON feedback_submissions(country_code);

-- Enable RLS (read via service role only, not public)
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
`.trim();
}
