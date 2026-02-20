'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  comingSoonSettingsSchema,
  type ComingSoonSettingsData,
} from '@/lib/validations/settings';

interface ComingSoonSettingsProps {
  initialData: Record<string, unknown>;
}

export default function ComingSoonSettings({ initialData }: ComingSoonSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComingSoonSettingsData>({
    resolver: zodResolver(comingSoonSettingsSchema),
    defaultValues: {
      coming_soon_title: (initialData.coming_soon_title as string) || '',
      coming_soon_desc: (initialData.coming_soon_desc as string) || '',
      coming_soon_count_title: (initialData.coming_soon_count_title as string) || '',
      coming_soon_social_title: (initialData.coming_soon_social_title as string) || '',
    },
  });

  async function onSubmit(data: ComingSoonSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'coming_soon', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">即將推出頁面設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              標題
            </label>
            <input
              type="text"
              {...register('coming_soon_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.coming_soon_title && (
              <p className="mt-1 text-sm text-red-600">{errors.coming_soon_title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              描述文字
            </label>
            <textarea
              {...register('coming_soon_desc')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.coming_soon_desc && (
              <p className="mt-1 text-sm text-red-600">{errors.coming_soon_desc.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              倒數計時標題
            </label>
            <input
              type="text"
              {...register('coming_soon_count_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.coming_soon_count_title && (
              <p className="mt-1 text-sm text-red-600">{errors.coming_soon_count_title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              社群連結標題
            </label>
            <input
              type="text"
              {...register('coming_soon_social_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.coming_soon_social_title && (
              <p className="mt-1 text-sm text-red-600">{errors.coming_soon_social_title.message}</p>
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
