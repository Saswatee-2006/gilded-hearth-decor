import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables exist without exposing their values
const hasUrl = !!supabaseUrl;
const hasKey = !!supabaseAnonKey;

if (!hasUrl || !hasKey) {
  console.error(`Supabase configuration missing. URL detected: ${hasUrl}, Key detected: ${hasKey}`);
}

export const supabase = createClient(
  supabaseUrl || "http://missing-supabase-url.example.com",
  supabaseAnonKey || "missing-supabase-key"
);
