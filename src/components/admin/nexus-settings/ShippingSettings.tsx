'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingSettingsSchema, type ShippingSettingsData } from '@/lib/validations/settings';

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
        body: JSON.stringify({
          group: 'shipping',
          settings: {
            ...data,
            cod_fee_tiers: (initialData.cod_fee_tiers as string) || '[]',
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
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">運費設定</h2>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">固定運費（元）</legend>
              <input type="number" {...register('shipping_fee', { valueAsNumber: true })} className="input w-full" />
              {errors.shipping_fee && <p className="text-error mt-1 text-sm">{errors.shipping_fee.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">免運門檻（元）</legend>
              <input type="number" {...register('free_shipping_threshold', { valueAsNumber: true })} className="input w-full" />
              <p className="text-base-content/50 mt-1 text-xs">設為 0 表示不啟用免運門檻</p>
              {errors.free_shipping_threshold && <p className="text-error mt-1 text-sm">{errors.free_shipping_threshold.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">運費說明文字</legend>
              <textarea rows={2} {...register('shipping_note')} placeholder="例如：滿 $1,500 免運費，一般宅配約 1-3 個工作天送達" className="textarea w-full" />
              {errors.shipping_note && <p className="text-error mt-1 text-sm">{errors.shipping_note.message}</p>}
            </fieldset>
          </div>
        </div>
      </div>

      <div className="alert alert-info text-sm">貨到付款代收手續費已移至「付款方式」設定頁面管理</div>

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
