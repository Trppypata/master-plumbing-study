'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Note {
  id: string;
  flashcard_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get note for a flashcard
 */
export async function getNote(flashcardId: string): Promise<Note | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Save or update a note
 */
export async function saveNote(
  flashcardId: string,
  content: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('notes')
    .upsert({
      flashcard_id: flashcardId,
      content,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'flashcard_id',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, note: data };
}

/**
 * Delete a note
 */
export async function deleteNote(flashcardId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('flashcard_id', flashcardId);

  return !error;
}

/**
 * Get all notes (for search/export)
 */
export async function getAllNotes(): Promise<Note[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  return data || [];
}
