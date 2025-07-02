/**
 * G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' Environment Configuration
 *
 * This module centralizes environment variable access and provides fallback mechanisms
 * for different deployment contexts (local, CI/CD, Vercel).
 */

// Environment type definition for strong typing
export interface EnvironmentVariables {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  GEMINI_API_KEY?: string;
  YOUTUBE_API_KEY?: string;
  NODE_ENV: string;
}

// Get environment variables with validation and intelligent fallbacks
export function getEnvironmentVariables(): EnvironmentVariables {
  // Required variables
  const supabaseUrl = process.env.SUPABASE_URL;
  // Support multiple naming conventions used in different environments
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  // Optional variables
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Validate required environment variables
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not defined');
  }

  if (!supabaseKey) {
    throw new Error(
      'None of the expected Supabase key environment variables are defined: SUPABASE_SERVICE_KEY, SUPABASE_KEY, or SUPABASE_ANON_KEY'
    );
  }

  // Return validated environment configuration
  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_KEY: supabaseKey,
    GEMINI_API_KEY: geminiApiKey,
    YOUTUBE_API_KEY: youtubeApiKey,
    NODE_ENV: nodeEnv,
  };
}

// Export singleton instance for use across the application
export const env = getEnvironmentVariables();
