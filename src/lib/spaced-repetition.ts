// Spaced Repetition Logic for Flashcard Review Scheduling
// Based on a simplified SM-2 algorithm

import { Progress, ProgressStatus } from '@/types';

// Calculate the next review date based on performance
export function calculateNextReview(
  progress: Progress | null,
  wasCorrect: boolean
): { status: ProgressStatus; nextReviewAt: Date } {
  const now = new Date();
  
  if (!progress) {
    // First time seeing this card
    return {
      status: wasCorrect ? 'learning' : 'needs_review',
      nextReviewAt: wasCorrect 
        ? addDays(now, 1) 
        : addMinutes(now, 10),
    };
  }

  const timesCorrect = progress.times_correct + (wasCorrect ? 1 : 0);
  const timesReviewed = progress.times_reviewed + 1;
  const successRate = timesCorrect / timesReviewed;

  if (!wasCorrect) {
    // Incorrect - needs more review soon
    return {
      status: 'needs_review',
      nextReviewAt: addMinutes(now, 10),
    };
  }

  // Correct answer - space out reviews based on success
  if (successRate >= 0.9 && timesReviewed >= 5) {
    return {
      status: 'mastered',
      nextReviewAt: addDays(now, 30),
    };
  } else if (successRate >= 0.7 && timesReviewed >= 3) {
    return {
      status: 'learning',
      nextReviewAt: addDays(now, 7),
    };
  } else if (successRate >= 0.5) {
    return {
      status: 'learning',
      nextReviewAt: addDays(now, 3),
    };
  } else {
    return {
      status: 'learning',
      nextReviewAt: addDays(now, 1),
    };
  }
}

// Get cards due for review, prioritizing needs_review
export function sortByReviewPriority<T extends { progress?: Progress | null }>(
  cards: T[]
): T[] {
  return [...cards].sort((a, b) => {
    const statusPriority: Record<ProgressStatus | 'none', number> = {
      needs_review: 0,
      new: 1,
      learning: 2,
      mastered: 3,
      none: 1,
    };

    const aStatus = a.progress?.status || 'none';
    const bStatus = b.progress?.status || 'none';

    // First, sort by status priority
    if (statusPriority[aStatus] !== statusPriority[bStatus]) {
      return statusPriority[aStatus] - statusPriority[bStatus];
    }

    // Then by next review date
    const aNext = a.progress?.next_review_at ? new Date(a.progress.next_review_at) : new Date(0);
    const bNext = b.progress?.next_review_at ? new Date(b.progress.next_review_at) : new Date(0);
    
    return aNext.getTime() - bNext.getTime();
  });
}

// Helper functions
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// Calculate exam readiness percentage
export function calculateExamReadiness(
  totalCards: number,
  masteredCards: number,
  learningCards: number
): number {
  if (totalCards === 0) return 0;
  
  // Mastered = 100% weight, Learning = 50% weight
  const weightedProgress = masteredCards + (learningCards * 0.5);
  const readiness = Math.round((weightedProgress / totalCards) * 100);
  
  return Math.min(readiness, 100);
}
