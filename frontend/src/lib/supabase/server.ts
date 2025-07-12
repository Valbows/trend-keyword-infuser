import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { environment as env } from '../config/environment';

export const createClient = () => {
  const cookieStore = cookies();

  // Create a server-side client that can be used in Server Components, Route Handlers, and Server Actions.
  return createServerClient(env.supabase.url, env.supabase.serviceRoleKey, {
    cookies: {
      async get(name: string) {
        return (await cookieStore).get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          await (await cookieStore).set({ name, value, ...options });
        } catch (_error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          await (await cookieStore).set({ name, value: '', ...options });
        } catch (_error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};
