import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { establishLineSession } from '@/lib/line-login';

interface LineIdTokenClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  name?: string;
  picture?: string;
  email?: string;
}

/**
 * Second entry point into the same session logic api/auth/line/callback
 * uses — this one for the storefront's LIFF app (opened from the rich
 * menu) instead of the OAuth redirect flow. The client calls liff.init(),
 * gets an ID token from the LIFF SDK, and posts it here to be verified and
 * turned into a Supabase session.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== 'string') {
    return NextResponse.json({ error: 'missing idToken' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('protected_settings')
    .select('key, value')
    .eq('group', 'line_login');
  const channelId = settings?.find((s) => s.key === 'line_login_channel_id')?.value as string | undefined;

  if (!channelId) {
    return NextResponse.json({ error: 'line-not-configured' }, { status: 500 });
  }

  // Same LINE endpoint the OAuth flow uses to read the email out of its ID
  // token, just verifying a LIFF-issued one instead. client_id must be the
  // LINE Login channel ID the LIFF app is registered under (LIFF apps hang
  // off a Login channel, not the Messaging API channel) — passing the wrong
  // channel ID here makes every verification fail with "aud mismatch".
  const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: String(channelId) }),
  });

  if (!verifyRes.ok) {
    const errBody = await verifyRes.text().catch(() => '');
    console.error('[LINE liff] id_token verify failed:', verifyRes.status, errBody);
    return NextResponse.json({ error: 'line-token-invalid' }, { status: 401 });
  }

  const claims: LineIdTokenClaims = await verifyRes.json();
  if (!claims.sub) {
    return NextResponse.json({ error: 'line-token-invalid' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const { error } = await establishLineSession(
    {
      userId: claims.sub,
      displayName: claims.name || '',
      pictureUrl: claims.picture,
      email: claims.email,
    },
    response
  );

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return response;
}
