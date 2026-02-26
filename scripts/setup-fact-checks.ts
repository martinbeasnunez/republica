/**
 * Setup script: Creates the fact_checks table in Supabase
 *
 * Run this SQL in Supabase Dashboard > SQL Editor:
 * Or run: npx supabase db execute < scripts/create-fact-checks-table.sql
 *
 * This script verifies the table exists and optionally seeds it.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  // Test if table exists
  const { error } = await supabase.from("fact_checks").select("id").limit(1);

  if (error) {
    console.error("❌ Table 'fact_checks' does not exist.");
    console.log("\n📋 Run this SQL in Supabase Dashboard > SQL Editor:\n");
    console.log(`
CREATE TABLE IF NOT EXISTS fact_checks (
  id TEXT PRIMARY KEY,
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('VERDADERO', 'PARCIALMENTE_VERDADERO', 'ENGANOSO', 'FALSO')),
  explanation TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',
  source_urls TEXT[] DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0,
  context TEXT DEFAULT '',
  claimant TEXT DEFAULT 'Desconocido',
  claim_origin TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fact_checks" ON fact_checks FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_fact_checks_recent ON fact_checks(created_at DESC);
    `);
    process.exit(1);
  }

  console.log("✅ Table 'fact_checks' exists!");

  // Count rows
  const { data } = await supabase.from("fact_checks").select("id");
  console.log(`   Rows: ${data?.length || 0}`);
}

main();
