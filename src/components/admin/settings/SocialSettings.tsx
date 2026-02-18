'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  socialSettingsSchema,
  type SocialSettingsData,
} from '@/lib/validations/settings';

interface SocialSettingsProps {
  initialData: Record<string, unknown>;
}

const socialFields = [
  { key: 'social_facebook' as const, label: 'Facebook', placeholder: 'https://www.facebook.com/...' },
  { key: 'social_twitter' as const, label: 'Twitter', placeholder: 'https://twitter.com/...' },
  { key: 'social_instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'social_line' as const, label: 'LINE 官方帳號', placeholder: 'https://line.me/R/ti/p/...' },
  { key: 'social_pinterest' as const, label: 'Pinterest', placeholder: 'https://pinterest.com/...' },
  { key: 'social_tumblr' as const, label: 'Tumblr', placeholder: 'https://www.tumblr.com/...' },
];

export default function SocialSettings({ initialData }: SocialSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialSettingsData>({
    resolver: zodResolver(socialSettingsSchema),
    defaultValues: {
      social_facebook: (initialData.social_facebook as string) || '',
      social_twitter: (initialData.social_twitter as string) || '',
      social_instagram: (initialData.social_instagram as string) || '',
      social_line: (initialData.social_line as string) || '',
      social_pinterest: (initialData.social_pinterest as string) || '',
      social_tumblr: (initialData.social_tumblr as string) || '',
    },
  });

  async function onSubmit(data: SocialSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'social', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">社群媒體</h2>
        <p className="mb-4 text-sm text-gray-500">留空則不顯示該社群連結</p>

        <div className="space-y-4">
          {socialFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type="text"
                {...register(field.key)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder={field.placeholder}
              />
              {errors[field.key] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.key]?.message}</p>
              )}
            </div>
          ))}
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
