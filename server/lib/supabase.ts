import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer service role for server; fall back to anon for read-only in demo/dev
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[server/supabase] Missing SUPABASE_URL or SUPABASE keys. Using limited/no DB access.');
}

let serverClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (!serverClient) {
    serverClient = createClient((SUPABASE_URL as string) || '', (SUPABASE_KEY as string) || '', {
      auth: { persistSession: false }
    });
  }
  return serverClient;
}

export const supabaseServer = getServerSupabase();


