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
  // Set when POS staff verified this customer is an existing website member
  // (via the email-OTP check), linking their POS record to their profile.
  profile_id: z.string().uuid().optional().nullable(),
});

export type CustomerApiData = z.infer<typeof customerApiSchema>;
