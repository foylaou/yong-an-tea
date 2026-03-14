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
      tcat_test_customer_id: (initialData.tcat_test_customer_id as string) || '',
      tcat_test_customer_token: (initialData.tcat_test_customer_token as string) || '',
      tcat_prod_customer_id: (initialData.tcat_prod_customer_id as string) || '',
      tcat_prod_customer_token: (initialData.tcat_prod_customer_token as string) || '',
      tcat_sandbox: sandbox,
      tcat_no_delivery_sunday: (initialData.tcat_no_delivery_sunday as string) || 'true',
      tcat_no_delivery_saturday: (initialData.tcat_no_delivery_saturday as string) || 'false',
      tcat_no_delivery_holidays: (initialData.tcat_no_delivery_holidays as string) || 'true',
      tcat_sender_name: (initialData.tcat_sender_name as string) || '',
      tcat_sender_phone: (initialData.tcat_sender_phone as string) || '',
      tcat_sender_mobile: (initialData.tcat_sender_mobile as string) || '',
      tcat_sender_zipcode: (initialData.tcat_sender_zipcode as string) || '',
      tcat_sender_address: (initialData.tcat_sender_address as string) || '',
    },
  });

  const isSandbox = watch('tcat_sandbox');
  const noSunday = watch('tcat_no_delivery_sunday');
  const noSaturday = watch('tcat_no_delivery_saturday');
  const noHolidays = watch('tcat_no_delivery_holidays');

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

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">黑貓宅急便設定</h2>
        <p className="mb-4 text-sm text-gray-500">
          與黑貓物流簽約後，取得客戶代號與授權碼即可串接出單 API。測試與正式環境各有獨立的憑證。
        </p>

        <div className="space-y-6">
          {/* Sandbox toggle */}
          <div className="flex items-center justify-between rounded-md border border-gray-200 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                目前使用環境
              </label>
              <p className="mt-0.5 text-xs text-gray-400">
                {isSandbox === 'true'
                  ? '使用測試環境（egs.suda.com.tw:8443）'
                  : '使用正式環境（api.suda.com.tw）'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${isSandbox === 'true' ? 'text-gray-400' : 'text-gray-700'}`}>
                正式
              </span>
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
              <span className={`text-xs font-medium ${isSandbox === 'true' ? 'text-gray-700' : 'text-gray-400'}`}>
                測試
              </span>
            </div>
          </div>

          {/* Test credentials */}
          <div className="rounded-md border border-orange-200 bg-orange-50/50 p-4 space-y-4">
            <h3 className="text-sm font-medium text-orange-800">
              測試環境憑證
              {isSandbox === 'true' && (
                <span className="ml-2 inline-block rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                  使用中
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  客戶代號 (CustomerId)
                </label>
                <input
                  type="text"
                  {...register('tcat_test_customer_id')}
                  placeholder="測試環境客戶代號"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  授權碼 (CustomerToken)
                </label>
                <input
                  type="password"
                  {...register('tcat_test_customer_token')}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Production credentials */}
          <div className="rounded-md border border-green-200 bg-green-50/50 p-4 space-y-4">
            <h3 className="text-sm font-medium text-green-800">
              正式環境憑證
              {isSandbox !== 'true' && (
                <span className="ml-2 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">
                  使用中
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  客戶代號 (CustomerId)
                </label>
                <input
                  type="text"
                  {...register('tcat_prod_customer_id')}
                  placeholder="正式環境客戶代號"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  授權碼 (CustomerToken)
                </label>
                <input
                  type="password"
                  {...register('tcat_prod_customer_token')}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Delivery settings */}
          <h3 className="text-sm font-medium text-gray-700">配送設定</h3>
          <p className="text-xs text-gray-400 -mt-4">
            產生託運單時，系統會自動跳過不配送的日期，選擇最近的可配送日。
            國定假日資料來源：行政院人事行政總處。
          </p>

          <div className="space-y-3">
            {([
              { key: 'tcat_no_delivery_sunday' as const, label: '週日不配送', value: noSunday, desc: '黑貓預設週日不配送' },
              { key: 'tcat_no_delivery_saturday' as const, label: '週六不配送', value: noSaturday, desc: '依合約而定' },
              { key: 'tcat_no_delivery_holidays' as const, label: '國定假日不配送', value: noHolidays, desc: '自動取得台灣國定假日' },
            ] as const).map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.value === 'true'}
                  onClick={() =>
                    setValue(item.key, item.value === 'true' ? 'false' : 'true', {
                      shouldDirty: true,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    item.value === 'true' ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      item.value === 'true' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <hr className="border-gray-200" />

          {/* Sender info */}
          <h3 className="text-sm font-medium text-gray-700">寄件人資訊</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              寄件人姓名
            </label>
            <input
              type="text"
              {...register('tcat_sender_name')}
              placeholder="永安茶園"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                寄件人電話（市話）
              </label>
              <input
                type="text"
                {...register('tcat_sender_phone')}
                placeholder="0212345678（不含 -）"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">不可包含 - 等特殊符號</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                寄件人手機
              </label>
              <input
                type="text"
                {...register('tcat_sender_mobile')}
                placeholder="0912345678"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">10 碼手機號碼</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                寄件人郵遞區號
              </label>
              <input
                type="text"
                {...register('tcat_sender_zipcode')}
                placeholder="110"
                className={inputClass}
              />
            </div>
            <div className="col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                寄件人地址
              </label>
              <input
                type="text"
                {...register('tcat_sender_address')}
                placeholder="台北市信義區信義路五段7號"
                className={inputClass}
              />
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
