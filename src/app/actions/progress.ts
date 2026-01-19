'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateNextReview } from '@/lib/spaced-repetition';
import { Progress } from '@/types';

export interface StudyResult {
  flashcardId: string;
  wasCorrect: boolean;
  responseTimeMs?: number;
}

/**
 * Record a study session result
 */
export async function recordStudyResult(result: StudyResult): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { flashcardId, wasCorrect, responseTimeMs } = result;

  try {
    // Get current progress
    const { data: currentProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('flashcard_id', flashcardId)
      .single();

    // Calculate next review
    const { status, nextReviewAt } = calculateNextReview(
      currentProgress as Progress | null,
      wasCorrect
    );

    // Upsert progress
    const progressUpdate = {
      flashcard_id: flashcardId,
      status,
      times_reviewed: (currentProgress?.times_reviewed || 0) + 1,
      times_correct: (currentProgress?.times_correct || 0) + (wasCorrect ? 1 : 0),
      last_reviewed_at: new Date().toISOString(),
      next_review_at: nextReviewAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('progress')
      .upsert(progressUpdate, { onConflict: 'flashcard_id' });

    // Record in study history
    await supabase.from('study_history').insert({
      flashcard_id: flashcardId,
      was_correct: wasCorrect,
      response_time_ms: responseTimeMs,
    });

    // Update daily stats
    await updateDailyStats(wasCorrect);

    return true;
  } catch (error) {
    console.error('Error recording study result:', error);
    return false;
  }
}

/**
 * Update daily aggregated stats
 */
async function updateDailyStats(wasCorrect: boolean): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('date', today)
    .single();

  if (existing) {
    await supabase
      .from('daily_stats')
      .update({
        cards_studied: existing.cards_studied + 1,
        cards_correct: existing.cards_correct + (wasCorrect ? 1 : 0),
      })
      .eq('date', today);
  } else {
    await supabase.from('daily_stats').insert({
      date: today,
      cards_studied: 1,
      cards_correct: wasCorrect ? 1 : 0,
    });
  }
}

/**
 * Get cards due for review
 */
export async function getDueCards(subjectId?: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const now = new Date().toISOString();

  let query = supabase
    .from('progress')
    .select('flashcard_id')
    .or(`next_review_at.lte.${now},status.eq.needs_review`)
    .order('next_review_at', { ascending: true })
    .limit(20);

  const { data } = await query;
  return data?.map(p => p.flashcard_id) || [];
}

/**
 * Get study streak (consecutive days)
 */
export async function getStudyStreak(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const { data } = await supabase
    .from('daily_stats')
    .select('date')
    .order('date', { ascending: false })
    .limit(30);

  if (!data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < data.length; i++) {
    const statsDate = new Date(data[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (statsDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get progress summary
 */
export async function getProgressSummary(): Promise<{
  total: number;
  mastered: number;
  learning: number;
  needsReview: number;
  new: number;
}> {
  if (!isSupabaseConfigured()) {
    return { total: 0, mastered: 0, learning: 0, needsReview: 0, new: 0 };
  }

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id');

  const { data: progress } = await supabase
    .from('progress')
    .select('status');

  const total = flashcards?.length || 0;
  const mastered = progress?.filter(p => p.status === 'mastered').length || 0;
  const learning = progress?.filter(p => p.status === 'learning').length || 0;
  const needsReview = progress?.filter(p => p.status === 'needs_review').length || 0;
  const newCards = total - (mastered + learning + needsReview);

  return { total, mastered, learning, needsReview, new: newCards };
}

export interface CalendarDay {
  date: string;
  cardsStudied: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = no activity, 4 = high activity
}

/**
 * Get streak calendar data for the last 7 weeks
 */
export async function getStreakCalendar(): Promise<CalendarDay[]> {
  if (!isSupabaseConfigured()) return [];

  // Get data for the last 49 days (7 weeks)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 48);
  startDate.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('daily_stats')
    .select('date, cards_studied')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Create a map of dates to cards studied
  const statsMap = new Map<string, number>();
  data?.forEach(d => statsMap.set(d.date, d.cards_studied));

  // Find max for level calculation
  const maxCards = Math.max(...(data?.map(d => d.cards_studied) || [0]), 1);

  // Generate 49 days of calendar data
  const calendar: CalendarDay[] = [];
  for (let i = 48; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const cardsStudied = statsMap.get(dateStr) || 0;
    
    // Calculate level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (cardsStudied > 0) {
      const ratio = cardsStudied / maxCards;
      if (ratio > 0.75) level = 4;
      else if (ratio > 0.5) level = 3;
      else if (ratio > 0.25) level = 2;
      else level = 1;
    }

    calendar.push({ date: dateStr, cardsStudied, level });
  }

  return calendar;
}
