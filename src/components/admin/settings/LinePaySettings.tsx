'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  linePaySettingsSchema,
  type LinePaySettingsData,
} from '@/lib/validations/settings';

interface LinePaySettingsProps {
  initialData: Record<string, unknown>;
}

export default function LinePaySettings({ initialData }: LinePaySettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sandbox = (initialData.linepay_sandbox as string) || 'true';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LinePaySettingsData>({
    resolver: zodResolver(linePaySettingsSchema),
    defaultValues: {
      linepay_channel_id: (initialData.linepay_channel_id as string) || '',
      linepay_channel_secret: (initialData.linepay_channel_secret as string) || '',
      linepay_sandbox: sandbox,
    },
  });

  const isSandbox = watch('linepay_sandbox');

  async function onSubmit(data: LinePaySettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'linepay', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">LINE Pay 金流設定</h2>
        <p className="mb-4 text-sm text-gray-500">
          請至{' '}
          <a
            href="https://pay.line.me/login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            LINE Pay 商家後台
          </a>
          {' '}取得 Channel ID 和 Channel Secret Key。
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Channel ID
            </label>
            <input
              type="text"
              {...register('linepay_channel_id')}
              placeholder="1234567890"
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.linepay_channel_id && (
              <p className="mt-1 text-sm text-red-600">{errors.linepay_channel_id.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Channel Secret Key
            </label>
            <input
              type="password"
              {...register('linepay_channel_secret')}
              placeholder="••••••••••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.linepay_channel_secret && (
              <p className="mt-1 text-sm text-red-600">{errors.linepay_channel_secret.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border border-gray-200 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sandbox 測試模式
              </label>
              <p className="mt-0.5 text-xs text-gray-400">
                開啟時使用 LINE Pay Sandbox 環境，正式上線前請關閉
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isSandbox === 'true'}
              onClick={() =>
                setValue('linepay_sandbox', isSandbox === 'true' ? 'false' : 'true', {
                  shouldDirty: true,
                })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                isSandbox === 'true' ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  isSandbox === 'true' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
