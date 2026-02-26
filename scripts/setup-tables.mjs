#!/usr/bin/env node
/**
 * Creates content management tables in Supabase.
 * Uses the Supabase Management API (requires project ref + service role key).
 *
 * Usage: node scripts/setup-tables.mjs
 */

const SUPABASE_URL = "https://tptxqvamyjhbpdphpouf.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_uy_jMiH51GMBK_69eTMJGw_iKAx-2pQ";
const PROJECT_REF = "tptxqvamyjhbpdphpouf";

// We'll use the pg-meta API or direct REST approach
// Actually, easiest: create an RPC function first, then use it

const statements = [
  // 1. Candidates table
  `CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    party TEXT NOT NULL,
    party_slug TEXT NOT NULL,
    party_color TEXT NOT NULL,
    photo TEXT NOT NULL,
    age INTEGER NOT NULL,
    profession TEXT NOT NULL,
    region TEXT NOT NULL,
    ideology TEXT NOT NULL,
    bio TEXT NOT NULL,
    poll_average REAL NOT NULL DEFAULT 0,
    poll_trend TEXT NOT NULL DEFAULT 'stable',
    has_legal_issues BOOLEAN NOT NULL DEFAULT false,
    legal_note TEXT,
    key_proposals JSONB NOT NULL DEFAULT '[]',
    social_media JSONB NOT NULL DEFAULT '{}',
    quiz_positions JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 2. Poll data points
  `CREATE TABLE IF NOT EXISTS poll_data_points (
    id SERIAL PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    value REAL NOT NULL,
    pollster TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 3. News articles
  `CREATE TABLE IF NOT EXISTS news_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    published_at TEXT NOT NULL,
    category TEXT NOT NULL,
    fact_check TEXT,
    candidates_mentioned TEXT[] DEFAULT '{}',
    image_url TEXT,
    is_breaking BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 4. RLS
  `ALTER TABLE candidates ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE poll_data_points ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY`,

  // 5. RLS Policies (use DO block to check if exists)
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read candidates') THEN
      CREATE POLICY "Public read candidates" ON candidates FOR SELECT USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read polls') THEN
      CREATE POLICY "Public read polls" ON poll_data_points FOR SELECT USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read news') THEN
      CREATE POLICY "Public read news" ON news_articles FOR SELECT USING (true);
    END IF;
  END $$`,

  // 6. Indexes
  `CREATE INDEX IF NOT EXISTS idx_candidates_active ON candidates(is_active, poll_average DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_candidates_slug ON candidates(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_poll_data_candidate ON poll_data_points(candidate_id)`,
  `CREATE INDEX IF NOT EXISTS idx_news_active ON news_articles(is_active, created_at DESC)`,
];

async function executeSQL(sql) {
  // Use the Supabase pg REST endpoint through a workaround:
  // Create a temporary function, execute it, drop it
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  return res;
}

// Alternative approach: use the Supabase JS client from @supabase/supabase-js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log("🔧 Creating content management tables...\n");

  // Try to check if tables already exist
  const { data: existingCandidates, error: checkError } = await supabase
    .from("candidates")
    .select("id")
    .limit(1);

  if (!checkError) {
    console.log("✅ Tables already exist! Candidates table has data:", existingCandidates?.length > 0);

    const { data: existingNews } = await supabase.from("news_articles").select("id").limit(1);
    console.log("✅ News articles table exists, has data:", existingNews?.length > 0);

    const { data: existingPolls } = await supabase.from("poll_data_points").select("id").limit(1);
    console.log("✅ Poll data points table exists, has data:", existingPolls?.length > 0);

    console.log("\n📋 Tables are ready. Run seed script to populate data.");
    return;
  }

  // If tables don't exist, we need to create them via SQL Editor
  // Unfortunately Supabase JS client can't run DDL statements
  console.log("❌ Tables don't exist yet.");
  console.log("\n📋 Please run the following SQL in Supabase Dashboard > SQL Editor:");
  console.log("   File: scripts/create-tables.sql");
  console.log("\n   Or copy from below:\n");
  console.log("─".repeat(60));

  const fs = await import("fs");
  const sql = fs.readFileSync(new URL("./create-tables.sql", import.meta.url), "utf8");
  console.log(sql);
  console.log("─".repeat(60));
}

main().catch(console.error);
