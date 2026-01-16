// Data service for managing flashcards and progress with Supabase
// Mockup data and localStorage fallbacks removed

import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Subject, 
  Topic, 
  Flashcard, 
  Progress, 
  FlashcardWithProgress,
  SubjectStats,
  DashboardStats 
} from '@/types';
import { calculateNextReview, calculateExamReadiness } from './spaced-repetition';

// ============================================
// SUBJECTS
// ============================================

export async function getSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data;
}

// ============================================
// FLASHCARDS
// ============================================

export async function getFlashcardsBySubject(subjectSlug: string): Promise<FlashcardWithProgress[]> {
  if (!isSupabaseConfigured()) return [];

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single();
  
  if (!subject) return [];

  const { data: flashcards, error } = await supabase
    .from('flashcards')
    .select(`
      *,
      topic:topics!inner(*, subject:subjects!inner(*)),
      progress(*)
    `)
    .eq('topic.subject.slug', subjectSlug);
  
  if (error) throw error;
  
  return (flashcards || []).map(card => ({
    ...card,
    progress: card.progress?.[0] || null,
  }));
}

// ============================================
// PROGRESS
// ============================================

export async function updateProgress(
  flashcardId: string, 
  wasCorrect: boolean
): Promise<Progress | null> {
  if (!isSupabaseConfigured()) return null;

  const existingProgress = await getProgressByFlashcard(flashcardId);
  const { status, nextReviewAt } = calculateNextReview(existingProgress, wasCorrect);
  
  const progressData = {
    flashcard_id: flashcardId,
    status,
    times_reviewed: (existingProgress?.times_reviewed || 0) + 1,
    times_correct: (existingProgress?.times_correct || 0) + (wasCorrect ? 1 : 0),
    last_reviewed_at: new Date().toISOString(),
    next_review_at: nextReviewAt.toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('progress')
    .upsert(progressData, { onConflict: 'flashcard_id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getProgressByFlashcard(flashcardId: string): Promise<Progress | null> {
  if (!isSupabaseConfigured()) return null;

  const { data } = await supabase
    .from('progress')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .single();
  
  return data || null;
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const subjects = await getSubjects();
  const subjectStats: SubjectStats[] = [];
  
  let totalCards = 0;
  let totalMastered = 0;
  let totalLearning = 0;
  let weakestSubject: Subject | null = null;
  let lowestProgress = 101;
  
  for (const subject of subjects) {
    const flashcards = await getFlashcardsBySubject(subject.slug);
    const stats = calculateSubjectStats(subject, flashcards);
    subjectStats.push(stats);
    
    totalCards += stats.totalCards;
    totalMastered += stats.mastered;
    totalLearning += stats.totalCards - stats.mastered - stats.new;
    
    if (stats.totalCards > 0 && stats.progressPercent < lowestProgress) {
      lowestProgress = stats.progressPercent;
      weakestSubject = subject;
    }
  }
  
  const cardsToday = await getCardsReviewedToday();
  const examReadiness = calculateExamReadiness(totalCards, totalMastered, totalLearning);
  
  return {
    totalCards,
    cardsToday,
    weakestSubject,
    examReadiness,
    subjectStats,
  };
}

function calculateSubjectStats(subject: Subject, flashcards: FlashcardWithProgress[]): SubjectStats {
  const totalCards = flashcards.length;
  const mastered = flashcards.filter(f => f.progress?.status === 'mastered').length;
  const needsReview = flashcards.filter(f => f.progress?.status === 'needs_review').length;
  const newCards = flashcards.filter(f => !f.progress || f.progress.status === 'new').length;
  
  const progressPercent = totalCards > 0 
    ? Math.round((mastered / totalCards) * 100) 
    : 0;
  
  return {
    subject,
    totalCards,
    mastered,
    needsReview,
    new: newCards,
    progressPercent,
  };
}

// ============================================
// STATISTICS HELPERS
// ============================================

async function getCardsReviewedToday(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('study_history')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  if (error) {
    console.error('Error fetching today\'s stats:', error);
    return 0;
  }

  return count || 0;
}
