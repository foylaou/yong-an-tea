'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  errorPageSettingsSchema,
  type ErrorPageSettingsData,
} from '@/lib/validations/settings';
import AdminImageUploader from '../common/AdminImageUploader';

interface ErrorPageSettingsProps {
  initialData: Record<string, unknown>;
}

export default function ErrorPageSettings({ initialData }: ErrorPageSettingsProps) {
  // Image field via state (for uploader integration)
  const [image, setImage] = useState((initialData.error404_image as string) || '');

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ErrorPageSettingsData>({
    resolver: zodResolver(errorPageSettingsSchema),
    defaultValues: {
      error404_image: (initialData.error404_image as string) || '',
      error404_image_alt: (initialData.error404_image_alt as string) || '',
      error404_title: (initialData.error404_title as string) || '',
      error404_desc: (initialData.error404_desc as string) || '',
      error404_link_path: (initialData.error404_link_path as string) || '',
      error404_link_text: (initialData.error404_link_text as string) || '',
    },
  });

  async function onSubmit(data: ErrorPageSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'error_page',
          settings: {
            ...data,
            error404_image: image,
          },
        }),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">404 頁面設定</h2>

        <div className="space-y-4">
          <AdminImageUploader
            label="404 頁面圖片"
            hint="建議使用 PNG 透明背景圖"
            slug="error-404"
            imageType="main"
            bucket="site-assets"
            value={image}
            onChange={setImage}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              圖片替代文字
            </label>
            <input
              type="text"
              {...register('error404_image_alt')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.error404_image_alt && (
              <p className="mt-1 text-sm text-red-600">{errors.error404_image_alt.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              標題
            </label>
            <input
              type="text"
              {...register('error404_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.error404_title && (
              <p className="mt-1 text-sm text-red-600">{errors.error404_title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              描述文字
            </label>
            <input
              type="text"
              {...register('error404_desc')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.error404_desc && (
              <p className="mt-1 text-sm text-red-600">{errors.error404_desc.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              連結路徑
            </label>
            <input
              type="text"
              {...register('error404_link_path')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.error404_link_path && (
              <p className="mt-1 text-sm text-red-600">{errors.error404_link_path.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              連結文字
            </label>
            <input
              type="text"
              {...register('error404_link_text')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.error404_link_text && (
              <p className="mt-1 text-sm text-red-600">{errors.error404_link_text.message}</p>
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
