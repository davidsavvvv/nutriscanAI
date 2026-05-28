import { createClient } from "@supabase/supabase-js";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qwylrnzeskackrbcnguv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

try {
  new URL(supabaseUrl);
} catch (e) {
  console.warn(`Invalid VITE_SUPABASE_URL provided: ${supabaseUrl}. Falling back to placeholder.`);
  supabaseUrl = "https://qwylrnzeskackrbcnguv.supabase.co";
}

if (!import.meta.env.VITE_SUPABASE_URL || (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)) {
  console.warn("Supabase credentials not found. Please set VITE_SUPABASE_URL and either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
