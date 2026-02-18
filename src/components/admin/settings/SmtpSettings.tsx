'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  smtpSettingsSchema,
  type SmtpSettingsData,
} from '@/lib/validations/settings';

interface SmtpSettingsProps {
  initialData: Record<string, unknown>;
}

export default function SmtpSettings({ initialData }: SmtpSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SmtpSettingsData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      smtp_host: (initialData.smtp_host as string) || '',
      smtp_port: Number(initialData.smtp_port ?? 587),
      smtp_user: (initialData.smtp_user as string) || '',
      smtp_pass: (initialData.smtp_pass as string) || '',
      smtp_from_name: (initialData.smtp_from_name as string) || '',
      smtp_from_email: (initialData.smtp_from_email as string) || '',
    },
  });

  async function onSubmit(data: SmtpSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'smtp', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">SMTP 郵件設定</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                SMTP 主機
              </label>
              <input
                type="text"
                {...register('smtp_host')}
                placeholder="smtp.gmail.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.smtp_host && (
                <p className="mt-1 text-sm text-red-600">{errors.smtp_host.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                SMTP 連接埠
              </label>
              <input
                type="number"
                {...register('smtp_port', { valueAsNumber: true })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.smtp_port && (
                <p className="mt-1 text-sm text-red-600">{errors.smtp_port.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SMTP 帳號
            </label>
            <input
              type="text"
              {...register('smtp_user')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.smtp_user && (
              <p className="mt-1 text-sm text-red-600">{errors.smtp_user.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SMTP 密碼
            </label>
            <input
              type="password"
              {...register('smtp_pass')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.smtp_pass && (
              <p className="mt-1 text-sm text-red-600">{errors.smtp_pass.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                寄件人名稱
              </label>
              <input
                type="text"
                {...register('smtp_from_name')}
                placeholder="永安の茶"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.smtp_from_name && (
                <p className="mt-1 text-sm text-red-600">{errors.smtp_from_name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                寄件人 Email
              </label>
              <input
                type="email"
                {...register('smtp_from_email')}
                placeholder="noreply@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.smtp_from_email && (
                <p className="mt-1 text-sm text-red-600">{errors.smtp_from_email.message}</p>
              )}
            </div>
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
