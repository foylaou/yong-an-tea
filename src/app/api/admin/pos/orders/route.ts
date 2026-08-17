import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { posOrderApiSchema } from '@/lib/validations/pos';
import {
    createOrder,
    validateCartItems,
    calculateLoyaltyDiscount,
    getShippingSettings,
    calculateShippingFee,
} from '@/lib/orders-db';
import {
    validateCoupon,
    recordCouponUsage,
    recordCouponUsageAnonymous,
} from '@/lib/coupons-db';

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
 * Manual in-store order entry (銷售模式). Unlike the storefront's
 * POST /api/orders, this never requires the customer to be logged in —
 * it links to a `customers` row (walk_in_customer_id) instead of an
 * auth-backed profile, and skips shipping/coupon logic since it's an
 * immediate in-person sale.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    const body = await request.json();
    const result = posOrderApiSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: '驗證失敗', details: result.error.flatten() },
            { status: 400 }
        );
    }

    const data = result.data;
    const adminClient = createAdminClient();

    // 折扣金額、運費、批發身分都由後端重新查詢/計算，不信任前端傳來的數字
    let customer: {
        discount_type: 'percentage' | 'fixed_amount' | null;
        discount_value: number;
        category: string;
        profile_id: string | null;
    } | null = null;
    if (data.walk_in_customer_id) {
        const { data: found } = await adminClient
            .from('customers')
            .select('discount_type, discount_value, category, profile_id')
            .eq('id', data.walk_in_customer_id)
            .maybeSingle();
        customer = found;
    }
    const isWholesale = customer?.category === 'wholesale';

    const needsSubtotal =
        !!customer?.discount_type ||
        data.fulfillment === 'delivery' ||
        !!data.coupon_code;
    const validation = needsSubtotal
        ? await validateCartItems(data.items, { isWholesale })
        : null;

    const loyaltyDiscount =
        customer?.discount_type && validation
            ? calculateLoyaltyDiscount(
                  validation.subtotal,
                  customer.discount_type,
                  customer.discount_value
              )
            : 0;

    // Coupon stacks with the loyal-customer discount rather than replacing it
    // — same convention as the storefront (loyalty is a standing account
    // perk, a coupon is a one-off promo). Re-validated here against the
    // live coupon record regardless of what the client showed at scan time.
    let couponResult: Awaited<ReturnType<typeof validateCoupon>> | null = null;
    if (data.coupon_code && validation) {
        couponResult = await validateCoupon(
            data.coupon_code,
            customer?.profile_id ?? null,
            data.walk_in_customer_id ?? null,
            validation.subtotal,
            data.items.map((i) => i.product_id)
        );
        if (!couponResult.valid) {
            return NextResponse.json(
                { error: couponResult.error || '折扣碼無效' },
                { status: 400 }
            );
        }
    }

    const discountAmount =
        loyaltyDiscount + (couponResult?.discountAmount ?? 0);

    // 現場取貨維持原本寫死行為；寄到府則比照 storefront 結帳邏輯算出真運費
    let shippingFee = 0;
    let shippingMethod = 'pickup';
    if (data.fulfillment === 'delivery' && validation) {
        const shippingSettings = await getShippingSettings();
        shippingFee = calculateShippingFee(
            validation.subtotal,
            shippingSettings.shipping_fee,
            shippingSettings.free_shipping_threshold
        );
        shippingMethod = 'tcat';
    }

    // free_shipping coupons don't produce a discount_amount (see
    // validateCoupon's comment) — they work by zeroing the fee directly,
    // same as the storefront's /api/orders. Without this, the coupon
    // "validates" successfully but visibly does nothing.
    if (couponResult?.coupon?.discount_type === 'free_shipping') {
        shippingFee = 0;
    }

    let orderResult;
    try {
        orderResult = await createOrder({
            walk_in_customer_id: data.walk_in_customer_id ?? undefined,
            channel: data.channel,
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            shipping_address:
                data.fulfillment === 'delivery'
                    ? data.shipping_address
                    : undefined,
            payment_method: data.payment_method,
            shipping_method: shippingMethod,
            shipping_fee: shippingFee,
            cod_fee: 0,
            note: '',
            items: data.items,
            discount_amount: discountAmount,
            coupon_code: couponResult?.coupon?.code,
            is_wholesale: isWholesale,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '建立訂單失敗';
        return NextResponse.json({ error: message }, { status: 400 });
    }

    if (couponResult?.coupon) {
        // profile_id present → linked website member, track like any other
        // coupon redemption; otherwise (walk-in with no account) just bump the
        // coupon's overall used_count — see recordCouponUsageAnonymous's doc.
        if (customer?.profile_id) {
            await recordCouponUsage(
                couponResult.coupon.id,
                customer.profile_id,
                orderResult.order_id
            );
        } else {
            await recordCouponUsageAnonymous(couponResult.coupon.id);
        }
    }

    // In-store sales are handed over immediately — mark fulfilled right away,
    // and reflect whether payment was actually collected.
    const now = new Date().toISOString();
    const paymentStatus = data.is_paid ? 'paid' : 'pending';

    await adminClient
        .from('orders')
        .update({
            status: 'completed',
            payment_status: paymentStatus,
            completed_at: now,
            ...(data.is_paid && { paid_at: now }),
        })
        .eq('id', orderResult.order_id);

    await adminClient.from('payments').insert({
        order_id: orderResult.order_id,
        method: data.payment_method,
        status: paymentStatus,
        amount: orderResult.total,
        ...(data.is_paid && { paid_at: now }),
    });

    return NextResponse.json({ order: orderResult });
}
