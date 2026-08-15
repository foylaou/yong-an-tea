import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface LineTokenResponse {
  access_token: string;
}

interface LineProfile {
  userId: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const origin = url.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=denied`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=bad-request`);
  }

  const cookies = request.headers.get('cookie') || '';
  const stateCookie = parseCookie(cookies, 'line_bind_state');
  if (!stateCookie || stateCookie !== state) {
    return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=state-mismatch`);
  }

  // Re-verify the session that started this flow is still the one coming
  // back — a browser tab left open across the LINE redirect could in theory
  // have signed out/in as someone else in the meantime.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/admin/login`);
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.redirect(`${origin}/admin`);
  }

  try {
    const admin = createAdminClient();
    const { data: settings } = await admin
      .from('protected_settings')
      .select('key, value')
      .eq('group', 'line_login');
    const channelId = settings?.find((s) => s.key === 'line_login_channel_id')?.value as string | undefined;
    const channelSecret = settings?.find((s) => s.key === 'line_login_channel_secret')?.value as string | undefined;

    if (!channelId || !channelSecret) {
      return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=not-configured`);
    }

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/api/admin/line-bind/callback`,
        client_id: String(channelId),
        client_secret: String(channelSecret),
      }),
    });
    if (!tokenRes.ok) {
      console.error('[line-bind callback] token exchange failed:', tokenRes.status, await tokenRes.text());
      return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=token-error`);
    }
    const tokens: LineTokenResponse = await tokenRes.json();

    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=profile-error`);
    }
    const lineProfile: LineProfile = await profileRes.json();

    const { error: updateError } = await admin
      .from('profiles')
      .update({ line_user_id: lineProfile.userId })
      .eq('id', user.id);

    if (updateError) {
      // line_user_id is UNIQUE — this LINE account is already bound to a
      // different profile.
      const isConflict = updateError.code === '23505';
      return NextResponse.redirect(
        `${origin}/admin/settings?line_bind_error=${isConflict ? 'already-bound' : 'update-failed'}`
      );
    }

    const response = NextResponse.redirect(`${origin}/admin/settings?line_bind_success=1`);
    response.cookies.delete('line_bind_state');
    return response;
  } catch (err) {
    console.error('[line-bind callback] unhandled error:', err);
    return NextResponse.redirect(`${origin}/admin/settings?line_bind_error=unknown`);
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
