'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { blogFormSchema, type BlogFormData } from '@/lib/validations/blog';
import AdminImageUploader from '../common/AdminImageUploader';
import TagMultiSelect from './TagMultiSelect';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

interface BlogFormProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  initialData?: any;
  isEdit?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function BlogForm({
  categories,
  tags,
  initialData,
  isEdit = false,
}: BlogFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: BlogFormData = {
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    author: initialData?.author || 'Admin',
    category_item: initialData?.category_item || '',
    desc_text: initialData?.desc_text || '',
    medium_image: initialData?.medium_image || '',
    masonry: initialData?.masonry || '',
    large_image: initialData?.large_image || '',
    extra_large_image: initialData?.extra_large_image || '',
    alt_image: initialData?.alt_image || '',
    tag_ids:
      initialData?.blog_tag_map?.map((tm: any) => tm.tag_id) || [],
    blockquote_desc: initialData?.blockquote_desc || '',
    single_img_one: initialData?.single_img_one || '',
    single_img_two: initialData?.single_img_two || '',
    single_img_alt: initialData?.single_img_alt || '',
    content: initialData?.content || '',
    is_featured: initialData?.is_featured ?? false,
    published: initialData?.published ?? true,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues,
  });

  const slug = watch('slug');
  const tagIds = watch('tag_ids');

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setValue('title', title);
    if (!isEdit) {
      setValue('slug', slugify(title));
    }
  }

  async function onSubmit(data: BlogFormData) {
    setSubmitting(true);
    setServerError(null);

    try {
      const url = isEdit
        ? `/api/admin/blogs/${initialData.id}`
        : '/api/admin/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }

      router.push('/admin/blogs');
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
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* 基本資訊 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">基本資訊</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              文章標題 *
            </label>
            <input
              {...register('title')}
              onChange={handleTitleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slug *{' '}
              {isEdit && (
                <span className="text-xs text-gray-400">（編輯時不可修改）</span>
              )}
            </label>
            <input
              {...register('slug')}
              readOnly={isEdit}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isEdit ? 'cursor-not-allowed bg-gray-100' : ''
              }`}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              日期 *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              作者 *
            </label>
            <input
              {...register('author')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              分類
            </label>
            <select
              {...register('category_item')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">未分類</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              摘要描述
            </label>
            <textarea
              {...register('desc_text')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 圖片 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">文章圖片</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminImageUploader
            label="Medium 圖片"
            hint="374x243"
            slug={slug}
            imageType="medium"
            bucket="blog-images"
            value={watch('medium_image')}
            onChange={(url) => setValue('medium_image', url)}
            slugRequiredMessage="請先填寫文章標題以產生 Slug"
            targetWidth={374}
            targetHeight={243}
          />
          <AdminImageUploader
            label="Masonry 圖片"
            hint="366x257 / 366x423"
            slug={slug}
            imageType="masonry"
            bucket="blog-images"
            value={watch('masonry')}
            onChange={(url) => setValue('masonry', url)}
            slugRequiredMessage="請先填寫文章標題以產生 Slug"
            targetWidth={366}
            targetHeight={257}
          />
          <AdminImageUploader
            label="Large 圖片"
            hint="854x491"
            slug={slug}
            imageType="large"
            bucket="blog-images"
            value={watch('large_image')}
            onChange={(url) => setValue('large_image', url)}
            slugRequiredMessage="請先填寫文章標題以產生 Slug"
            targetWidth={854}
            targetHeight={491}
          />
          <AdminImageUploader
            label="Extra Large 圖片"
            hint="1146x745"
            slug={slug}
            imageType="extra-large"
            bucket="blog-images"
            value={watch('extra_large_image')}
            onChange={(url) => setValue('extra_large_image', url)}
            slugRequiredMessage="請先填寫文章標題以產生 Slug"
            targetWidth={1146}
            targetHeight={745}
          />
          <AdminImageUploader
            label="內文圖片 1"
            hint="570x327"
            slug={slug}
            imageType="single-1"
            bucket="blog-images"
            value={watch('single_img_one')}
            onChange={(url) => setValue('single_img_one', url)}
            slugRequiredMessage="請先填寫文章標題以產生 Slug"
            targetWidth={570}
            targetHeight={327}
          />
          <AdminImageUploader
            label="內文圖片 2"
            hint="570x327"
            slug={slug}
            imageType="single-2"
            bucket="blog-images"
            value={watch('single_img_two')}
            onChange={(url) => setValue('single_img_two', url)}
            slugRequiredMessage="請先填寫文章標題以產生 Slug"
            targetWidth={570}
            targetHeight={327}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              圖片替代文字
            </label>
            <input
              {...register('alt_image')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              內文圖片替代文字
            </label>
            <input
              {...register('single_img_alt')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 標籤 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">標籤</h2>
        <TagMultiSelect
          tags={tags}
          selected={tagIds || []}
          onChange={(ids) => setValue('tag_ids', ids)}
        />
      </section>

      {/* 內容 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">文章內容</h2>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            引言區塊
          </label>
          <textarea
            {...register('blockquote_desc')}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            正文內容（Markdown）
          </label>
          <textarea
            {...register('content')}
            rows={12}
            placeholder="支援 Markdown 格式"
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* 設定 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">設定</h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              {...register('is_featured')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">精選文章</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              {...register('published')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">已發布</span>
          </label>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/blogs')}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : isEdit ? '更新文章' : '新增文章'}
        </button>
      </div>
    </form>
  );
}
