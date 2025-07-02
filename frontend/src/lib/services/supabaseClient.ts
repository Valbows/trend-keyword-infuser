// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' Supabase Client
// This module provides a singleton instance of the Supabase client for the entire application.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL and Key must be defined in environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
