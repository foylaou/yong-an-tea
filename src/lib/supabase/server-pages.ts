import { createServerClient } from '@supabase/ssr';
import type { GetServerSidePropsContext } from 'next';

/**
 * Creates a Supabase client for Pages Router getServerSideProps.
 * Reads cookies from ctx.req instead of next/headers cookies().
 */
export function createPagesClient(ctx: GetServerSidePropsContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = ctx.req.cookies;
          return Object.entries(cookies).map(([name, value]) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            ctx.res.setHeader(
              'Set-Cookie',
              `${name}=${value}; Path=${options?.path ?? '/'}; HttpOnly; SameSite=Lax${options?.secure ? '; Secure' : ''}${options?.maxAge ? `; Max-Age=${options.maxAge}` : ''}`
            );
          });
        },
      },
    }
  );
}
