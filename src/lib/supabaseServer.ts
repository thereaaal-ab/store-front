import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public reader — uses the anon key.
 * Safe for reading published products, categories, variants.
 * Works as long as Supabase RLS allows public SELECT (or RLS is disabled).
 */
let _reader: SupabaseClient | null = null;

export function getSupabaseReader(): SupabaseClient | null {
  if (_reader) return _reader;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  _reader = createClient(url, anonKey, { auth: { persistSession: false } });
  return _reader;
}

/**
 * Admin client — uses the service_role key.
 * Use ONLY for writes (createOrder, stock updates) that need to bypass RLS.
 * Never expose to the browser.
 */
let _admin: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  _admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return _admin;
}
