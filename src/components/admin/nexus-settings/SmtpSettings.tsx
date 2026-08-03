'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { smtpSettingsSchema, type SmtpSettingsData } from '@/lib/validations/settings';

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
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">SMTP 郵件設定</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">SMTP 主機</legend>
                <input type="text" {...register('smtp_host')} placeholder="smtp.gmail.com" className="input w-full" />
                {errors.smtp_host && <p className="text-error mt-1 text-sm">{errors.smtp_host.message}</p>}
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">SMTP 連接埠</legend>
                <input type="number" {...register('smtp_port', { valueAsNumber: true })} className="input w-full" />
                {errors.smtp_port && <p className="text-error mt-1 text-sm">{errors.smtp_port.message}</p>}
              </fieldset>
            </div>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">SMTP 帳號</legend>
              <input type="text" {...register('smtp_user')} className="input w-full" />
              {errors.smtp_user && <p className="text-error mt-1 text-sm">{errors.smtp_user.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">SMTP 密碼</legend>
              <input type="password" {...register('smtp_pass')} className="input w-full" />
              {errors.smtp_pass && <p className="text-error mt-1 text-sm">{errors.smtp_pass.message}</p>}
            </fieldset>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">寄件人名稱</legend>
                <input type="text" {...register('smtp_from_name')} placeholder="永安の茶" className="input w-full" />
                {errors.smtp_from_name && <p className="text-error mt-1 text-sm">{errors.smtp_from_name.message}</p>}
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">寄件人 Email</legend>
                <input type="email" {...register('smtp_from_email')} placeholder="noreply@example.com" className="input w-full" />
                {errors.smtp_from_email && <p className="text-error mt-1 text-sm">{errors.smtp_from_email.message}</p>}
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
