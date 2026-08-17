export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface Coupon {
    id: string;
    code: string;
    description: string;
    discount_type: DiscountType;
    discount_value: number;
    min_order_amount: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    per_user_limit: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    product_ids: string[] | null;
    category_ids: string[] | null;
    is_welcome_coupon: boolean;
    // false = "限定發放" — only usable by whoever has a coupon_recipients row
    // for it (admin-issued via the QR scan flow, or auto-granted to new
    // members via is_welcome_coupon). Flips to true the moment it's ever
    // broadcast (create-time checkbox or the standalone 立即推播 button) —
    // see validateCoupon()'s doc in coupons-db.ts for the enforcement.
    is_public: boolean;
    created_at: string;
    updated_at: string;
}
