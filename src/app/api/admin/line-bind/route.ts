import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * "Link my LINE account" for an already-logged-in admin — deliberately
 * separate from the public /api/auth/line flow, which does find-or-create
 * by email. That's wrong for this: an admin clicking this is already
 * authenticated, and find-or-create risks silently creating a second
 * account (email mismatch) instead of touching the one they're using right
 * now. This flow only ever updates the current session's own profile row.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/admin/login`);
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.redirect(`${origin}/admin`);
  }

  const admin = createAdminClient();
  const { data: settings } = await admin
    .from('protected_settings')
    .select('key, value')
    .eq('group', 'line_login');
  const channelId = settings?.find((s) => s.key === 'line_login_channel_id')?.value as string | undefined;

  if (!channelId) {
    return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=not-configured`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${origin}/api/admin/line-bind/callback`;

  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', String(channelId));
  lineAuthUrl.searchParams.set('redirect_uri', redirectUri);
  lineAuthUrl.searchParams.set('state', state);
  lineAuthUrl.searchParams.set('scope', 'profile openid');

  const response = NextResponse.redirect(lineAuthUrl.toString());
  response.cookies.set('line_bind_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
