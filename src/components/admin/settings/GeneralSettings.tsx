'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  generalSettingsSchema,
  type GeneralSettingsData,
} from '@/lib/validations/settings';

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
      copyright_text: (initialData.copyright_text as string) || '© {year} Helendo. 版權所有。',
    },
  });

  const logoUrl = watch('logo_url');
  const faviconUrl = watch('favicon_url');

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
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">一般設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              網站名稱
            </label>
            <input
              type="text"
              {...register('site_name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.site_name && (
              <p className="mt-1 text-sm text-red-600">{errors.site_name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              網站描述
            </label>
            <textarea
              rows={3}
              {...register('site_description')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.site_description && (
              <p className="mt-1 text-sm text-red-600">{errors.site_description.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Logo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register('logo_url')}
                placeholder="輸入 URL 或上傳圖片"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={logoUploading}
                onClick={() => logoInputRef.current?.click()}
                className="whitespace-nowrap rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {logoUploading ? '上傳中...' : '上傳圖片'}
              </button>
            </div>
            {errors.logo_url && (
              <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
            )}
            {logoUrl && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-gray-500">預覽：</p>
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Favicon
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register('favicon_url')}
                placeholder="輸入 URL 或上傳圖片"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={faviconUploading}
                onClick={() => faviconInputRef.current?.click()}
                className="whitespace-nowrap rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {faviconUploading ? '上傳中...' : '上傳圖片'}
              </button>
            </div>
            {errors.favicon_url && (
              <p className="mt-1 text-sm text-red-600">{errors.favicon_url.message}</p>
            )}
            {faviconUrl && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-gray-500">預覽：</p>
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              版權宣告
            </label>
            <input
              type="text"
              {...register('copyright_text')}
              placeholder="© {year} Helendo. 版權所有。"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-400">
              可使用 {'{year}'} 自動替換為當前年份
            </p>
            {errors.copyright_text && (
              <p className="mt-1 text-sm text-red-600">{errors.copyright_text.message}</p>
            )}
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
