'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  shippingSettingsSchema,
  type ShippingSettingsData,
} from '@/lib/validations/settings';

interface ShippingSettingsProps {
  initialData: Record<string, unknown>;
}

export default function ShippingSettings({ initialData }: ShippingSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingSettingsData>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      shipping_fee: Number(initialData.shipping_fee ?? 100),
      free_shipping_threshold: Number(initialData.free_shipping_threshold ?? 1500),
      shipping_note: (initialData.shipping_note as string) || '',
    },
  });

  async function onSubmit(data: ShippingSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'shipping', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">運費設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              固定運費（元）
            </label>
            <input
              type="number"
              {...register('shipping_fee', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.shipping_fee && (
              <p className="mt-1 text-sm text-red-600">{errors.shipping_fee.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              免運門檻（元）
            </label>
            <input
              type="number"
              {...register('free_shipping_threshold', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-400">
              設為 0 表示不啟用免運門檻
            </p>
            {errors.free_shipping_threshold && (
              <p className="mt-1 text-sm text-red-600">
                {errors.free_shipping_threshold.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              運費說明文字
            </label>
            <textarea
              rows={2}
              {...register('shipping_note')}
              placeholder="例如：滿 $1,500 免運費，一般宅配約 1-3 個工作天送達"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.shipping_note && (
              <p className="mt-1 text-sm text-red-600">{errors.shipping_note.message}</p>
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
