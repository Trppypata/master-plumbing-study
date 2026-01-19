'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: { full_name?: string; avatar_url?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles') // Assuming a profiles table exists or we update metadata
    .update(data)
    .eq('id', user.id);

  // If profiles table doesn't exist yet, we might fallback to updating user metadata
  if (error) {
     // Fallback: Update Auth User Metadata
     const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: data.full_name, avatar_url: data.avatar_url }
     });
     if (metaError) throw metaError;
  }

  revalidatePath('/settings');
  revalidatePath('/', 'layout'); // Update header avatar everywhere
  return { success: true };
}

export async function getUserProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Try fetching from profiles table first
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // Return merged data, defaulting to auth metadata if profile is partial/missing
    return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        created_at: user.created_at
    };
}

export async function deleteAccount() {
    // Note: Deleting a user usually requires service_role key in a real app administration
    // or the user can delete themselves if RLS allows.
    // For now, we'll return a stub or strictly sign them out
    const supabase = createClient();
    const { error } = await supabase.rpc('delete_user'); // Custom RPC if available
    
    if (error) {
        throw new Error("Self-deletion requires Admin configuration. Please contact support.");
    }
}
