import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateCartItems } from '@/lib/orders-db';
import { validateCoupon } from '@/lib/coupons-db';

async function verifyAdmin(supabase: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profile?.role !== 'admin') return null;
    return user;
}

/**
 * Live "does this code apply, and for how much" preview while building a
 * POS cart — mirrors /api/coupons/validate (storefront) but admin-gated
 * and taking the walk-in customer explicitly, since POS orders aren't tied
 * to the logged-in admin's own auth session. The actual order submission
 * (POST /api/admin/pos/orders) re-validates independently — this route is
 * only for the on-screen preview before checkout.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    const body = await request.json();
    const { code, items, walk_in_customer_id } = body;

    if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: '請輸入折扣碼' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: '購物車是空的' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    let profileId: string | null = null;
    let isWholesale = false;
    if (walk_in_customer_id) {
        const { data: customer } = await adminClient
            .from('customers')
            .select('profile_id, category')
            .eq('id', walk_in_customer_id)
            .maybeSingle();
        profileId = customer?.profile_id ?? null;
        isWholesale = customer?.category === 'wholesale';
    }

    const validation = await validateCartItems(items, { isWholesale });
    if (!validation.valid) {
        return NextResponse.json(
            { error: validation.errors[0] || '購物車商品驗證失敗' },
            { status: 400 }
        );
    }

    const result = await validateCoupon(
        code,
        profileId,
        validation.subtotal,
        items.map((i: { product_id: string }) => i.product_id)
    );

    if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
        valid: true,
        code: result.coupon!.code,
        discount_type: result.coupon!.discount_type,
        discount_value: result.coupon!.discount_value,
        discount_amount: result.discountAmount,
        description: result.coupon!.description,
    });
}
