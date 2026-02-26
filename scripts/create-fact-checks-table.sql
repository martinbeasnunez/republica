-- ============================================================================
-- CONDOR — Fact Checks Table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

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

-- RLS: public read, write via service role
ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fact_checks" ON fact_checks FOR SELECT USING (true);

-- Index for recent fact checks
CREATE INDEX IF NOT EXISTS idx_fact_checks_recent ON fact_checks(created_at DESC);
