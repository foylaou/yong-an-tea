'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productDisplaySettingsSchema, type ProductDisplaySettingsData } from '@/lib/validations/settings';

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
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">商品顯示</h2>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">商品列表欄數</legend>
              <select {...register('default_grid_columns', { valueAsNumber: true })} className="select w-full">
                {[3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} 欄
                  </option>
                ))}
              </select>
              {errors.default_grid_columns && <p className="text-error mt-1 text-sm">{errors.default_grid_columns.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">每頁商品數</legend>
              <input type="number" {...register('products_per_page', { valueAsNumber: true })} min={4} max={48} className="input w-full" />
              <p className="text-base-content/50 mt-1 text-xs">範圍：4 - 48</p>
              {errors.products_per_page && <p className="text-error mt-1 text-sm">{errors.products_per_page.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">預設排序方式</legend>
              <select {...register('default_sort_order')} className="select w-full">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.default_sort_order && <p className="text-error mt-1 text-sm">{errors.default_sort_order.message}</p>}
            </fieldset>
          </div>
        </div>
      </div>

      {serverError && <div className="alert alert-error text-sm">{serverError}</div>}
      {success && <div className="alert alert-success text-sm">設定已成功儲存</div>}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  );
}
