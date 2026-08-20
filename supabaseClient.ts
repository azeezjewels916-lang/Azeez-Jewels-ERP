import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables to prevent ReferenceErrors
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore error if import.meta is not defined
  }
  return undefined;
};

// Support both standard env vars and Vite env vars
const envUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

// Use provided credentials as default fallback if env vars are missing
const supabaseUrl = envUrl || 'https://vdhnjmeyvbcbvdreltcb.supabase.co';
const supabaseKey = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaG5qbWV5dmJjYnZkcmVsdGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNDk3MzksImV4cCI6MjEwMjgyNTczOX0.A1x8YFcJD2X3HEn5UeejPJwDwfA08T5yb4boMdkl5-4';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. API calls will fail. Check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get the client (matching the provided code's import style)
export const createClientHelper = () => supabase;