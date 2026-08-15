import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * The logged-in member's own usable coupon list, for the LIFF "我的優惠券"
 * page. Same coupon pool as the LINE bot's "優惠" keyword reply (any
 * active, in-date coupon — there's no per-customer "issued to you"
 * concept), but personalized: a coupon the member has already redeemed up
 * to its per_user_limit drops off the list. Since that's exactly what
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

    const { data: coupons, error } = await db
        .from('coupons')
        .select(
            'id, code, description, discount_type, discount_value, min_order_amount, expires_at, starts_at, per_user_limit'
        )
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: '讀取優惠券失敗' }, { status: 500 });
    }
    if (!coupons?.length) {
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
