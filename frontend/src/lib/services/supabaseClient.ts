// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. - 'Durable' Supabase Client for Server-Side Operations
// This file initializes the Supabase client using a centralized and validated configuration.

import { createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

// Create a single, 'Durable' Supabase client instance.
console.log('[SupabaseClient] Initializing with URL:', environment.supabase.url);
// This ensures that the connection is established using validated credentials from a single
// authoritative source (environment.ts) and provides a single point of access for all database operations.
// This client is safe to use on the client-side.
// It uses the public anon key and respects RLS policies.
export const supabase = createClient(environment.supabase.url, environment.supabase.anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// This client is for server-side use ONLY.
// It uses the service role key and bypasses RLS.
// NEVER expose this client to the browser.
export const supabaseAdmin = createClient(
  environment.supabase.url,
  environment.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
