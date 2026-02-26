-- ============================================================================
-- CONDOR — Content Management Tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- 1. Candidates table
CREATE TABLE IF NOT EXISTS candidates (
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
);

-- 2. Poll data points table
CREATE TABLE IF NOT EXISTS poll_data_points (
  id SERIAL PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  value REAL NOT NULL,
  pollster TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. News articles table
CREATE TABLE IF NOT EXISTS news_articles (
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
);

-- 4. RLS policies — public read, write only via service role
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Public read polls" ON poll_data_points FOR SELECT USING (true);
CREATE POLICY "Public read news" ON news_articles FOR SELECT USING (true);

-- 5. Index for common queries
CREATE INDEX IF NOT EXISTS idx_candidates_active ON candidates(is_active, poll_average DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_slug ON candidates(slug);
CREATE INDEX IF NOT EXISTS idx_poll_data_candidate ON poll_data_points(candidate_id);
CREATE INDEX IF NOT EXISTS idx_news_active ON news_articles(is_active, created_at DESC);
