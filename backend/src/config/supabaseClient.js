require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
}); // Ensure .env at backend root is loaded

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}
if (!supabaseServiceKey) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // It's generally recommended to disable auto-refreshing sessions for server-side clients
    // as they typically use service_role keys which don't expire or rely on user sessions.
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

module.exports = supabase;
