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
  userId: string,
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
    return { valid: false, coupon: null, discountAmount: 0, error: '找不到此折扣碼' };
  }

  // Check is_active
  if (!coupon.is_active) {
    return { valid: false, coupon: null, discountAmount: 0, error: '此折扣碼已停用' };
  }

  // Check date range
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, coupon: null, discountAmount: 0, error: '此折扣碼尚未開始' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, coupon: null, discountAmount: 0, error: '此折扣碼已過期' };
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
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, coupon: null, discountAmount: 0, error: '此折扣碼已達使用上限' };
  }

  // Check per_user_limit
  const { count: userUsageCount } = await supabase
    .from('coupon_usages')
    .select('*', { count: 'exact', head: true })
    .eq('coupon_id', coupon.id)
    .eq('user_id', userId);

  if ((userUsageCount ?? 0) >= coupon.per_user_limit) {
    return { valid: false, coupon: null, discountAmount: 0, error: '您已達此折扣碼的使用次數上限' };
  }

  // Check product_ids restriction
  if (coupon.product_ids && coupon.product_ids.length > 0) {
    const hasMatchingProduct = cartProductIds.some((pid) =>
      coupon.product_ids!.includes(pid)
    );
    if (!hasMatchingProduct) {
      return { valid: false, coupon: null, discountAmount: 0, error: '此折扣碼不適用於您購物車中的商品' };
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
      return { valid: false, coupon: null, discountAmount: 0, error: '此折扣碼不適用於您購物車中的商品分類' };
    }
  }

  // Calculate discount
  let discountAmount = 0;
  const discountType = coupon.discount_type as string;
  const discountValue = Number(coupon.discount_value);

  if (discountType === 'percentage') {
    discountAmount = subtotal * discountValue / 100;
    if (coupon.max_discount !== null) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
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

// --- Record Coupon Usage ---

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

  // Increment used_count
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
