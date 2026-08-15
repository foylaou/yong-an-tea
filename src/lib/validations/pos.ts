import { z } from 'zod';

export const posOrderItemSchema = z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().nullable().optional(),
    quantity: z.number().int().positive(),
});

export const posShippingAddressSchema = z.object({
    postal_code: z.string().optional(),
    city: z.string().min(1),
    district: z.string().min(1),
    address_line1: z.string().min(1),
    address_line2: z.string().optional(),
});

export const posOrderApiSchema = z
    .object({
        walk_in_customer_id: z.string().uuid().nullable().optional(),
        customer_name: z.string().min(1),
        customer_phone: z.string().optional().default(''),
        channel: z
            .enum(['website', 'phone', 'line', 'in_store'])
            .default('in_store'),
        payment_method: z.enum(['cash', 'line_pay', 'bank_transfer', 'cod']),
        is_paid: z.boolean().default(true),
        fulfillment: z.enum(['pickup', 'delivery']).default('pickup'),
        shipping_address: posShippingAddressSchema.optional(),
        items: z.array(posOrderItemSchema).min(1, '購物車不能是空的'),
        // Re-validated server-side against the live coupon record — never trust
        // a client-computed discount amount, only the code itself.
        coupon_code: z.string().trim().optional(),
    })
    .refine(
        (data) => data.fulfillment !== 'delivery' || !!data.shipping_address,
        {
            message: '寄到府需要填寫地址',
            path: ['shipping_address'],
        }
    );

export type PosOrderApiData = z.infer<typeof posOrderApiSchema>;
