import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Support both Vite-style and NEXT_PUBLIC-style env names
const url = (import.meta as any)?.env?.VITE_SUPABASE_URL
  || (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL;

const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
  || (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing env: SUPABASE_URL or SUPABASE_ANON_KEY');
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'wealthrm_supabase_auth'
      }
    });
  }
  return client;
}

export const supabase = getSupabaseClient();


