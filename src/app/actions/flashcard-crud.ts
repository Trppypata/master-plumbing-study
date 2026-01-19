'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Flashcard, FlashcardType, Choice, CalculationStep } from '@/types';

// Create a new flashcard
export async function createFlashcard(data: {
  topic_id: string;
  type: FlashcardType;
  front_content: string;
  back_content: string;
  explanation?: string;
  formula?: string;
  code_reference?: string;
  choices?: Choice[];
  steps?: CalculationStep[];
  difficulty?: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('flashcards')
    .insert({
      ...data,
      difficulty: data.difficulty || 1,
      // created_by: user.id // If we had this column
    });

  if (error) throw error;
  revalidatePath('/resources/cards');
  return { success: true };
}

// Update an existing flashcard
export async function updateFlashcard(id: string, data: Partial<Flashcard>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Remove joined fields if present to avoid errors
  const { progress, topic, ...updateData } = data as any;

  const { error } = await supabase
    .from('flashcards')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/resources/cards');
  return { success: true };
}

// Delete a flashcard
export async function deleteFlashcard(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/resources/cards');
  return { success: true };
}

// Fetch all flashcards for admin management
export async function getFlashcardsAdmin(search?: string, topicId?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('flashcards')
    .select(`
      *,
      topic:topics(id, name, subject:subjects(name))
    `)
    .order('created_at', { ascending: false });

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  if (search) {
    query = query.ilike('front_content', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

// Fetch all topics for dropdowns
export async function getTopics() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('topics')
      .select('*, subject:subjects(name, slug)')
      .order('name');
    
    if (error) throw error;
    return data;
}

// Batch create flashcards (for AI Generator)
export async function createFlashcardsBatch(
  cards: { front: string; back: string; explanation?: string }[],
  topicId: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const cardsToInsert = cards.map(card => ({
    topic_id: topicId,
    type: 'recall' as FlashcardType,
    front_content: card.front,
    back_content: card.back,
    explanation: card.explanation,
    difficulty: 1
  }));

  const { error } = await supabase
    .from('flashcards')
    .insert(cardsToInsert);

  if (error) throw error;
  
  revalidatePath('/dashboard');
  revalidatePath('/study');
  return { success: true };
}
