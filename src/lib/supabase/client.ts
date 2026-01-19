import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing. Please check your .env.local file.');
    // Return a dummy client or throw a clearer error? 
    // Throwing is better to stop execution that relies on it.
    throw new Error('Supabase environment variables are missing. Please check your .env.local file and restart the development server.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
