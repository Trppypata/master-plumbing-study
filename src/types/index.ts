// TypeScript types for the Master Plumbing Study App

export type FlashcardType = 'recall' | 'multiple_choice' | 'calculation' | 'scenario';
export type ProgressStatus = 'new' | 'learning' | 'mastered' | 'needs_review';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface Choice {
  text: string;
  isCorrect: boolean;
}

export interface CalculationStep {
  step: string;
  explanation: string;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  type: FlashcardType;
  front_content: string;
  back_content: string;
  explanation?: string;
  formula?: string;
  code_reference?: string;
  common_mistake?: string;
  choices?: Choice[];
  steps?: CalculationStep[];
  difficulty: number;
  created_at: string;
  // Joined data
  topic?: Topic;
  progress?: Progress;
}

export interface Progress {
  id: string;
  flashcard_id: string;
  status: ProgressStatus;
  times_reviewed: number;
  times_correct: number;
  last_reviewed_at?: string;
  next_review_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  subject_id: string;
  cards_reviewed: number;
  cards_correct: number;
  duration_seconds?: number;
  started_at: string;
  ended_at?: string;
}

// UI Types
export interface SubjectStats {
  subject: Subject;
  totalCards: number;
  mastered: number;
  needsReview: number;
  new: number;
  progressPercent: number;
}

export interface DashboardStats {
  totalCards: number;
  cardsToday: number;
  weakestSubject: Subject | null;
  examReadiness: number;
  subjectStats: SubjectStats[];
}

export interface FlashcardWithProgress extends Omit<Flashcard, 'progress'> {
  progress: Progress | null;
}
