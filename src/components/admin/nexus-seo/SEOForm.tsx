'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { seoFormSchema, type SEOFormData } from '@/lib/validations/seo';
import { SEOPreview } from './SEOPreview';

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

export function SEOForm({ products, blogs, initialData, isEdit = false }: SEOFormProps) {
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
    structured_data: initialData?.structured_data ? JSON.stringify(initialData.structured_data, null, 2) : '',
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

    const submitData: any = { ...data };

    if (data.entity_type === 'page') {
      submitData.entity_id = null;
    } else {
      submitData.page_path = null;
    }

    for (const key of Object.keys(submitData)) {
      if (submitData[key] === '') submitData[key] = null;
    }

    submitData.entity_type = data.entity_type;

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
      const url = isEdit ? `/api/admin/seo/${initialData.id}` : '/api/admin/seo';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <div className="alert alert-error text-sm">{serverError}</div>}

      {/* Target Selection */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">目標設定</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">目標類型 *</legend>
              <select
                {...register('entity_type')}
                disabled={isEdit}
                onChange={(e) => {
                  const val = e.target.value as 'product' | 'blog' | 'page';
                  setValue('entity_type', val);
                  setValue('entity_id', null);
                  setValue('page_path', null);
                }}
                className={`select w-full ${isEdit ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <option value="product">商品</option>
                <option value="blog">文章</option>
                <option value="page">靜態頁面</option>
              </select>
              {errors.entity_type && <p className="text-error mt-1 text-sm">{errors.entity_type.message}</p>}
            </fieldset>

            {(entityType === 'product' || entityType === 'blog') && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">{entityType === 'product' ? '選擇商品' : '選擇文章'} *</legend>
                <select {...register('entity_id')} disabled={isEdit} className={`select w-full ${isEdit ? 'cursor-not-allowed opacity-60' : ''}`}>
                  <option value="">請選擇...</option>
                  {(entityType === 'product' ? products : blogs).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                {errors.entity_id && <p className="text-error mt-1 text-sm">{errors.entity_id.message}</p>}
              </fieldset>
            )}

            {entityType === 'page' && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">頁面路徑 *</legend>
                <input {...register('page_path')} disabled={isEdit} placeholder="例如：/ 或 /about" className={`input w-full ${isEdit ? 'cursor-not-allowed opacity-60' : ''}`} />
                {errors.page_path && <p className="text-error mt-1 text-sm">{errors.page_path.message}</p>}
              </fieldset>
            )}
          </div>
        </div>
      </div>

      {/* Basic Meta */}
      <div className="card card-border bg-base-100">
        <div className="card-body space-y-4">
          <h2 className="card-title">基本 Meta 標籤</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Meta Title</legend>
            <input {...register('meta_title')} placeholder="頁面標題（建議 60 字以內）" className="input w-full" />
            {errors.meta_title && <p className="text-error mt-1 text-sm">{errors.meta_title.message}</p>}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Meta Description</legend>
            <textarea {...register('meta_description')} rows={3} placeholder="頁面描述（建議 160 字以內）" className="textarea w-full" />
            {errors.meta_description && <p className="text-error mt-1 text-sm">{errors.meta_description.message}</p>}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Meta Keywords</legend>
            <input {...register('meta_keywords')} placeholder="關鍵字（以逗號分隔）" className="input w-full" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Canonical URL</legend>
            <input {...register('canonical_url')} placeholder="https://example.com/page" className="input w-full" />
            {errors.canonical_url && <p className="text-error mt-1 text-sm">{errors.canonical_url.message}</p>}
          </fieldset>
        </div>
      </div>

      {/* OpenGraph */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">OpenGraph（社群分享）</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">OG Title</legend>
              <input {...register('og_title')} placeholder="留空則使用 Meta Title" className="input w-full" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">OG Type</legend>
              <select {...register('og_type')} className="select w-full">
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
              </select>
            </fieldset>
            <fieldset className="fieldset md:col-span-2">
              <legend className="fieldset-legend">OG Description</legend>
              <textarea {...register('og_description')} rows={2} placeholder="留空則使用 Meta Description" className="textarea w-full" />
            </fieldset>
            <fieldset className="fieldset md:col-span-2">
              <legend className="fieldset-legend">OG Image URL</legend>
              <input {...register('og_image')} placeholder="https://example.com/image.jpg" className="input w-full" />
            </fieldset>
          </div>
        </div>
      </div>

      {/* Twitter Card */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Twitter Card</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Card Type</legend>
              <select {...register('twitter_card')} className="select w-full">
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Twitter Title</legend>
              <input {...register('twitter_title')} placeholder="留空則使用 Meta Title" className="input w-full" />
            </fieldset>
            <fieldset className="fieldset md:col-span-2">
              <legend className="fieldset-legend">Twitter Description</legend>
              <textarea {...register('twitter_description')} rows={2} placeholder="留空則使用 Meta Description" className="textarea w-full" />
            </fieldset>
            <fieldset className="fieldset md:col-span-2">
              <legend className="fieldset-legend">Twitter Image URL</legend>
              <input {...register('twitter_image')} placeholder="留空則使用 OG Image" className="input w-full" />
            </fieldset>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="card card-border bg-base-100">
        <div className="card-body space-y-4">
          <h2 className="card-title">進階設定</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Structured Data (JSON-LD)</legend>
            <textarea {...register('structured_data')} rows={6} placeholder='{"@context": "https://schema.org", ...}' className="textarea w-full font-mono text-sm" />
            <p className="text-base-content/40 text-xs">選填，輸入有效的 JSON-LD 格式</p>
          </fieldset>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('no_index')} className="checkbox checkbox-sm" />
              <span className="text-sm">noindex（禁止搜尋引擎收錄）</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('no_follow')} className="checkbox checkbox-sm" />
              <span className="text-sm">nofollow（禁止追蹤連結）</span>
            </label>
          </div>
        </div>
      </div>

      <SEOPreview title={metaTitle || undefined} description={metaDescription || undefined} url={canonicalUrl || undefined} />

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/seo')} className="btn btn-outline">
          取消
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? '儲存中...' : isEdit ? '更新 SEO' : '新增 SEO'}
        </button>
      </div>
    </form>
  );
}
