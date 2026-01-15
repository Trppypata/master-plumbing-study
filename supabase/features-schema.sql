-- Notes and Resources Tables
-- Run this in your Supabase SQL Editor

-- User notes attached to flashcards
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flashcard_id) -- One note per flashcard
);

-- Manual resources (links, formulas, tips)
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT DEFAULT 'general',
  icon TEXT DEFAULT '📚',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study sessions for progress tracking
CREATE TABLE IF NOT EXISTS study_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  was_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  studied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily study stats (aggregated)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  cards_studied INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  subjects_breakdown JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_flashcard ON notes(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_study_history_date ON study_history(studied_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow all (single-user mode)
CREATE POLICY "Allow all notes" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all resources" ON resources FOR ALL USING (true);
CREATE POLICY "Allow all study_history" ON study_history FOR ALL USING (true);
CREATE POLICY "Allow all daily_stats" ON daily_stats FOR ALL USING (true);
