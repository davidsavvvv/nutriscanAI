/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

if (!isValidUrl(supabaseUrl)) {
  console.warn(
    "Invalid or missing VITE_SUPABASE_URL. Please verify your environment variables. Received:", 
    supabaseUrl
  );
}

export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
