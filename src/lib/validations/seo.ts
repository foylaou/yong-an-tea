import { z } from 'zod';

export const seoFormSchema = z.object({
  entity_type: z.enum(['product', 'blog', 'page']),
  entity_id: z.string().uuid().nullable().optional(),
  page_path: z.string().nullable().optional(),

  // Basic Meta
  meta_title: z.string().max(120, 'Meta Title 最多 120 字').nullable().optional(),
  meta_description: z.string().max(300, 'Meta Description 最多 300 字').nullable().optional(),
  meta_keywords: z.string().nullable().optional(),
  canonical_url: z.string().url('請輸入有效的 URL').nullable().optional().or(z.literal('')),

  // OpenGraph
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),
  og_type: z.string().optional(),

  // Twitter Card
  twitter_card: z.string().optional(),
  twitter_title: z.string().nullable().optional(),
  twitter_description: z.string().nullable().optional(),
  twitter_image: z.string().nullable().optional(),

  // Structured Data
  structured_data: z.string().nullable().optional(),

  // Crawling
  no_index: z.boolean().optional(),
  no_follow: z.boolean().optional(),
});

export type SEOFormData = z.infer<typeof seoFormSchema>;

export const seoApiSchema = z
  .object({
    entity_type: z.enum(['product', 'blog', 'page']),
    entity_id: z.string().uuid().nullable().optional(),
    page_path: z.string().nullable().optional(),

    meta_title: z.string().max(120).nullable().optional(),
    meta_description: z.string().max(300).nullable().optional(),
    meta_keywords: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional().or(z.literal('')).or(z.literal(null)),

    og_title: z.string().nullable().optional(),
    og_description: z.string().nullable().optional(),
    og_image: z.string().nullable().optional(),
    og_type: z.string().default('website'),

    twitter_card: z.string().default('summary_large_image'),
    twitter_title: z.string().nullable().optional(),
    twitter_description: z.string().nullable().optional(),
    twitter_image: z.string().nullable().optional(),

    structured_data: z.any().nullable().optional(),

    no_index: z.boolean().default(false),
    no_follow: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.entity_type === 'product' || data.entity_type === 'blog') {
        return !!data.entity_id;
      }
      return true;
    },
    { message: '商品或文章類型必須選擇目標', path: ['entity_id'] }
  )
  .refine(
    (data) => {
      if (data.entity_type === 'page') {
        return !!data.page_path;
      }
      return true;
    },
    { message: '頁面類型必須輸入路徑', path: ['page_path'] }
  );
