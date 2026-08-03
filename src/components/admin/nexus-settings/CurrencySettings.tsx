'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { currencySettingsSchema, type CurrencySettingsData } from '@/lib/validations/settings';

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
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">幣別設定</h2>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">預設幣別</legend>
              <select {...register('default_currency')} className="select w-full">
                <option value="TWD">TWD - 新台幣</option>
                <option value="USD">USD - 美元</option>
                <option value="EUR">EUR - 歐元</option>
              </select>
              {errors.default_currency && <p className="text-error mt-1 text-sm">{errors.default_currency.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">幣別符號</legend>
              <input type="text" {...register('currency_symbol')} className="input w-full" placeholder="$" />
              {errors.currency_symbol && <p className="text-error mt-1 text-sm">{errors.currency_symbol.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">小數位數</legend>
              <select {...register('decimal_places', { valueAsNumber: true })} className="select w-full">
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.decimal_places && <p className="text-error mt-1 text-sm">{errors.decimal_places.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">可用幣別（逗號分隔）</legend>
              <input type="text" {...register('available_currencies')} className="input w-full" placeholder="TWD,USD,EUR" />
              <p className="text-base-content/50 mt-1 text-xs">以逗號分隔各幣別代碼，例如：TWD,USD,EUR</p>
              {errors.available_currencies && <p className="text-error mt-1 text-sm">{errors.available_currencies.message}</p>}
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
