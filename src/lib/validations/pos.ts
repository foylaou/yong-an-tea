import { z } from 'zod';

export const posOrderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const posOrderApiSchema = z.object({
  walk_in_customer_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().min(1),
  customer_phone: z.string().optional().default(''),
  channel: z.enum(['website', 'phone', 'line', 'in_store']).default('in_store'),
  payment_method: z.enum(['cash', 'line_pay', 'bank_transfer', 'cod']),
  is_paid: z.boolean().default(true),
  items: z.array(posOrderItemSchema).min(1, '購物車不能是空的'),
});

export type PosOrderApiData = z.infer<typeof posOrderApiSchema>;
