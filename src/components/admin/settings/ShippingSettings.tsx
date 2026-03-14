'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  shippingSettingsSchema,
  type ShippingSettingsData,
} from '@/lib/validations/settings';

interface CodFeeTier {
  max: number;
  fee: number;
}

interface ShippingSettingsProps {
  initialData: Record<string, unknown>;
}

function parseTiers(raw: unknown): CodFeeTier[] {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [];
}

export default function ShippingSettings({ initialData }: ShippingSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [codTiers, setCodTiers] = useState<CodFeeTier[]>(
    parseTiers(initialData.cod_fee_tiers)
  );

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

  const addTier = () => {
    const lastMax = codTiers.length > 0 ? codTiers[codTiers.length - 1].max : 0;
    setCodTiers([...codTiers, { max: lastMax + 5000, fee: 0 }]);
  };
  const removeTier = (idx: number) => setCodTiers(codTiers.filter((_, i) => i !== idx));
  const updateTier = (idx: number, field: keyof CodFeeTier, val: number) => {
    setCodTiers(codTiers.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  };

  async function onSubmit(data: ShippingSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    // Sort tiers by max ascending
    const sortedTiers = [...codTiers]
      .filter((t) => t.max > 0)
      .sort((a, b) => a.max - b.max);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'shipping',
          settings: {
            ...data,
            cod_fee_tiers: JSON.stringify(sortedTiers),
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }
      setCodTiers(sortedTiers);
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

      {/* COD Fee Tiers */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">貨到付款代收手續費</h2>
            <p className="mt-1 text-xs text-gray-400">
              依訂單金額（含運費）級距收取代收手續費，僅在客戶選擇貨到付款時收取
            </p>
          </div>
          <button
            type="button"
            onClick={addTier}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            + 新增級距
          </button>
        </div>

        {codTiers.length === 0 ? (
          <p className="text-sm text-gray-400">尚未設定級距（貨到付款將不收取代收費）</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs font-medium text-gray-500">
              <span>金額上限（元）</span>
              <span>手續費（元/筆）</span>
              <span className="w-8" />
            </div>
            {codTiers.map((tier, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {idx === 0 ? '0' : codTiers[idx - 1].max.toLocaleString()} ~
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={tier.max}
                    onChange={(e) => updateTier(idx, 'max', Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  value={tier.fee}
                  onChange={(e) => updateTier(idx, 'fee', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => removeTier(idx)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="刪除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
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
