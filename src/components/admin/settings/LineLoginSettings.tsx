'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  lineLoginSettingsSchema,
  type LineLoginSettingsData,
} from '@/lib/validations/settings';

interface LineLoginSettingsProps {
  initialData: Record<string, unknown>;
}

export default function LineLoginSettings({ initialData }: LineLoginSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
  } = useForm<LineLoginSettingsData>({
    resolver: zodResolver(lineLoginSettingsSchema),
    defaultValues: {
      line_login_channel_id: (initialData.line_login_channel_id as string) || '',
      line_login_channel_secret: (initialData.line_login_channel_secret as string) || '',
    },
  });

  async function onSubmit(data: LineLoginSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'line_login', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">LINE Login 設定</h2>
        <p className="mb-4 text-sm text-gray-500">
          前往{' '}
          <a
            href="https://developers.line.biz/console/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            LINE Developers Console
          </a>{' '}
          建立 LINE Login Channel，取得 Channel ID 和 Channel Secret。
          <br />
          Callback URL 請設定為：<code className="rounded bg-gray-100 px-1 text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/line/callback</code>
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Channel ID
            </label>
            <input
              type="text"
              {...register('line_login_channel_id')}
              placeholder="LINE Login Channel ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Channel Secret
            </label>
            <input
              type="password"
              {...register('line_login_channel_secret')}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
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
