import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== "" &&
    !supabaseUrl.includes("your-project") &&
    supabaseAnonKey &&
    supabaseAnonKey.trim() !== "" &&
    !supabaseAnonKey.includes("your_supabase")
  );
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return clientInstance;
}
