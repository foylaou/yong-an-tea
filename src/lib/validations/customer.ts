import { z } from 'zod';

export const customerApiSchema = z.object({
  name: z.string().min(1, '姓名為必填'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email 格式不正確').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  birthday: z.string().optional().nullable(),
  tea_preference: z.string().optional().nullable(),
  category: z.enum(['regular', 'wholesale']).optional(),
  note: z.string().optional().nullable(),
});

export type CustomerApiData = z.infer<typeof customerApiSchema>;

// Minimal shape for the POS quick-add flow (name + phone only)
export const customerQuickAddSchema = z.object({
  name: z.string().min(1, '姓名為必填'),
  phone: z.string().min(1, '電話為必填'),
});

export type CustomerQuickAddData = z.infer<typeof customerQuickAddSchema>;
