import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(1, '分類名稱為必填'),
  slug: z.string().min(1, 'Slug 為必填').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正確（僅小寫英文、數字和連字號）'),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Schema for API routes that receive JSON (needs coercion from string → number)
export const categoryApiSchema = z.object({
  name: z.string().min(1, '分類名稱為必填'),
  slug: z.string().min(1, 'Slug 為必填').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正確'),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});
