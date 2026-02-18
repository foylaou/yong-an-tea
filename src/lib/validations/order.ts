import { z } from 'zod';

// --- Checkout Form Schema (for react-hook-form) ---

export const checkoutFormSchema = z.object({
  customer_name: z.string().min(1, '收件人姓名為必填'),
  customer_email: z.string().email('Email 格式不正確'),
  customer_phone: z.string().min(1, '聯絡電話為必填').regex(/^0[0-9]{8,9}$/, '請輸入有效的台灣電話號碼'),
  postal_code: z.string().optional(),
  city: z.string().min(1, '縣市為必填'),
  district: z.string().min(1, '鄉鎮區為必填'),
  address_line1: z.string().min(1, '地址為必填'),
  address_line2: z.string().optional(),
  payment_method: z.enum(['line_pay', 'bank_transfer', 'cod']),
  note: z.string().optional(),
  save_address: z.boolean().optional(),
  coupon_code: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// --- Create Order API Schema (server-side) ---

export const createOrderApiSchema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  shipping_address: z.object({
    postal_code: z.string().optional(),
    city: z.string().min(1),
    district: z.string().min(1),
    address_line1: z.string().min(1),
    address_line2: z.string().optional(),
  }),
  payment_method: z.enum(['line_pay', 'bank_transfer', 'cod']),
  note: z.string().optional().default(''),
  save_address: z.boolean().optional().default(false),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1, '購物車不能為空'),
  coupon_code: z.string().optional(),
});

export type CreateOrderApiData = z.infer<typeof createOrderApiSchema>;

// --- Update Order Status Schema (admin) ---

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded']),
  tracking_number: z.string().optional(),
});

export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
