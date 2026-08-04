import { z } from 'zod';

export const fixedExpenseApiSchema = z.object({
  name: z.string().min(1, '名稱為必填'),
  amount: z.coerce.number().min(0, '金額不可為負數'),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, '月份格式錯誤'),
  category: z.enum(['房租', '人事', '其他']).default('其他'),
  note: z.string().nullable().optional(),
});

export type FixedExpenseApiData = z.infer<typeof fixedExpenseApiSchema>;

export const advancePaymentApiSchema = z.object({
  payee: z.string().min(1, '代墊對象為必填'),
  amount: z.coerce.number().min(0, '金額不可為負數'),
  advance_date: z.string().min(1, '代墊日期為必填'),
  status: z.enum(['outstanding', 'returned']).default('outstanding'),
  returned_date: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export type AdvancePaymentApiData = z.infer<typeof advancePaymentApiSchema>;
