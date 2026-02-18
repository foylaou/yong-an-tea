import { z } from 'zod';

// --- Address Form Schema (for react-hook-form) ---

export const addressFormSchema = z.object({
  label: z.string().min(1, '地址標籤為必填'),
  recipient_name: z.string().min(1, '收件人姓名為必填'),
  phone: z.string().min(1, '聯絡電話為必填').regex(/^0[0-9]{8,9}$/, '請輸入有效的台灣電話號碼'),
  postal_code: z.string().optional(),
  city: z.string().min(1, '縣市為必填'),
  district: z.string().min(1, '鄉鎮區為必填'),
  address_line1: z.string().min(1, '地址為必填'),
  address_line2: z.string().optional(),
  is_default: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

// --- Address API Schema (server-side, with defaults) ---

export const addressApiSchema = z.object({
  label: z.string().min(1).default('住家'),
  recipient_name: z.string().min(1),
  phone: z.string().min(1),
  postal_code: z.string().optional().default(''),
  city: z.string().min(1),
  district: z.string().min(1),
  address_line1: z.string().min(1),
  address_line2: z.string().optional().default(''),
  is_default: z.boolean().default(false),
});

export type AddressApiData = z.infer<typeof addressApiSchema>;
