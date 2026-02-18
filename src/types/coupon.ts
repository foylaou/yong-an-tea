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
  created_at: string;
  updated_at: string;
}
