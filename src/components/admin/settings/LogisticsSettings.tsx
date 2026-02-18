'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  logisticsSettingsSchema,
  type LogisticsSettingsData,
} from '@/lib/validations/settings';

interface LogisticsSettingsProps {
  initialData: Record<string, unknown>;
}

export default function LogisticsSettings({ initialData }: LogisticsSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sandbox = (initialData.tcat_sandbox as string) || 'true';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LogisticsSettingsData>({
    resolver: zodResolver(logisticsSettingsSchema),
    defaultValues: {
      tcat_customer_id: (initialData.tcat_customer_id as string) || '',
      tcat_password: (initialData.tcat_password as string) || '',
      tcat_sandbox: sandbox,
      tcat_sender_name: (initialData.tcat_sender_name as string) || '',
      tcat_sender_phone: (initialData.tcat_sender_phone as string) || '',
      tcat_sender_address: (initialData.tcat_sender_address as string) || '',
    },
  });

  const isSandbox = watch('tcat_sandbox');

  async function onSubmit(data: LogisticsSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'logistics', settings: data }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">黑貓宅急便設定</h2>
        <p className="mb-4 text-sm text-gray-500">
          與黑貓物流簽約後，取得客戶代號與密碼即可串接出單 API。
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                客戶代號
              </label>
              <input
                type="text"
                {...register('tcat_customer_id')}
                placeholder="黑貓客戶代號"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                type="password"
                {...register('tcat_password')}
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          <h3 className="text-sm font-medium text-gray-700">寄件人資訊</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              寄件人姓名
            </label>
            <input
              type="text"
              {...register('tcat_sender_name')}
              placeholder="永安茶園"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              寄件人電話
            </label>
            <input
              type="text"
              {...register('tcat_sender_phone')}
              placeholder="02-12345678"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              寄件人地址
            </label>
            <input
              type="text"
              {...register('tcat_sender_address')}
              placeholder="台北市信義區信義路五段7號"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-gray-200 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                測試環境
              </label>
              <p className="mt-0.5 text-xs text-gray-400">
                開啟時使用黑貓測試環境，正式上線前請關閉
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isSandbox === 'true'}
              onClick={() =>
                setValue('tcat_sandbox', isSandbox === 'true' ? 'false' : 'true', {
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
