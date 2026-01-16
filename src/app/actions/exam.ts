'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ExamResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  duration_seconds: number;
  subjects_breakdown: any;
}

export async function saveExamResult(result: ExamResult) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('exam_results')
    .insert({
      user_id: user.id,
      ...result,
      created_at: new Date().toISOString()
    });

  if (error) throw error;
  revalidatePath('/progress');
  return { success: true };
}

export async function logMistakes(mistakes: { question_id: string, question_data: any }[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const mistakesToInsert = mistakes.map(m => ({
    user_id: user.id,
    flashcard_id: m.question_id,
    question_data: m.question_data,
    is_resolved: false,
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('mistakes_log')
    .insert(mistakesToInsert);

  if (error) throw error;
  return { success: true };
}

export async function getExamQuestions(count: number) {
  const supabase = createClient();
  
  // Use a Postgres function or a random sort if available
  // For now, we'll fetch more than needed and shuffle in JS, or use a simple randomizer
  // A better way is: select * from flashcards order by random() limit count
  // But since we can't easily do order by random() in basic supabase.from()...
  
  const { data, error } = await supabase
    .from('flashcards')
    .select(`
      id,
      front_content,
      back_content,
      choices,
      explanation,
      topic:topics!inner(name, subject:subjects!inner(name))
    `)
    .limit(count * 2); // Fetch more to allow some randomness

  if (error) throw error;

  // Simple shuffle and limit
  const shuffled = (data || [])
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map(card => {
        // Find correct index for multiple choice
        let correctIndex = -1;
        if (card.choices && Array.isArray(card.choices)) {
            correctIndex = card.choices.findIndex((c: any) => c.isCorrect);
        }

        const topic: any = Array.isArray(card.topic) ? card.topic[0] : card.topic;
        const subjectName = (Array.isArray(topic?.subject) ? topic.subject[0]?.name : topic?.subject?.name) || 'General';

        return {
            id: card.id,
            text: card.front_content,
            choices: card.choices?.map((c: any) => c.text) || [],
            correctIndex: correctIndex,
            explanation: card.explanation || card.back_content,
            subject: subjectName
        };
    });

  return shuffled;
}

export async function getMistakesQuestions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('mistakes_log')
    .select(`
      flashcard_id,
      question_data
    `)
    .eq('user_id', user.id)
    .eq('is_resolved', false);

  if (error) throw error;

  // Transform to ExamQuestion format
  // We prioritize the data stored in the log to ensure we ask the exact same version they missed,
  // but in a real app you might want to fetch the live card to get updates.
  // Here we'll use the stored question_data which should be sufficient.
  
  return data.map((m: any) => ({
      ...m.question_data,
      id: m.flashcard_id // Ensure ID matches for potential re-logging
  }));
}

export async function resolveMistake(flashcardId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('mistakes_log')
    .update({ is_resolved: true })
    .eq('user_id', user.id)
    .eq('flashcard_id', flashcardId);

  if (error) throw error;
  return { success: true };
}

export async function getExamHistory() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('exam_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
