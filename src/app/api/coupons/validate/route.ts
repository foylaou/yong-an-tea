import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateCoupon } from '@/lib/coupons-db';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const body = await request.json();
    const { code, subtotal, product_ids } = body;

    if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: '請輸入折扣碼' }, { status: 400 });
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
        return NextResponse.json({ error: '無效的訂單金額' }, { status: 400 });
    }

    // Targeted-coupon check needs customers.id, not this profile's own id —
    // find (not create) the customers row this login is linked to, if any.
    const { data: customer } = await createAdminClient()
        .from('customers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    const result = await validateCoupon(
        code,
        user.id,
        customer?.id ?? null,
        subtotal,
        Array.isArray(product_ids) ? product_ids : []
    );

    if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
        valid: true,
        discount_type: result.coupon!.discount_type,
        discount_value: result.coupon!.discount_value,
        discount_amount: result.discountAmount,
        description: result.coupon!.description,
    });
}
