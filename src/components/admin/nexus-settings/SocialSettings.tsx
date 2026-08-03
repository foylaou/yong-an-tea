'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { socialSettingsSchema, type SocialSettingsData } from '@/lib/validations/settings';

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
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">社群媒體</h2>
          <p className="text-base-content/60 -mt-1 text-sm">留空則不顯示該社群連結</p>

          <div className="space-y-4">
            {socialFields.map((field) => (
              <fieldset key={field.key} className="fieldset">
                <legend className="fieldset-legend">{field.label}</legend>
                <input {...register(field.key)} placeholder={field.placeholder} className="input w-full" />
                {errors[field.key] && <p className="text-error mt-1 text-sm">{errors[field.key]?.message}</p>}
              </fieldset>
            ))}
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
