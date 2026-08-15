import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { establishLineSession } from '@/lib/line-login';

interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const origin = url.origin;

  // Error from LINE
  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=line-auth-denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/auth?error=line-auth-error`);
  }

  // Validate state
  const cookies = request.headers.get('cookie') || '';
  const stateCookie = parseCookie(cookies, 'line_oauth_state');

  if (!stateCookie || stateCookie !== state) {
    return NextResponse.redirect(`${origin}/auth?error=line-auth-state-mismatch`);
  }

  try {
    // Read LINE Login settings from DB
    const supabase = createAdminClient();
    const { data: settings } = await supabase
      .from('protected_settings')
      .select('key, value')
      .eq('group', 'line_login');

    const channelId = settings?.find((s) => s.key === 'line_login_channel_id')?.value as string | undefined;
    const channelSecret = settings?.find((s) => s.key === 'line_login_channel_secret')?.value as string | undefined;

    if (!channelId || !channelSecret) {
      return NextResponse.redirect(`${origin}/auth?error=line-not-configured`);
    }

    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/api/auth/line/callback`,
        client_id: String(channelId),
        client_secret: String(channelSecret),
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error('[LINE callback] token exchange failed:', tokenRes.status, body);
      return NextResponse.redirect(`${origin}/auth?error=line-token-error`);
    }

    const tokens: LineTokenResponse = await tokenRes.json();

    // 2. Get LINE profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${origin}/auth?error=line-profile-error`);
    }

    const lineProfile: LineProfile = await profileRes.json();

    // 3. Try to get email from ID token verification
    let email = '';
    if (tokens.id_token) {
      try {
        const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            id_token: tokens.id_token,
            client_id: String(channelId),
          }),
        });
        if (verifyRes.ok) {
          const idTokenData = await verifyRes.json();
          email = idTokenData.email || '';
        }
      } catch {
        // Email is optional, continue without it
      }
    }

    // 4. Find/create the matching Supabase user and start a session
    const response = NextResponse.redirect(`${origin}/`);
    const { error: sessionError } = await establishLineSession(
      {
        userId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        email,
      },
      response
    );

    if (sessionError) {
      return NextResponse.redirect(`${origin}/auth?error=${sessionError}`);
    }

    // Clear OAuth cookies
    response.cookies.delete('line_oauth_state');
    response.cookies.delete('line_oauth_nonce');
    return response;
  } catch (err) {
    console.error('[LINE callback] unhandled error:', err);
    return NextResponse.redirect(`${origin}/auth?error=line-unknown-error`);
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
