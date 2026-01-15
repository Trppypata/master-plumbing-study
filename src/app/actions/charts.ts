'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface DailyChartData {
  date: string;
  cardsStudied: number;
  cardsCorrect: number;
  accuracy: number;
}

export interface SubjectProgress {
  subject: string;
  total: number;
  mastered: number;
  learning: number;
}

/**
 * Get study data for charts (last N days)
 */
export async function getChartData(days: number = 14): Promise<DailyChartData[]> {
  if (!isSupabaseConfigured()) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('daily_stats')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  return (data || []).map(d => ({
    date: d.date,
    cardsStudied: d.cards_studied,
    cardsCorrect: d.cards_correct,
    accuracy: d.cards_studied > 0 
      ? Math.round((d.cards_correct / d.cards_studied) * 100) 
      : 0,
  }));
}

/**
 * Get progress by subject
 */
export async function getSubjectProgress(): Promise<SubjectProgress[]> {
  if (!isSupabaseConfigured()) return [];

  // Get all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name');

  if (!subjects) return [];

  const results: SubjectProgress[] = [];

  for (const subject of subjects) {
    // Get flashcard IDs for this subject
    const { data: topics } = await supabase
      .from('topics')
      .select('id')
      .eq('subject_id', subject.id);

    if (!topics || topics.length === 0) {
      results.push({ subject: subject.name, total: 0, mastered: 0, learning: 0 });
      continue;
    }

    const topicIds = topics.map(t => t.id);

    // Get flashcards for these topics
    const { data: flashcards } = await supabase
      .from('flashcards')
      .select('id')
      .in('topic_id', topicIds);

    if (!flashcards || flashcards.length === 0) {
      results.push({ subject: subject.name, total: 0, mastered: 0, learning: 0 });
      continue;
    }

    const flashcardIds = flashcards.map(f => f.id);

    // Get progress for these flashcards
    const { data: progress } = await supabase
      .from('progress')
      .select('status')
      .in('flashcard_id', flashcardIds);

    results.push({
      subject: subject.name,
      total: flashcards.length,
      mastered: progress?.filter(p => p.status === 'mastered').length || 0,
      learning: progress?.filter(p => p.status === 'learning').length || 0,
    });
  }

  return results;
}

/**
 * Get total study time (from exam results duration)
 */
export async function getTotalStudyTime(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const { data } = await supabase
    .from('exam_results')
    .select('duration_seconds');

  return data?.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) || 0;
}
