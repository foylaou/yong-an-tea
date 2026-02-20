'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  cartPageSettingsSchema,
  type CartPageSettingsData,
} from '@/lib/validations/settings';

interface ThItem {
  id: string;
  thName: string;
  thCName: string;
}

interface CartPageSettingsProps {
  initialData: Record<string, unknown>;
}

function parseJson<T>(data: Record<string, unknown>, key: string, fallback: T): T {
  try {
    const raw = data[key] as string;
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function CartPageSettings({ initialData }: CartPageSettingsProps) {
  // JSON field via state
  const [thItems, setThItems] = useState<ThItem[]>(() => parseJson(initialData, 'cart_th_list_json', []));

  // Text fields via useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CartPageSettingsData>({
    resolver: zodResolver(cartPageSettingsSchema),
    defaultValues: {
      cart_th_list_json: (initialData.cart_th_list_json as string) || '',
      cart_coupon_title: (initialData.cart_coupon_title as string) || '',
      cart_coupon_desc: (initialData.cart_coupon_desc as string) || '',
      cart_coupon_btn_text: (initialData.cart_coupon_btn_text as string) || '',
      cart_shop_page_btn_text: (initialData.cart_shop_page_btn_text as string) || '',
      cart_clear_btn_text: (initialData.cart_clear_btn_text as string) || '',
      cart_proceed_btn_text: (initialData.cart_proceed_btn_text as string) || '',
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addThItem() {
    setThItems([...thItems, { id: `th-${Date.now()}`, thName: '', thCName: '' }]);
  }

  function removeThItem(index: number) {
    setThItems(thItems.filter((_, i) => i !== index));
  }

  function updateThItem(index: number, field: 'thName' | 'thCName', value: string) {
    const updated = [...thItems];
    updated[index] = { ...updated[index], [field]: value };
    setThItems(updated);
  }

  async function onSubmit(data: CartPageSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'cart_page',
          settings: {
            ...data,
            cart_th_list_json: JSON.stringify(thItems),
          },
        }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">購物車頁面設定</h2>

        <div className="space-y-4">
          {/* Table Header Visual Editor */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">表頭欄位</label>
              <button type="button" onClick={addThItem}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                + 新增欄位
              </button>
            </div>
            {thItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">尚無表頭欄位，請點擊「新增欄位」</p>
            ) : (
              <div className="space-y-2">
                {thItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input type="text" value={item.thName} onChange={(e) => updateThItem(index, 'thName', e.target.value)}
                      placeholder="欄位名稱" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                    <input type="text" value={item.thCName} onChange={(e) => updateThItem(index, 'thCName', e.target.value)}
                      placeholder="CSS 樣式（進階）" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                    <button type="button" onClick={() => removeThItem(index)}
                      className="text-xs text-red-600 hover:text-red-800">刪除</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">優惠券標題</label>
            <input type="text" {...register('cart_coupon_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.cart_coupon_title && <p className="mt-1 text-sm text-red-600">{errors.cart_coupon_title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">優惠券描述</label>
            <input type="text" {...register('cart_coupon_desc')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.cart_coupon_desc && <p className="mt-1 text-sm text-red-600">{errors.cart_coupon_desc.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">優惠券按鈕文字</label>
            <input type="text" {...register('cart_coupon_btn_text')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.cart_coupon_btn_text && <p className="mt-1 text-sm text-red-600">{errors.cart_coupon_btn_text.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">繼續購物按鈕文字</label>
            <input type="text" {...register('cart_shop_page_btn_text')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.cart_shop_page_btn_text && <p className="mt-1 text-sm text-red-600">{errors.cart_shop_page_btn_text.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">清空購物車按鈕文字</label>
            <input type="text" {...register('cart_clear_btn_text')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.cart_clear_btn_text && <p className="mt-1 text-sm text-red-600">{errors.cart_clear_btn_text.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">結帳按鈕文字</label>
            <input type="text" {...register('cart_proceed_btn_text')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.cart_proceed_btn_text && <p className="mt-1 text-sm text-red-600">{errors.cart_proceed_btn_text.message}</p>}
          </div>
        </div>
      </section>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">設定已成功儲存</div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  );
}
