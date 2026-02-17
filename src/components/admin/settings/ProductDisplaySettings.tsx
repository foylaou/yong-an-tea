'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  productDisplaySettingsSchema,
  type ProductDisplaySettingsData,
} from '@/lib/validations/settings';

interface ProductDisplaySettingsProps {
  initialData: Record<string, unknown>;
}

const sortOptions = [
  { value: 'newest', label: '最新上架' },
  { value: 'oldest', label: '最早上架' },
  { value: 'price_asc', label: '價格由低到高' },
  { value: 'price_desc', label: '價格由高到低' },
  { value: 'name_asc', label: '名稱 A-Z' },
  { value: 'name_desc', label: '名稱 Z-A' },
];

export default function ProductDisplaySettings({ initialData }: ProductDisplaySettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductDisplaySettingsData>({
    resolver: zodResolver(productDisplaySettingsSchema),
    defaultValues: {
      default_grid_columns: (initialData.default_grid_columns as number) || 4,
      products_per_page: (initialData.products_per_page as number) || 12,
      default_sort_order: (initialData.default_sort_order as ProductDisplaySettingsData['default_sort_order']) || 'newest',
    },
  });

  async function onSubmit(data: ProductDisplaySettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'product_display', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">商品顯示</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              商品列表欄數
            </label>
            <select
              {...register('default_grid_columns', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {[3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} 欄
                </option>
              ))}
            </select>
            {errors.default_grid_columns && (
              <p className="mt-1 text-sm text-red-600">{errors.default_grid_columns.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              每頁商品數
            </label>
            <input
              type="number"
              {...register('products_per_page', { valueAsNumber: true })}
              min={4}
              max={48}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-500">範圍：4 - 48</p>
            {errors.products_per_page && (
              <p className="mt-1 text-sm text-red-600">{errors.products_per_page.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              預設排序方式
            </label>
            <select
              {...register('default_sort_order')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.default_sort_order && (
              <p className="mt-1 text-sm text-red-600">{errors.default_sort_order.message}</p>
            )}
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
