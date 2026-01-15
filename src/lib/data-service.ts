// Data service for managing flashcards and progress with Supabase
// Falls back to localStorage when Supabase is not configured

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
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('display_order');
    
    if (error) throw error;
    return data || [];
  }
  
  // Fallback to demo data
  return getDemoSubjects();
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    return data;
  }
  
  return getDemoSubjects().find(s => s.slug === slug) || null;
}

// ============================================
// FLASHCARDS
// ============================================

export async function getFlashcardsBySubject(subjectSlug: string): Promise<FlashcardWithProgress[]> {
  if (isSupabaseConfigured()) {
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
  
  // Fallback to localStorage progress
  const flashcards = getDemoFlashcards(subjectSlug);
  const progress = getLocalProgress();
  
  return flashcards.map(card => ({
    ...card,
    progress: progress[card.id] || null,
  }));
}

// ============================================
// PROGRESS
// ============================================

export async function updateProgress(
  flashcardId: string, 
  wasCorrect: boolean
): Promise<Progress | null> {
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

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('progress')
      .upsert(progressData, { onConflict: 'flashcard_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Fallback to localStorage
  saveLocalProgress(flashcardId, {
    id: existingProgress?.id || `local-${flashcardId}`,
    ...progressData,
    created_at: existingProgress?.created_at || new Date().toISOString(),
  } as Progress);
  
  return getLocalProgress()[flashcardId];
}

async function getProgressByFlashcard(flashcardId: string): Promise<Progress | null> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('progress')
      .select('*')
      .eq('flashcard_id', flashcardId)
      .single();
    
    return data || null;
  }
  
  return getLocalProgress()[flashcardId] || null;
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
  
  const cardsToday = getCardsReviewedToday();
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
// LOCAL STORAGE HELPERS
// ============================================

const PROGRESS_KEY = 'plumbing-study-progress';
const TODAY_CARDS_KEY = 'plumbing-study-today';

function getLocalProgress(): Record<string, Progress> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PROGRESS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveLocalProgress(flashcardId: string, progress: Progress): void {
  if (typeof window === 'undefined') return;
  const all = getLocalProgress();
  all[flashcardId] = progress;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  incrementTodayCards();
}

function getCardsReviewedToday(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(TODAY_CARDS_KEY);
  if (!stored) return 0;
  
  const { date, count } = JSON.parse(stored);
  const today = new Date().toDateString();
  
  return date === today ? count : 0;
}

function incrementTodayCards(): void {
  if (typeof window === 'undefined') return;
  const today = new Date().toDateString();
  const current = getCardsReviewedToday();
  
  localStorage.setItem(TODAY_CARDS_KEY, JSON.stringify({
    date: today,
    count: current + 1,
  }));
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(TODAY_CARDS_KEY);
}

// ============================================
// DEMO DATA
// ============================================

function getDemoSubjects(): Subject[] {
  return [
    {
      id: '1',
      name: 'Plumbing Code',
      slug: 'plumbing-code',
      description: 'Code interpretation, venting, drainage, traps, and materials',
      icon: '📜',
      color: '#3b82f6',
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Plumbing Arithmetic',
      slug: 'plumbing-arithmetic',
      description: 'Pipe sizing, slopes, pressure loss, fixture units, and conversions',
      icon: '🔢',
      color: '#10b981',
      display_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Sanitation & Design',
      slug: 'sanitation-design',
      description: 'System layout, potable water safety, and wastewater concepts',
      icon: '🏗️',
      color: '#8b5cf6',
      display_order: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Practical Problems',
      slug: 'practical-problems',
      description: 'Troubleshooting scenarios and job-site decision questions',
      icon: '🔧',
      color: '#f59e0b',
      display_order: 4,
      created_at: new Date().toISOString(),
    },
  ];
}

function getDemoFlashcards(subjectSlug: string): Flashcard[] {
  // This would be replaced with actual data from Supabase
  // For now, returns sample cards per subject
  const allCards: Record<string, Flashcard[]> = {
    'plumbing-code': [
      {
        id: 'pc-1',
        topic_id: '1',
        type: 'recall',
        front_content: 'What is the minimum trap seal depth required for floor drains?',
        back_content: '2 inches (50mm)',
        explanation: 'A 2-inch trap seal prevents sewer gases from entering the building.',
        code_reference: 'IPC Section 1002.4',
        difficulty: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'pc-2',
        topic_id: '1',
        type: 'multiple_choice',
        front_content: 'What is the maximum distance a P-trap can be from the fixture?',
        back_content: '24 inches (610mm)',
        choices: [
          { text: '12 inches', isCorrect: false },
          { text: '24 inches', isCorrect: true },
          { text: '36 inches', isCorrect: false },
          { text: '48 inches', isCorrect: false },
        ],
        difficulty: 2,
        created_at: new Date().toISOString(),
      },
    ],
    'plumbing-arithmetic': [
      {
        id: 'pa-1',
        topic_id: '2',
        type: 'calculation',
        front_content: 'Calculate the total fall for a 50-foot drain with 1/4" per foot slope.',
        back_content: '12.5 inches',
        formula: 'Fall = Length × Slope',
        steps: [
          { step: 'Identify values: 50ft length, 1/4"/ft slope', explanation: '' },
          { step: 'Apply formula: 50 × 0.25 = 12.5 inches', explanation: '' },
        ],
        difficulty: 1,
        created_at: new Date().toISOString(),
      },
    ],
    'sanitation-design': [
      {
        id: 'sd-1',
        topic_id: '3',
        type: 'recall',
        front_content: 'What is an air gap in plumbing?',
        back_content: 'The unobstructed vertical distance between water outlet and flood level rim.',
        explanation: 'Air gaps prevent backflow and cross-contamination.',
        difficulty: 1,
        created_at: new Date().toISOString(),
      },
    ],
    'practical-problems': [
      {
        id: 'pp-1',
        topic_id: '4',
        type: 'scenario',
        front_content: 'Multiple fixtures drain slowly with gurgling. What is the likely cause?',
        back_content: 'Inadequate venting or blocked vent stack.',
        explanation: 'Gurgling indicates venting problems preventing proper drainage.',
        difficulty: 2,
        created_at: new Date().toISOString(),
      },
    ],
  };
  
  return allCards[subjectSlug] || [];
}
