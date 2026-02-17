'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  homepageSettingsSchema,
  type HomepageSettingsData,
} from '@/lib/validations/settings';

interface HomepageSettingsProps {
  initialData: Record<string, unknown>;
}

const homepageVariants = [
  { value: 1, label: 'V1 — 預設', desc: 'TransparentHeader + 精選商品 + 暢銷商品 + 優惠 + 部落格 + Footer 1' },
  { value: 2, label: 'V2 — 方框', desc: 'Header 2 + 影片 + 商品分頁 + 品牌 + Footer 2（HomeBoxed 版型）' },
  { value: 3, label: 'V3 — 輪播', desc: 'Header 3 + 新品到貨 + Footer 3（HomeCarousel 版型）' },
  { value: 4, label: 'V4 — 分類', desc: 'Header 1 + 分類橫幅 + 影片 + 商品分頁 + 部落格 + Footer 1' },
  { value: 5, label: 'V5 — 系列', desc: 'Header 4 + 電子報 + 新品到貨 + Footer 3（HomeCollection 版型）' },
];

export default function HomepageSettings({ initialData }: HomepageSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HomepageSettingsData>({
    resolver: zodResolver(homepageSettingsSchema),
    defaultValues: {
      homepage_variant: (initialData.homepage_variant as number) || 1,
    },
  });

  const selectedVariant = watch('homepage_variant');
  const variantInfo = homepageVariants.find((v) => v.value === selectedVariant);

  async function onSubmit(data: HomepageSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'homepage', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">首頁設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              首頁版型
            </label>
            <select
              {...register('homepage_variant', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {homepageVariants.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            {errors.homepage_variant && (
              <p className="mt-1 text-sm text-red-600">{errors.homepage_variant.message}</p>
            )}
            {variantInfo && (
              <p className="mt-2 text-sm text-gray-500">{variantInfo.desc}</p>
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
