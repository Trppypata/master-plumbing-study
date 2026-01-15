'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  category: string;
  icon: string;
  display_order: number;
  created_at: string;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  url?: string;
  category?: string;
  icon?: string;
}

/**
 * Get all resources
 */
export async function getResources(category?: string): Promise<Resource[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('resources')
    .select('*')
    .order('display_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return data || [];
}

/**
 * Create a new resource
 */
export async function createResource(
  input: CreateResourceInput
): Promise<{ success: boolean; resource?: Resource; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      title: input.title,
      description: input.description || null,
      url: input.url || null,
      category: input.category || 'general',
      icon: input.icon || '📚',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, resource: data };
}

/**
 * Update a resource
 */
export async function updateResource(
  id: string,
  updates: Partial<CreateResourceInput>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id);

  return { success: !error, error: error?.message };
}

/**
 * Delete a resource
 */
export async function deleteResource(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id);

  return !error;
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<string[]> {
  if (!isSupabaseConfigured()) return ['general'];

  const { data } = await supabase
    .from('resources')
    .select('category')
    .order('category');

  const categories = [...new Set(data?.map(r => r.category) || [])];
  return categories.length > 0 ? categories : ['general'];
}
