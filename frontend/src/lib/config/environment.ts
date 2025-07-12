// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. - Centralized Environment Configuration
// This file provides a single, authoritative source for all environment variables,
// ensuring consistent and secure access across the application.

// Basic validation to ensure environment variables are loaded.
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// S.A.F.E. Principle: Validate Redis URL if present.
if (!process.env.REDIS_URL) {
  console.warn(
    'Missing optional environment variable: REDIS_URL. Caching will be disabled.'
  );
}

export const environment = {
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  redisUrl: process.env.REDIS_URL,
};
