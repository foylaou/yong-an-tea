import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Resolves the logged-in member's own customers.id for their QR code —
 * the same encoding (`yat-customer:<id>`) POS already scans. `customers`
 * is deliberately separate from `profiles` (walk-in customers never have a
 * login), so a website/LINE member doesn't automatically have a customers
 * row; this finds one or creates it on first request.
 *
 * customers has admin-only RLS, so this uses the service role for the
 * lookup/create even though the route itself is gated by the caller's own
 * session, not an admin one.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, line_user_id')
    .eq('id', user.id)
    .single();

  const db = createAdminClient();

  const { data: byProfile } = await db.from('customers').select('id, name').eq('profile_id', user.id).maybeSingle();
  let customer = byProfile;

  if (!customer && profile?.line_user_id) {
    const { data: byLine } = await db
      .from('customers')
      .select('id, name')
      .eq('line_user_id', profile.line_user_id)
      .maybeSingle();
    if (byLine) {
      customer = byLine;
      // Backfill the link so this resolves via profile_id directly next time.
      await db.from('customers').update({ profile_id: user.id }).eq('id', byLine.id);
    }
  }

  if (!customer) {
    const { data: created, error } = await db
      .from('customers')
      .insert({
        profile_id: user.id,
        name: profile?.full_name || user.email || '會員',
        email: user.email,
        phone: profile?.phone,
        line_user_id: profile?.line_user_id,
      })
      .select('id, name')
      .single();

    if (error || !created) {
      console.error('[member-qr] failed to create customer row:', error);
      return NextResponse.json({ error: '建立會員資料失敗，請稍後再試' }, { status: 500 });
    }
    customer = created;
  }

  return NextResponse.json({ id: customer.id, name: customer.name });
}
