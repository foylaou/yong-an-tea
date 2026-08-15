import { createServerClient } from '@supabase/ssr';
import type { NextResponse } from 'next/server';
import { createAdminClient } from './supabase/admin';
import { sendWelcomeCoupons } from './line-bot-handlers';

export interface LineIdentity {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
}

/**
 * Shared by both LINE Login entry points — the OAuth redirect flow
 * (api/auth/line/callback) and the LIFF ID-token flow (api/auth/line/liff).
 * Both end up with the same thing, a verified LINE identity; this is the
 * "find or create the matching Supabase user, then start a session" half
 * that used to live only in the callback route. Keeping it in one place
 * means a bug fix here (e.g. the email-collision handling) can't silently
 * apply to only one of the two entry points.
 *
 * Sets session cookies directly on `response` (via @supabase/ssr's cookie
 * adapter) — the caller decides what kind of response to send (redirect vs
 * JSON), this just needs somewhere to attach Set-Cookie headers.
 */
export async function establishLineSession(
  identity: LineIdentity,
  response: NextResponse
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  // 1. Find existing user by line_user_id
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('line_user_id', identity.userId)
    .single();

  let userId: string;
  // True only when this profile's line_user_id is being set for the very
  // first time in this call — not on a returning member's ordinary login.
  // Drives is_welcome_coupon: a profile that already had line_user_id set
  // (the `existingProfile` branch) has already had its shot at any welcome
  // coupon that existed when it first bound.
  let isNewLineMember = false;

  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    // New user — create Supabase account
    const userEmail = identity.email || `line_${identity.userId}@line.oauth.local`;

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: {
        full_name: identity.displayName,
        avatar_url: identity.pictureUrl || '',
        line_user_id: identity.userId,
      },
    });

    if (createError) {
      if (createError.message.includes('already been registered')) {
        // Email collision — link the LINE account to the existing user instead.
        try {
          const foundUserId = await findUserIdByEmail(supabase, userEmail);
          const { data: userData } = await supabase.auth.admin.getUserById(foundUserId);
          if (!userData?.user) {
            return { error: 'line-create-error' };
          }
          userId = userData.user.id;
          await supabase.from('profiles').update({ line_user_id: identity.userId }).eq('id', userId);
          isNewLineMember = true;
        } catch (err) {
          console.error('[LINE login] could not find existing user for email:', userEmail, err);
          return { error: 'line-create-error' };
        }
      } else {
        console.error('[LINE login] createUser error:', createError.message);
        return { error: 'line-create-error' };
      }
    } else {
      userId = newUser.user.id;
      await supabase
        .from('profiles')
        .update({ full_name: identity.displayName, line_user_id: identity.userId })
        .eq('id', userId);
      isNewLineMember = true;
    }
  }

  // 2. Get user email for magic link
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  if (!userData?.user?.email) {
    return { error: 'line-user-error' };
  }

  // 3. Generate magic link token
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: userData.user.email,
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('[LINE login] generateLink error:', linkError?.message);
    return { error: 'line-session-error' };
  }

  // 4. Verify token server-side and set session cookies on the response
  const serverSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: verifyError } = await serverSupabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  });

  if (verifyError) {
    console.error('[LINE login] verifyOtp error:', verifyError.message);
    return { error: 'line-session-error' };
  }

  // Fire-and-forget — a welcome-coupon push failure must never turn into a
  // failed login. Session is already established at this point regardless.
  if (isNewLineMember) {
    sendWelcomeCoupons(identity.userId).catch((err) => {
      console.error('[LINE login] sendWelcomeCoupons failed:', err);
    });
  }

  return {};
}

async function findUserIdByEmail(supabase: ReturnType<typeof createAdminClient>, email: string): Promise<string> {
  // Try to find via profiles table first (faster than listing all auth users)
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
  if (profile?.id) return profile.id;

  // Fallback: paginate through auth users
  let page = 1;
  while (page <= 10) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
    const users = data?.users as { id: string; email?: string }[] | undefined;
    const match = users?.find((u) => u.email === email);
    if (match) return match.id;
    if (!users?.length || users.length < 50) break;
    page++;
  }

  throw new Error(`User not found for email: ${email}`);
}
