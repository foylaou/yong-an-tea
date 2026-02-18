import { z } from 'zod';

export const subscribeApiSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
});

export const newsletterFormSchema = z.object({
  subject: z.string().min(1, '主旨為必填'),
  content_html: z.string().min(1, '內容為必填'),
});
