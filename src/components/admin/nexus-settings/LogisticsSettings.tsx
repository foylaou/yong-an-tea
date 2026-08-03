'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logisticsSettingsSchema, type LogisticsSettingsData } from '@/lib/validations/settings';

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">黑貓宅急便設定</h2>
          <p className="text-base-content/60 -mt-1 text-sm">與黑貓物流簽約後，取得客戶代號與授權碼即可串接出單 API。測試與正式環境各有獨立的憑證。</p>

          <div className="space-y-6">
            {/* Sandbox toggle */}
            <div className="border-base-300 flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="text-sm font-medium">目前使用環境</p>
                <p className="text-base-content/50 mt-0.5 text-xs">{isSandbox === 'true' ? '使用測試環境（egs.suda.com.tw:8443）' : '使用正式環境（api.suda.com.tw）'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${isSandbox === 'true' ? 'text-base-content/40' : ''}`}>正式</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isSandbox === 'true'}
                  onChange={(e) => setValue('tcat_sandbox', e.target.checked ? 'true' : 'false', { shouldDirty: true })}
                />
                <span className={`text-xs font-medium ${isSandbox === 'true' ? '' : 'text-base-content/40'}`}>測試</span>
              </div>
            </div>

            {/* Test credentials */}
            <div className="border-warning/40 bg-warning/5 space-y-4 rounded-md border p-4">
              <h3 className="text-warning text-sm font-medium">
                測試環境憑證
                {isSandbox === 'true' && <span className="badge badge-sm badge-warning ml-2">使用中</span>}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">客戶代號 (CustomerId)</legend>
                  <input type="text" {...register('tcat_test_customer_id')} placeholder="測試環境客戶代號" className="input input-sm w-full" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">授權碼 (CustomerToken)</legend>
                  <input type="password" {...register('tcat_test_customer_token')} placeholder="••••••••" className="input input-sm w-full" />
                </fieldset>
              </div>
            </div>

            {/* Production credentials */}
            <div className="border-success/40 bg-success/5 space-y-4 rounded-md border p-4">
              <h3 className="text-success text-sm font-medium">
                正式環境憑證
                {isSandbox !== 'true' && <span className="badge badge-sm badge-success ml-2">使用中</span>}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">客戶代號 (CustomerId)</legend>
                  <input type="text" {...register('tcat_prod_customer_id')} placeholder="正式環境客戶代號" className="input input-sm w-full" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">授權碼 (CustomerToken)</legend>
                  <input type="password" {...register('tcat_prod_customer_token')} placeholder="••••••••" className="input input-sm w-full" />
                </fieldset>
              </div>
            </div>

            <div className="divider" />

            {/* Delivery settings */}
            <div>
              <h3 className="text-sm font-medium">配送設定</h3>
              <p className="text-base-content/50 mt-1 text-xs">產生託運單時，系統會自動跳過不配送的日期，選擇最近的可配送日。國定假日資料來源：行政院人事行政總處。</p>
            </div>

            <div className="space-y-3">
              {(
                [
                  { key: 'tcat_no_delivery_sunday' as const, label: '週日不配送', value: noSunday, desc: '黑貓預設週日不配送' },
                  { key: 'tcat_no_delivery_saturday' as const, label: '週六不配送', value: noSaturday, desc: '依合約而定' },
                  { key: 'tcat_no_delivery_holidays' as const, label: '國定假日不配送', value: noHolidays, desc: '自動取得台灣國定假日' },
                ] as const
              ).map((item) => (
                <div key={item.key} className="border-base-300 flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-base-content/50 text-xs">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={item.value === 'true'}
                    onChange={(e) => setValue(item.key, e.target.checked ? 'true' : 'false', { shouldDirty: true })}
                  />
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Sender info */}
            <h3 className="text-sm font-medium">寄件人資訊</h3>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">寄件人姓名</legend>
              <input type="text" {...register('tcat_sender_name')} placeholder="永安茶園" className="input input-sm w-full" />
            </fieldset>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">寄件人電話（市話）</legend>
                <input type="text" {...register('tcat_sender_phone')} placeholder="0212345678（不含 -）" className="input input-sm w-full" />
                <p className="text-base-content/50 mt-1 text-xs">不可包含 - 等特殊符號</p>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">寄件人手機</legend>
                <input type="text" {...register('tcat_sender_mobile')} placeholder="0912345678" className="input input-sm w-full" />
                <p className="text-base-content/50 mt-1 text-xs">10 碼手機號碼</p>
              </fieldset>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <fieldset className="fieldset md:col-span-1">
                <legend className="fieldset-legend">寄件人郵遞區號</legend>
                <input type="text" {...register('tcat_sender_zipcode')} placeholder="110" className="input input-sm w-full" />
              </fieldset>
              <fieldset className="fieldset md:col-span-3">
                <legend className="fieldset-legend">寄件人地址</legend>
                <input type="text" {...register('tcat_sender_address')} placeholder="台北市信義區信義路五段7號" className="input input-sm w-full" />
              </fieldset>
            </div>
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
