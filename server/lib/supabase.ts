import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[server/supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

let serverClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (!serverClient) {
    serverClient = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false }
    });
  }
  return serverClient;
}

export const supabaseServer = getServerSupabase();


