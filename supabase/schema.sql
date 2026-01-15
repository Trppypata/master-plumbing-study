-- Master Plumbing Study App Database Schema
-- Run this in your Supabase SQL Editor

-- Subjects table (4 main subjects)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics within each subject
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, slug)
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recall', 'multiple_choice', 'calculation', 'scenario')),
  front_content TEXT NOT NULL,
  back_content TEXT NOT NULL,
  explanation TEXT,
  formula TEXT,
  code_reference TEXT,
  common_mistake TEXT,
  choices JSONB, -- For multiple choice: [{text, isCorrect}]
  steps JSONB, -- For calculations: [{step, explanation}]
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress (single user, no auth needed)
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered', 'needs_review')),
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study sessions tracking
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  cards_reviewed INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Insert the 4 main subjects
INSERT INTO subjects (name, slug, description, icon, color, display_order) VALUES
  ('Plumbing Code', 'plumbing-code', 'Code interpretation, venting, drainage, traps, and materials', '📜', '#3b82f6', 1),
  ('Plumbing Arithmetic', 'plumbing-arithmetic', 'Pipe sizing, slopes, pressure loss, fixture units, and conversions', '🔢', '#10b981', 2),
  ('Sanitation & Design', 'sanitation-design', 'System layout, potable water safety, and wastewater concepts', '🏗️', '#8b5cf6', 3),
  ('Practical Problems', 'practical-problems', 'Troubleshooting scenarios and job-site decision questions', '🔧', '#f59e0b', 4)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_next_review ON progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);

-- Enable Row Level Security (disabled for single-user app)
-- ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
-- Exam Results Persistence
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  duration_seconds INTEGER,
  subjects_breakdown JSONB, -- Store per-subject performance
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (though sticking to single user model for now, good practice)
-- ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;


-- Smart Mistake Bank
CREATE TABLE IF NOT EXISTS mistakes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  question_data JSONB NOT NULL,
  incorrect_count INTEGER DEFAULT 1,
  last_missed_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  UNIQUE(question_id)
);

-- Index for fast lookup of unresolved mistakes
CREATE INDEX idx_mistakes_unresolved ON mistakes_log(is_resolved) WHERE is_resolved = FALSE;
