'use server';

import { createClient } from '@supabase/supabase-js';

// Server Action to save exam results
export async function saveExamResult(data: {
  score: number;
  total_questions: number;
  correct_answers: number;
  duration_seconds: number;
  subjects_breakdown: Record<string, any>;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing, cannot save exam results');
    return { success: false, error: 'Supabase not configured' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { error } = await supabase
      .from('exam_results')
      .insert([
        {
          score: data.score,
          total_questions: data.total_questions,
          correct_answers: data.correct_answers,
          duration_seconds: data.duration_seconds,
          subjects_breakdown: data.subjects_breakdown,
          completed_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving exam result:', error);
    return { success: false, error: 'Failed to save to database' };
  }
}

// Log mistakes for Smart Review
export async function logMistakes(mistakes: Array<{
  question_id: string;
  question_data: any;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const mistake of mistakes) {
    // Check if exists
    const { data: existing } = await supabase
      .from('mistakes_log')
      .select('incorrect_count')
      .eq('question_id', mistake.question_id)
      .single();

    if (existing) {
      // Increment count
      await supabase
        .from('mistakes_log')
        .update({ 
          incorrect_count: existing.incorrect_count + 1,
          last_missed_at: new Date().toISOString(),
          is_resolved: false // Re-open if it was resolved
        })
        .eq('question_id', mistake.question_id);
    } else {
      // Insert new
      await supabase
        .from('mistakes_log')
        .insert({
          question_id: mistake.question_id,
          question_data: mistake.question_data,
          incorrect_count: 1
        });
    }
  }
}
