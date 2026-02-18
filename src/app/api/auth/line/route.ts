import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  // Read LINE Login settings from DB
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('group', 'line_login');

  const channelId = settings?.find((s) => s.key === 'line_login_channel_id')?.value;

  if (!channelId) {
    return NextResponse.json({ error: 'LINE Login 尚未設定' }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${origin}/api/auth/line/callback`;

  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', JSON.parse(channelId));
  lineAuthUrl.searchParams.set('redirect_uri', redirectUri);
  lineAuthUrl.searchParams.set('state', state);
  lineAuthUrl.searchParams.set('nonce', nonce);
  lineAuthUrl.searchParams.set('scope', 'profile openid email');

  const response = NextResponse.redirect(lineAuthUrl.toString());
  // Store state and nonce in cookies for validation
  response.cookies.set('line_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });
  response.cookies.set('line_oauth_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
