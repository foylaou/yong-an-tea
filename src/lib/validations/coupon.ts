import { z } from 'zod';

// --- Coupon Form Schema (for react-hook-form) ---

export const couponFormSchema = z.object({
  code: z
    .string()
    .min(1, '折扣碼為必填')
    .max(50, '折扣碼最多 50 字')
    .regex(/^[A-Za-z0-9_-]+$/, '折扣碼只能包含英數字、底線、連字號'),
  description: z.string(),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  discount_value: z.number().min(0, '折扣值不能為負'),
  min_order_amount: z.number().min(0, '最低訂單金額不能為負'),
  max_discount: z.number().min(0).nullable(),
  usage_limit: z.number().int().min(1).nullable(),
  per_user_limit: z.number().int().min(1),
  starts_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  is_active: z.boolean(),
  product_ids: z.array(z.string().uuid()).nullable(),
  category_ids: z.array(z.string().uuid()).nullable(),
});

export type CouponFormData = z.infer<typeof couponFormSchema>;

// --- Coupon API Schema (server-side with coercion) ---

export const couponApiSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/),
  description: z.string().optional().default(''),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  discount_value: z.coerce.number().min(0),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_discount: z.coerce.number().min(0).nullable().optional(),
  usage_limit: z.coerce.number().int().min(1).nullable().optional(),
  per_user_limit: z.coerce.number().int().min(1).default(1),
  starts_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  product_ids: z.array(z.string().uuid()).nullable().optional(),
  category_ids: z.array(z.string().uuid()).nullable().optional(),
});

export type CouponApiData = z.infer<typeof couponApiSchema>;
