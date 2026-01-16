// Legacy Supabase client for backward compatibility
// For new code, use @/lib/supabase/client or @/lib/supabase/server

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
    supabaseUrl.startsWith('https://')
  );
};

// Create a singleton browser client for legacy code
let supabaseClient: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

// Export a proxy that handles unconfigured state gracefully
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getClient();
    
    if (!client) {
      // Return no-op functions for auth methods to prevent crashes
      if (prop === 'auth') {
        return {
          signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          upsert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        });
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            download: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            remove: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          }),
        };
      }
      return undefined;
    }
    
    return (client as any)[prop];
  },
});
