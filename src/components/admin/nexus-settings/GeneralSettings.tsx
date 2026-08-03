'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generalSettingsSchema, type GeneralSettingsData } from '@/lib/validations/settings';

interface GeneralSettingsProps {
  initialData: Record<string, unknown>;
}

export default function GeneralSettings({ initialData }: GeneralSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      site_name: (initialData.site_name as string) || '',
      site_description: (initialData.site_description as string) || '',
      logo_url: (initialData.logo_url as string) || '',
      favicon_url: (initialData.favicon_url as string) || '',
      copyright_text: (initialData.copyright_text as string) || '© {year} 永安茶園. 版權所有。',
      blog_enabled: (initialData.blog_enabled as string) || 'true',
      loyalty_discount_show_label: (initialData.loyalty_discount_show_label as string) || 'true',
    },
  });

  const logoUrl = watch('logo_url');
  const faviconUrl = watch('favicon_url');
  const blogEnabled = watch('blog_enabled');
  const loyaltyDiscountShowLabel = watch('loyalty_discount_show_label');

  async function uploadFile(file: File, key: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    const res = await fetch('/api/admin/upload-site-asset', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || '上傳失敗');
    return result.url;
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setServerError(null);
    try {
      const url = await uploadFile(file, 'logo');
      setValue('logo_url', url, { shouldDirty: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Logo 上傳失敗');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    setServerError(null);
    try {
      const url = await uploadFile(file, 'favicon');
      setValue('favicon_url', url, { shouldDirty: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Favicon 上傳失敗');
    } finally {
      setFaviconUploading(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  }

  async function onSubmit(data: GeneralSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'general', settings: data }),
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
          <h2 className="card-title">一般設定</h2>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">網站名稱</legend>
              <input type="text" {...register('site_name')} className="input w-full" />
              {errors.site_name && <p className="text-error mt-1 text-sm">{errors.site_name.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">網站描述</legend>
              <textarea rows={3} {...register('site_description')} className="textarea w-full" />
              {errors.site_description && <p className="text-error mt-1 text-sm">{errors.site_description.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Logo</legend>
              <div className="flex gap-2">
                <input type="text" {...register('logo_url')} placeholder="輸入 URL 或上傳圖片" className="input w-full flex-1" />
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/heic,image/heif,.heic,.heif"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button type="button" disabled={logoUploading} onClick={() => logoInputRef.current?.click()} className="btn btn-outline whitespace-nowrap">
                  {logoUploading ? '上傳中...' : '上傳圖片'}
                </button>
              </div>
              {errors.logo_url && <p className="text-error mt-1 text-sm">{errors.logo_url.message}</p>}
              {logoUrl && (
                <div className="mt-2">
                  <p className="text-base-content/50 mb-1 text-xs">預覽：</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Favicon</legend>
              <div className="flex gap-2">
                <input type="text" {...register('favicon_url')} placeholder="輸入 URL 或上傳圖片" className="input w-full flex-1" />
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/heic,image/heif,.heic,.heif"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
                <button type="button" disabled={faviconUploading} onClick={() => faviconInputRef.current?.click()} className="btn btn-outline whitespace-nowrap">
                  {faviconUploading ? '上傳中...' : '上傳圖片'}
                </button>
              </div>
              {errors.favicon_url && <p className="text-error mt-1 text-sm">{errors.favicon_url.message}</p>}
              {faviconUrl && (
                <div className="mt-2">
                  <p className="text-base-content/50 mb-1 text-xs">預覽：</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={faviconUrl}
                    alt="Favicon preview"
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">版權宣告</legend>
              <input type="text" {...register('copyright_text')} placeholder="© {year} 永安茶園. 版權所有。" className="input w-full" />
              <p className="text-base-content/50 mt-1 text-xs">可使用 {'{year}'} 自動替換為當前年份</p>
              {errors.copyright_text && <p className="text-error mt-1 text-sm">{errors.copyright_text.message}</p>}
            </fieldset>

            <div className="border-base-300 flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="text-sm font-medium">啟用部落格功能</p>
                <p className="text-base-content/50 mt-0.5 text-xs">關閉後，前台導覽列、首頁部落格區塊及所有部落格頁面將被隱藏</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={blogEnabled === 'true'}
                onChange={(e) => setValue('blog_enabled', e.target.checked ? 'true' : 'false', { shouldDirty: true })}
              />
            </div>

            <div className="border-base-300 flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="text-sm font-medium">結帳頁顯示熟客折扣字樣</p>
                <p className="text-base-content/50 mt-0.5 text-xs">關閉後結帳頁不會顯示「您有熟客折扣」字樣，但折扣金額仍會正確套用</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={loyaltyDiscountShowLabel === 'true'}
                onChange={(e) => setValue('loyalty_discount_show_label', e.target.checked ? 'true' : 'false', { shouldDirty: true })}
              />
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
