// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable', 'Optimized', and 'Clairvoyant' Supabase Client
// This module provides a singleton instance of the Supabase client for the entire application.
// Enhanced with smart environment variable handling for different deployment contexts.

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/environment';

/**
 * Initialize and configure the Supabase client.
 * Uses the centralized environment configuration to ensure consistent access to environment variables.
 * This approach handles different naming conventions between environments and provides better error reporting.
 */

// Create the client using validated environment variables
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    // Add custom headers if needed
    headers: { 'x-application-name': 'trend-keyword-infuser' },
  },
};

// Create and export the Supabase client instance
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  supabaseOptions
);
