import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase environment variables. Using demo mode with limited functionality.'
  );
}

// Create Supabase client with proper error handling
export const supabase = createClient(
  supabaseUrl || 'https://demo-project.supabase.co',
  supabaseKey || 'demo-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);

// Demo account credentials for development/testing
export const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123456'
};

// Error handling utility
export const handleSupabaseError = (error: Error | null) => {
  if (!error) return null;

  // Map common Supabase errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Incorrect email or password',
    'Email not confirmed': 'Please check your email to confirm your account',
    'User already registered': 'An account with this email already exists',
    'Password is too short': 'Password must be at least 6 characters',
    'Invalid email': 'Please enter a valid email address'
  };

  return errorMessages[error.message] || 'An unexpected error occurred';
};

// Session management utilities
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('demo_user');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};