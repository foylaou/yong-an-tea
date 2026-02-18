'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { seoFormSchema, type SEOFormData } from '@/lib/validations/seo';
import SEOPreview from './SEOPreview';

interface EntityOption {
  id: string;
  title: string;
}

interface SEOFormProps {
  products: EntityOption[];
  blogs: EntityOption[];
  initialData?: any;
  isEdit?: boolean;
}

export default function SEOForm({ products, blogs, initialData, isEdit = false }: SEOFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: SEOFormData = {
    entity_type: initialData?.entity_type || 'product',
    entity_id: initialData?.entity_id || null,
    page_path: initialData?.page_path || null,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    meta_keywords: initialData?.meta_keywords || '',
    canonical_url: initialData?.canonical_url || '',
    og_title: initialData?.og_title || '',
    og_description: initialData?.og_description || '',
    og_image: initialData?.og_image || '',
    og_type: initialData?.og_type || 'website',
    twitter_card: initialData?.twitter_card || 'summary_large_image',
    twitter_title: initialData?.twitter_title || '',
    twitter_description: initialData?.twitter_description || '',
    twitter_image: initialData?.twitter_image || '',
    structured_data: initialData?.structured_data
      ? JSON.stringify(initialData.structured_data, null, 2)
      : '',
    no_index: initialData?.no_index || false,
    no_follow: initialData?.no_follow || false,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SEOFormData>({
    resolver: zodResolver(seoFormSchema),
    defaultValues,
  });

  const entityType = watch('entity_type');
  const metaTitle = watch('meta_title');
  const metaDescription = watch('meta_description');
  const canonicalUrl = watch('canonical_url');

  async function onSubmit(data: SEOFormData) {
    setSubmitting(true);
    setServerError(null);

    // Prepare data for API
    const submitData: any = { ...data };

    // Clean up based on entity_type
    if (data.entity_type === 'page') {
      submitData.entity_id = null;
    } else {
      submitData.page_path = null;
    }

    // Convert empty strings to null
    for (const key of Object.keys(submitData)) {
      if (submitData[key] === '') submitData[key] = null;
    }

    // Ensure entity_type is preserved
    submitData.entity_type = data.entity_type;

    // Parse structured_data JSON
    if (data.structured_data && typeof data.structured_data === 'string') {
      try {
        submitData.structured_data = JSON.parse(data.structured_data);
      } catch {
        setServerError('Structured Data JSON 格式不正確');
        setSubmitting(false);
        return;
      }
    }

    try {
      const url = isEdit
        ? `/api/admin/seo/${initialData.id}`
        : '/api/admin/seo';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }

      router.push('/admin/seo');
      router.refresh();
    } catch {
      setServerError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{serverError}</div>
      )}

      {/* Target Selection */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">目標設定</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">目標類型 *</label>
            <select
              {...register('entity_type')}
              disabled={isEdit}
              onChange={(e) => {
                const val = e.target.value as 'product' | 'blog' | 'page';
                setValue('entity_type', val);
                setValue('entity_id', null);
                setValue('page_path', null);
              }}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isEdit ? 'cursor-not-allowed bg-gray-100' : ''}`}
            >
              <option value="product">商品</option>
              <option value="blog">文章</option>
              <option value="page">靜態頁面</option>
            </select>
            {errors.entity_type && (
              <p className="mt-1 text-sm text-red-600">{errors.entity_type.message}</p>
            )}
          </div>

          {(entityType === 'product' || entityType === 'blog') && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {entityType === 'product' ? '選擇商品' : '選擇文章'} *
              </label>
              <select
                {...register('entity_id')}
                disabled={isEdit}
                className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isEdit ? 'cursor-not-allowed bg-gray-100' : ''}`}
              >
                <option value="">請選擇...</option>
                {(entityType === 'product' ? products : blogs).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              {errors.entity_id && (
                <p className="mt-1 text-sm text-red-600">{errors.entity_id.message}</p>
              )}
            </div>
          )}

          {entityType === 'page' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">頁面路徑 *</label>
              <input
                {...register('page_path')}
                disabled={isEdit}
                placeholder="例如：/ 或 /about"
                className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isEdit ? 'cursor-not-allowed bg-gray-100' : ''}`}
              />
              {errors.page_path && (
                <p className="mt-1 text-sm text-red-600">{errors.page_path.message}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Basic Meta */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">基本 Meta 標籤</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              {...register('meta_title')}
              placeholder="頁面標題（建議 60 字以內）"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.meta_title && (
              <p className="mt-1 text-sm text-red-600">{errors.meta_title.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              {...register('meta_description')}
              rows={3}
              placeholder="頁面描述（建議 160 字以內）"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.meta_description && (
              <p className="mt-1 text-sm text-red-600">{errors.meta_description.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Keywords</label>
            <input
              {...register('meta_keywords')}
              placeholder="關鍵字（以逗號分隔）"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Canonical URL</label>
            <input
              {...register('canonical_url')}
              placeholder="https://example.com/page"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.canonical_url && (
              <p className="mt-1 text-sm text-red-600">{errors.canonical_url.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* OpenGraph */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">OpenGraph（社群分享）</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OG Title</label>
            <input
              {...register('og_title')}
              placeholder="留空則使用 Meta Title"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OG Type</label>
            <select
              {...register('og_type')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">OG Description</label>
            <textarea
              {...register('og_description')}
              rows={2}
              placeholder="留空則使用 Meta Description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">OG Image URL</label>
            <input
              {...register('og_image')}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Twitter Card */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Twitter Card</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Card Type</label>
            <select
              {...register('twitter_card')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="summary_large_image">Summary Large Image</option>
              <option value="summary">Summary</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Twitter Title</label>
            <input
              {...register('twitter_title')}
              placeholder="留空則使用 Meta Title"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Twitter Description</label>
            <textarea
              {...register('twitter_description')}
              rows={2}
              placeholder="留空則使用 Meta Description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Twitter Image URL</label>
            <input
              {...register('twitter_image')}
              placeholder="留空則使用 OG Image"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">進階設定</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Structured Data (JSON-LD)
            </label>
            <textarea
              {...register('structured_data')}
              rows={6}
              placeholder='{"@context": "https://schema.org", ...}'
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">選填，輸入有效的 JSON-LD 格式</p>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('no_index')} className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700">noindex（禁止搜尋引擎收錄）</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('no_follow')} className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700">nofollow（禁止追蹤連結）</span>
            </label>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section>
        <SEOPreview
          title={metaTitle || undefined}
          description={metaDescription || undefined}
          url={canonicalUrl || undefined}
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/seo')}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : isEdit ? '更新 SEO' : '新增 SEO'}
        </button>
      </div>
    </form>
  );
}
