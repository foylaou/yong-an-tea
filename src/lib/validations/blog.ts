import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string().min(1, '文章標題為必填'),
  slug: z
    .string()
    .min(1, 'Slug 為必填')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug 格式不正確（僅小寫英文、數字和連字號）'
    ),
  date: z.string().min(1, '日期為必填'),
  author: z.string().min(1, '作者為必填'),
  category_item: z.string().nullable().optional(),
  desc_text: z.string().nullable().optional(),
  medium_image: z.string().nullable().optional(),
  masonry: z.string().nullable().optional(),
  large_image: z.string().nullable().optional(),
  extra_large_image: z.string().nullable().optional(),
  alt_image: z.string().nullable().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  blockquote_desc: z.string().nullable().optional(),
  single_img_one: z.string().nullable().optional(),
  single_img_two: z.string().nullable().optional(),
  single_img_alt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;

export const blogApiSchema = z.object({
  title: z.string().min(1, '文章標題為必填'),
  slug: z
    .string()
    .min(1, 'Slug 為必填')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正確'),
  date: z.string().min(1, '日期為必填'),
  author: z.string().min(1, '作者為必填'),
  category_item: z.string().nullable().optional(),
  desc_text: z.string().nullable().optional(),
  medium_image: z.string().nullable().optional(),
  masonry: z.string().nullable().optional(),
  large_image: z.string().nullable().optional(),
  extra_large_image: z.string().nullable().optional(),
  alt_image: z.string().nullable().optional(),
  tag_ids: z.array(z.string().uuid()).default([]),
  blockquote_desc: z.string().nullable().optional(),
  single_img_one: z.string().nullable().optional(),
  single_img_two: z.string().nullable().optional(),
  single_img_alt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  published: z.boolean().default(true),
});
