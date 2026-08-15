import { z } from 'zod';

// react-hook-form's `valueAsNumber: true` reads the DOM's native
// `input.valueAsNumber`, which is NaN — not null, not undefined — for an
// empty type="number" field. z.number().nullable() only special-cases
// literal null, so NaN fails the base number check ("leave it blank" gets
// silently rejected with no visible error, since these fields don't render
// their error message).
//
// z.preprocess() would fix this at the schema level, but it makes the
// schema's input type diverge from its output type (input accepts
// `unknown`), which breaks zodResolver's generic inference against
// useForm<CouponFormData>() (TS2719 "two different Resolver types").
// Simpler to keep the schema a plain number|null and strip NaN→null at the
// react-hook-form registration instead — see CouponForm's `setValueAs` on
// these two fields.
const nanToNull = (v: unknown) =>
    typeof v === 'number' && Number.isNaN(v) ? null : v;

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
    // Standing "send to every new member as they bind LINE" — a one-time
    // broadcast to *current* LINE members is a separate action, not a form
    // field (see CouponForm's 立即推播 button / POST .../broadcast).
    is_welcome_coupon: z.boolean(),
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
    max_discount: z.preprocess(
        nanToNull,
        z.coerce.number().min(0).nullable().optional()
    ),
    usage_limit: z.preprocess(
        nanToNull,
        z.coerce.number().int().min(1).nullable().optional()
    ),
    per_user_limit: z.coerce.number().int().min(1).default(1),
    starts_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    product_ids: z.array(z.string().uuid()).nullable().optional(),
    category_ids: z.array(z.string().uuid()).nullable().optional(),
    is_welcome_coupon: z.boolean().default(false),
});

export type CouponApiData = z.infer<typeof couponApiSchema>;
