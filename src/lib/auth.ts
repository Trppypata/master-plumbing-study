// Authentication helper functions using Supabase Auth
// Uses @supabase/ssr for proper cookie handling

import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error: error ? { message: error.message } : null,
  };
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error: error ? { message: error.message } : null,
  };
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();
  return { error: error ? { message: error.message } : null };
}

// Get current session (client-side)
export async function getSession(): Promise<Session | null> {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Get current user (client-side)
export async function getUser(): Promise<User | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createClient();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });

  return { unsubscribe: () => subscription.unsubscribe() };
}
