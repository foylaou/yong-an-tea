'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lineLoginSettingsSchema, type LineLoginSettingsData } from '@/lib/validations/settings';

interface LineLoginSettingsProps {
  initialData: Record<string, unknown>;
}

export default function LineLoginSettings({ initialData }: LineLoginSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit } = useForm<LineLoginSettingsData>({
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
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">LINE Login 設定</h2>
          <p className="text-base-content/60 -mt-1 text-sm">
            前往{' '}
            <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="link link-primary">
              LINE Developers Console
            </a>{' '}
            建立 LINE Login Channel，取得 Channel ID 和 Channel Secret。
            <br />
            Callback URL 請設定為：
            <code className="bg-base-200 rounded px-1 text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/line/callback</code>
          </p>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Channel ID</legend>
              <input type="text" {...register('line_login_channel_id')} placeholder="LINE Login Channel ID" className="input w-full" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Channel Secret</legend>
              <input type="password" {...register('line_login_channel_secret')} placeholder="••••••••" className="input w-full" />
            </fieldset>
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
