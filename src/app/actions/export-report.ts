'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getProgressSummary, getStudyStreak } from './progress';
import { getSubjectProgress } from './charts';

export interface ExamReportData {
  generatedAt: string;
  summary: {
    totalCards: number;
    mastered: number;
    learning: number;
    needsReview: number;
    examReadiness: number;
    studyStreak: number;
  };
  recentExams: {
    date: string;
    score: number;
    totalQuestions: number;
    percentage: number;
  }[];
  subjectProgress: {
    subject: string;
    progress: number;
    total: number;
  }[];
  weakAreas: {
    topic: string;
    accuracy: number;
  }[];
}

/**
 * Generate report data for PDF export
 */
export async function generateReportData(): Promise<ExamReportData> {
  const [summary, streak, subjProgress, examResults, weakAreas] = await Promise.all([
    getProgressSummary(),
    getStudyStreak(),
    getSubjectProgress(),
    getRecentExams(),
    getWeakAreas(),
  ]);

  const readiness = summary.total > 0
    ? Math.round(((summary.mastered + summary.learning * 0.5) / summary.total) * 100)
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalCards: summary.total,
      mastered: summary.mastered,
      learning: summary.learning,
      needsReview: summary.needsReview,
      examReadiness: readiness,
      studyStreak: streak,
    },
    recentExams: examResults,
    subjectProgress: subjProgress.map(s => ({
      subject: s.subject,
      progress: s.total > 0 ? Math.round(((s.mastered + s.learning * 0.5) / s.total) * 100) : 0,
      total: s.total,
    })),
    weakAreas,
  };
}

async function getRecentExams() {
  if (!isSupabaseConfigured()) return [];

  const { data } = await supabase
    .from('exam_results')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(5);

  return (data || []).map(exam => ({
    date: exam.completed_at,
    score: exam.score,
    totalQuestions: exam.total_questions,
    percentage: Math.round((exam.score / exam.total_questions) * 100),
  }));
}

async function getWeakAreas() {
  if (!isSupabaseConfigured()) return [];

  // Find topics with lowest accuracy
  const { data } = await supabase
    .from('mistakes_log')
    .select('flashcard_id, flashcards!inner(topic_id, topics!inner(name))')
    .order('attempt_count', { ascending: false })
    .limit(10);

  if (!data) return [];

  // Group by topic
  const topicStats: Record<string, { mistakes: number; name: string }> = {};
  data.forEach((m: any) => {
    const topicName = m.flashcards?.topics?.name || 'Unknown';
    if (!topicStats[topicName]) {
      topicStats[topicName] = { mistakes: 0, name: topicName };
    }
    topicStats[topicName].mistakes++;
  });

  return Object.values(topicStats)
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 5)
    .map(t => ({
      topic: t.name,
      accuracy: Math.max(0, 100 - t.mistakes * 10), // Rough estimate
    }));
}
