/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enhance build output with more information
  poweredByHeader: false,

  // Configure environment variable handling
  env: {
    // Ensure Supabase variables are properly passed through
    // This makes the variables available to the client-side code
    SUPABASE_URL: process.env.SUPABASE_URL,
    // Support both naming conventions used in different environments
    SUPABASE_KEY: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY,
  },

  // Output a standalone build that doesn't require the Next.js installation
  // This optimizes deployment to Vercel and other platforms
  output: 'standalone',
};

module.exports = nextConfig;
