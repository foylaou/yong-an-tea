import { createAdminClient } from './supabase/admin';
import type { Coupon } from '@/types/coupon';

// --- Coupon Validation ---

export interface CouponValidationResult {
    valid: boolean;
    coupon: Coupon | null;
    discountAmount: number;
    error?: string;
}

export async function validateCoupon(
    code: string,
    // null for POS walk-in customers with no linked website account (no
    // auth.users row to check/track usage against) — per_user_limit simply
    // can't be enforced for them, so that check is skipped rather than
    // rejecting every walk-in coupon redemption.
    userId: string | null,
    // customers.id (not profiles.id) — coupon_recipients is keyed by this
    // since that's the identity admin-coupon issuance already uses (a
    // customer doesn't need a website login to be issued a coupon). null
    // when there's no known customer at all (e.g. POS with nobody picked).
    customerId: string | null,
    subtotal: number,
    cartProductIds: string[]
): Promise<CouponValidationResult> {
    const supabase = createAdminClient();

    // Fetch coupon by code
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

    if (error || !coupon) {
        return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: '找不到此折扣碼',
        };
    }

    // Check is_active
    if (!coupon.is_active) {
        return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: '此折扣碼已停用',
        };
    }

    // Check date range
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: '此折扣碼尚未開始',
        };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: '此折扣碼已過期',
        };
    }

    // 限定發放 — only usable by an explicit coupon_recipients grant (admin
    // issue, or auto-granted alongside a welcome coupon push). Broadcasting
    // a coupon (create-time checkbox or 立即推播) flips is_public to true,
    // which is what makes it usable by everyone instead — see this
    // column's doc comment in types/coupon.ts.
    if (!coupon.is_public) {
        const isRecipient = customerId
            ? await isCouponRecipient(coupon.id, customerId)
            : false;
        if (!isRecipient) {
            return {
                valid: false,
                coupon: null,
                discountAmount: 0,
                error: '此折扣碼為限定發放，您尚未收到此優惠券',
            };
        }
    }

    // Check min_order_amount
    if (subtotal < Number(coupon.min_order_amount)) {
        return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: `訂單金額需滿 $${Number(coupon.min_order_amount).toLocaleString()} 才能使用此折扣碼`,
        };
    }

    // Check usage_limit
    if (
        coupon.usage_limit !== null &&
        coupon.used_count >= coupon.usage_limit
    ) {
        return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: '此折扣碼已達使用上限',
        };
    }

    // Check per_user_limit (skipped for walk-ins with no account — see userId's doc comment)
    if (userId) {
        const { count: userUsageCount } = await supabase
            .from('coupon_usages')
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id)
            .eq('user_id', userId);

        if ((userUsageCount ?? 0) >= coupon.per_user_limit) {
            return {
                valid: false,
                coupon: null,
                discountAmount: 0,
                error: '您已達此折扣碼的使用次數上限',
            };
        }
    }

    // Check product_ids restriction
    if (coupon.product_ids && coupon.product_ids.length > 0) {
        const hasMatchingProduct = cartProductIds.some((pid) =>
            coupon.product_ids!.includes(pid)
        );
        if (!hasMatchingProduct) {
            return {
                valid: false,
                coupon: null,
                discountAmount: 0,
                error: '此折扣碼不適用於您購物車中的商品',
            };
        }
    }

    // Check category_ids restriction
    if (coupon.category_ids && coupon.category_ids.length > 0) {
        const { data: productCategories } = await supabase
            .from('product_categories')
            .select('category_id')
            .in('product_id', cartProductIds);

        const cartCategoryIds = (productCategories ?? []).map(
            (pc: { category_id: string }) => pc.category_id
        );
        const hasMatchingCategory = coupon.category_ids.some((cid: string) =>
            cartCategoryIds.includes(cid)
        );
        if (!hasMatchingCategory) {
            return {
                valid: false,
                coupon: null,
                discountAmount: 0,
                error: '此折扣碼不適用於您購物車中的商品分類',
            };
        }
    }

    // Calculate discount
    let discountAmount = 0;
    const discountType = coupon.discount_type as string;
    const discountValue = Number(coupon.discount_value);

    if (discountType === 'percentage') {
        discountAmount = (subtotal * discountValue) / 100;
        if (coupon.max_discount !== null) {
            discountAmount = Math.min(
                discountAmount,
                Number(coupon.max_discount)
            );
        }
    } else if (discountType === 'fixed_amount') {
        discountAmount = Math.min(discountValue, subtotal);
    } else if (discountType === 'free_shipping') {
        // free_shipping is handled at the checkout level (set shippingFee = 0)
        discountAmount = 0;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return { valid: true, coupon: coupon as Coupon, discountAmount };
}

// --- Targeted Distribution (limited-issue coupons) ---

export async function isCouponRecipient(
    couponId: string,
    customerId: string
): Promise<boolean> {
    const supabase = createAdminClient();
    const { count } = await supabase
        .from('coupon_recipients')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', couponId)
        .eq('customer_id', customerId);
    return (count ?? 0) > 0;
}

/**
 * Grants one customer redemption rights on a non-public coupon. Called by
 * the admin QR-scan issue flow and by sendWelcomeCoupons() (a welcome
 * coupon auto-pushed to a new member needs this too, or they'd get a code
 * they can't actually use). Idempotent — re-issuing the same coupon to the
 * same customer is a no-op, not an error.
 */
export async function recordCouponRecipient(
    couponId: string,
    customerId: string
): Promise<void> {
    const supabase = createAdminClient();
    await supabase
        .from('coupon_recipients')
        .upsert(
            { coupon_id: couponId, customer_id: customerId },
            { onConflict: 'coupon_id,customer_id', ignoreDuplicates: true }
        );
}

// --- Record Coupon Usage ---

async function incrementCouponUsedCount(couponId: string): Promise<void> {
    const supabase = createAdminClient();
    const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

    if (coupon) {
        await supabase
            .from('coupons')
            .update({ used_count: (coupon.used_count ?? 0) + 1 })
            .eq('id', couponId);
    }
}

export async function recordCouponUsage(
    couponId: string,
    userId: string,
    orderId: string
): Promise<void> {
    const supabase = createAdminClient();

    // Insert usage record
    await supabase.from('coupon_usages').insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId,
    });

    await incrementCouponUsedCount(couponId);
}

/**
 * POS walk-in variant — coupon_usages.user_id is NOT NULL (references
 * auth.users), so a customer with no linked website account can't get a
 * usage row there; still bump the coupon's overall used_count so its
 * usage_limit stays accurate.
 */
export async function recordCouponUsageAnonymous(
    couponId: string
): Promise<void> {
    await incrementCouponUsedCount(couponId);
}
