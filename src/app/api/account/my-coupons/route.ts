import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * The logged-in member's own usable coupon list, for the LIFF "我的優惠券"
 * page. Two sources, merged: every public coupon (is_public = true — the
 * same pool the LINE bot's "優惠" keyword shows), plus any 限定發放 coupon
 * this specific member has an explicit coupon_recipients grant for (admin
 * QR-issue, or auto-granted alongside a welcome coupon). Personalized on
 * top of that: a coupon the member has already redeemed up to its
 * per_user_limit drops off the list. Since that's exactly what
 * validateCoupon() checks at redemption time too, a coupon simply
 * disappearing here after checkout *is* the "used once → gone" behavior —
 * no separate "mark as used" step needed.
 */
export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const db = createAdminClient();
    const nowIso = new Date().toISOString();

    const selectCols =
        'id, code, description, discount_type, discount_value, min_order_amount, expires_at, starts_at, per_user_limit';

    const { data: customer } = await db
        .from('customers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    const [{ data: publicCoupons, error }, recipientRows] = await Promise.all([
        db
            .from('coupons')
            .select(selectCols)
            .eq('is_active', true)
            .eq('is_public', true)
            .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
            .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
            .order('created_at', { ascending: false }),
        customer
            ? db
                  .from('coupon_recipients')
                  .select('coupon_id')
                  .eq('customer_id', customer.id)
            : Promise.resolve({ data: [] as { coupon_id: string }[] }),
    ]);

    if (error) {
        return NextResponse.json({ error: '讀取優惠券失敗' }, { status: 500 });
    }

    const issuedIds = (recipientRows.data ?? []).map((r) => r.coupon_id);
    let issuedCoupons: typeof publicCoupons = [];
    if (issuedIds.length) {
        const { data } = await db
            .from('coupons')
            .select(selectCols)
            .eq('is_active', true)
            .in('id', issuedIds)
            .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
            .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
        issuedCoupons = data ?? [];
    }

    const seen = new Set<string>();
    const coupons = [...(publicCoupons ?? []), ...issuedCoupons].filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
    });

    if (!coupons.length) {
        return NextResponse.json({ coupons: [] });
    }

    const { data: usages } = await db
        .from('coupon_usages')
        .select('coupon_id')
        .eq('user_id', user.id)
        .in(
            'coupon_id',
            coupons.map((c) => c.id)
        );

    const usedCounts = new Map<string, number>();
    for (const u of usages ?? []) {
        usedCounts.set(u.coupon_id, (usedCounts.get(u.coupon_id) ?? 0) + 1);
    }

    const usable = coupons
        .filter((c) => (usedCounts.get(c.id) ?? 0) < c.per_user_limit)
        .map((c) => ({
            code: c.code,
            description: c.description,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            min_order_amount: c.min_order_amount,
            expires_at: c.expires_at,
        }));

    return NextResponse.json({ coupons: usable });
}
