import { z } from 'zod';

// --- Client form schema ---
export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, '請選擇評分').max(5),
  title: z.string().max(100, '標題最多 100 字').optional(),
  content: z.string().min(10, '評價內容至少 10 字').max(1000, '評價內容最多 1000 字'),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// --- Admin status update schema ---
export const reviewAdminSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export type ReviewAdminValues = z.infer<typeof reviewAdminSchema>;
