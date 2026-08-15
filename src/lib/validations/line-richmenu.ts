import { z } from 'zod';

export const richMenuActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({ type: z.literal('uri'), uri: z.string().url('請輸入完整網址') }),
  // Resolved to a uri action (https://liff.line.me/{liffId}{path}) at apply
  // time — see LIFF_FEATURES in line-richmenu.ts. Picking from the list
  // instead of typing a raw URL means the admin can't paste a stale liffId
  // or typo the path.
  z.object({ type: z.literal('liff'), path: z.string().min(1, '請選擇 LIFF 頁面') }),
  z.object({ type: z.literal('message'), text: z.string().min(1, '請輸入訊息內容') }),
  z.object({
    type: z.literal('postback'),
    data: z.string().min(1, '請輸入 postback data'),
    displayText: z.string().optional(),
  }),
  // Resolved to a richMenuAliasId at apply time — see line-richmenu.ts.
  z.object({ type: z.literal('richmenuswitch'), targetMenuName: z.string().min(1, '請選擇要切換到的選單') }),
]);

export const richMenuButtonSchema = z.object({
  label: z.string(), // admin-facing only, not sent to LINE
  action: richMenuActionSchema,
});

export const richMenuFormSchema = z.object({
  name: z
    .string()
    .min(1, '名稱為必填')
    .max(32, '名稱最多 32 字')
    .regex(/^[a-zA-Z0-9_-]+$/, '名稱只能包含英數字、底線、連字號（會被用來當作選單代稱）'),
  chat_bar_text: z.string().min(1, '請輸入選單標籤文字').max(14, '選單標籤文字最多 14 字'),
  template: z.enum(['1x1', '2x1', '3x1', '1x2', '2x2', '3x2']),
  buttons: z.array(richMenuButtonSchema),
  image_url: z.string().nullable(),
  target: z.enum(['all', 'admin']),
});

export type RichMenuFormData = z.infer<typeof richMenuFormSchema>;
export type RichMenuButtonData = z.infer<typeof richMenuButtonSchema>;
export type RichMenuActionData = z.infer<typeof richMenuActionSchema>;
