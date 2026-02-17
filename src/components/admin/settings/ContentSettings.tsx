'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contentSettingsSchema,
  type ContentSettingsData,
} from '@/lib/validations/settings';

interface ContentSettingsProps {
  initialData: Record<string, unknown>;
}

const fields: { key: keyof ContentSettingsData; label: string; placeholder: string }[] = [
  { key: 'section_title_bestselling', label: '暢銷商品 區塊標題', placeholder: '暢銷商品' },
  { key: 'section_title_latest_blog', label: '最新文章 區塊標題', placeholder: '最新文章' },
  { key: 'section_title_explore_blog', label: '探索部落格 區塊標題', placeholder: '探索我們的部落格' },
  { key: 'section_title_popular_products', label: '熱門商品 區塊標題', placeholder: 'Popular Products' },
  { key: 'section_title_newsletter', label: '電子報 區塊標題', placeholder: '訂閱電子報' },
  { key: 'newsletter_desc', label: '電子報 描述文字', placeholder: '訂閱我們的電子報，享有 50% 折扣優惠' },
  { key: 'section_title_newsletter_v3', label: '電子報 V3 標題', placeholder: '註冊即享 50% 折扣' },
  { key: 'newsletter_desc_v3', label: '電子報 V3 描述', placeholder: '訂閱我們的電子報即享 50% 折扣優惠。顧客的喜悅是我們最大的榮幸。' },
  { key: 'new_arrival_title', label: '新品到貨 標題', placeholder: 'New Arrival' },
  { key: 'new_arrival_desc', label: '新品到貨 描述', placeholder: 'On the other hand, we denounce...' },
  { key: 'new_arrival_excerpt', label: '新品到貨 摘要', placeholder: '多年來已發展出各種版本...' },
  { key: 'btn_shop_now', label: '按鈕：立即選購', placeholder: '立即選購' },
  { key: 'btn_view_more', label: '按鈕：查看更多', placeholder: '查看更多' },
  { key: 'btn_view_all', label: '按鈕：查看全部', placeholder: '查看全部' },
  { key: 'btn_all_products', label: '按鈕：所有商品', placeholder: 'All Products' },
  { key: 'btn_load_more', label: '按鈕：載入更多', placeholder: '載入更多' },
  { key: 'btn_all_loaded', label: '全部載入完畢 文字', placeholder: '所有商品已載入完畢！' },
  { key: 'btn_subscribe', label: '按鈕：訂閱', placeholder: '訂閱' },
  { key: 'email_placeholder', label: 'Email 欄位提示文字', placeholder: '您的電子郵件地址' },
];

export default function ContentSettings({ initialData }: ContentSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const defaultValues: ContentSettingsData = {};
  for (const f of fields) {
    defaultValues[f.key] = (initialData[f.key] as string) || '';
  }

  const {
    register,
    handleSubmit,
  } = useForm<ContentSettingsData>({
    resolver: zodResolver(contentSettingsSchema),
    defaultValues,
  });

  async function onSubmit(data: ContentSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    // Only send non-empty values
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v && v.trim()) filtered[k] = v.trim();
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'content', settings: filtered }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setServerError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">區塊標題</h2>
        <p className="mb-4 text-sm text-gray-500">留空則使用預設值</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.slice(0, 11).map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {f.label}
              </label>
              <input
                type="text"
                {...register(f.key)}
                placeholder={f.placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">按鈕文字</h2>
        <p className="mb-4 text-sm text-gray-500">留空則使用預設值</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.slice(11).map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {f.label}
              </label>
              <input
                type="text"
                {...register(f.key)}
                placeholder={f.placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          ))}
        </div>
      </section>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">設定已成功儲存</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  );
}
