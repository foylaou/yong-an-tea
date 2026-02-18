import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

  // Read LINE Login settings from DB
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('group', 'line_login');

  const channelId = JSON.parse(
    settings?.find((s) => s.key === 'line_login_channel_id')?.value || '""'
  );
  const channelSecret = JSON.parse(
    settings?.find((s) => s.key === 'line_login_channel_secret')?.value || '""'
  );

  if (!channelId || !channelSecret) {
    return NextResponse.redirect(`${origin}/auth?error=line-not-configured`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/api/auth/line/callback`,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });

    if (!tokenRes.ok) {
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
            client_id: channelId,
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

    // 4. Find existing user by line_user_id
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('line_user_id', lineProfile.userId)
      .single();

    let userId: string;

    if (existingProfile) {
      // Existing user — get their email for magic link
      userId = existingProfile.id;
    } else {
      // New user — create Supabase account
      const userEmail = email || `line_${lineProfile.userId}@line.oauth.local`;

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          full_name: lineProfile.displayName,
          avatar_url: lineProfile.pictureUrl || '',
          line_user_id: lineProfile.userId,
        },
      });

      if (createError) {
        // If email already exists, try to link the LINE account
        if (createError.message.includes('already been registered')) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers() as { data: { users: { id: string; email?: string }[] } | null };
          const matchedUser = existingUsers?.users?.find((u: { email?: string }) => u.email === userEmail);
          if (matchedUser) {
            userId = matchedUser.id;
            // Link LINE user ID to existing profile
            await supabase
              .from('profiles')
              .update({ line_user_id: lineProfile.userId })
              .eq('id', matchedUser.id);
          } else {
            return NextResponse.redirect(`${origin}/auth?error=line-create-error`);
          }
        } else {
          return NextResponse.redirect(`${origin}/auth?error=line-create-error`);
        }
      } else {
        userId = newUser.user.id;

        // Update profile with LINE info
        await supabase
          .from('profiles')
          .update({
            full_name: lineProfile.displayName,
            line_user_id: lineProfile.userId,
          })
          .eq('id', userId);
      }
    }

    // 5. Get user email for magic link
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (!userData?.user?.email) {
      return NextResponse.redirect(`${origin}/auth?error=line-user-error`);
    }

    // 6. Generate magic link to create session
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.redirect(`${origin}/auth?error=line-session-error`);
    }

    // 7. Extract token from action link and redirect through our callback
    const actionUrl = new URL(linkData.properties.action_link);
    const tokenHash = actionUrl.searchParams.get('token');
    const type = actionUrl.searchParams.get('type');

    // Redirect to Supabase verify endpoint which will set the session
    // then redirect to our callback which redirects home
    const verifyUrl = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`);
    verifyUrl.searchParams.set('token', tokenHash || '');
    verifyUrl.searchParams.set('type', type || 'magiclink');
    verifyUrl.searchParams.set('redirect_to', `${origin}/api/auth/callback?next=/`);

    const response = NextResponse.redirect(verifyUrl.toString());
    // Clear OAuth cookies
    response.cookies.delete('line_oauth_state');
    response.cookies.delete('line_oauth_nonce');
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/auth?error=line-unknown-error`);
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
