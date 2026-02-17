'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  currencySettingsSchema,
  type CurrencySettingsData,
} from '@/lib/validations/settings';

interface CurrencySettingsProps {
  initialData: Record<string, unknown>;
}

export default function CurrencySettings({ initialData }: CurrencySettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Convert array to comma-separated string for the form
  const currenciesDefault = Array.isArray(initialData.available_currencies)
    ? (initialData.available_currencies as string[]).join(',')
    : (initialData.available_currencies as string) || 'TWD,USD,EUR';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurrencySettingsData>({
    resolver: zodResolver(currencySettingsSchema),
    defaultValues: {
      default_currency: (initialData.default_currency as string) || 'TWD',
      currency_symbol: (initialData.currency_symbol as string) || '$',
      decimal_places: (initialData.decimal_places as number) ?? 2,
      available_currencies: currenciesDefault,
    },
  });

  async function onSubmit(data: CurrencySettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      // Split comma-separated currencies into array for API
      const payload = {
        ...data,
        available_currencies: data.available_currencies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'currency', settings: payload }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">幣別設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              預設幣別
            </label>
            <select
              {...register('default_currency')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="TWD">TWD - 新台幣</option>
              <option value="USD">USD - 美元</option>
              <option value="EUR">EUR - 歐元</option>
            </select>
            {errors.default_currency && (
              <p className="mt-1 text-sm text-red-600">{errors.default_currency.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              幣別符號
            </label>
            <input
              type="text"
              {...register('currency_symbol')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="$"
            />
            {errors.currency_symbol && (
              <p className="mt-1 text-sm text-red-600">{errors.currency_symbol.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              小數位數
            </label>
            <select
              {...register('decimal_places', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {errors.decimal_places && (
              <p className="mt-1 text-sm text-red-600">{errors.decimal_places.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              可用幣別（逗號分隔）
            </label>
            <input
              type="text"
              {...register('available_currencies')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="TWD,USD,EUR"
            />
            <p className="mt-1 text-xs text-gray-500">以逗號分隔各幣別代碼，例如：TWD,USD,EUR</p>
            {errors.available_currencies && (
              <p className="mt-1 text-sm text-red-600">{errors.available_currencies.message}</p>
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
