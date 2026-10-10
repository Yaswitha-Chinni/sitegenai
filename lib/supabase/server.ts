import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function isSupabaseServerConfigured(): boolean {
  const key = serviceRoleKey || anonKey;
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== "" &&
    !supabaseUrl.includes("your-project") &&
    key &&
    key.trim() !== "" &&
    !key.includes("your_supabase")
  );
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const key = serviceRoleKey || anonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}
