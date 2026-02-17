'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productFormSchema, type ProductFormData } from '@/lib/validations/product';
import ProductImageUploader from './ProductImageUploader';
import CategoryMultiSelect from './CategoryMultiSelect';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: Category[];
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

export default function ProductForm({ categories, initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: ProductFormData = {
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    price: initialData?.price ?? 0,
    discount_price: initialData?.discount_price ?? null,
    sku: initialData?.sku != null ? String(initialData.sku) : '',
    desc_text: initialData?.desc_text || '',
    availability: initialData?.availability || 'in-stock',
    size: initialData?.size || '',
    color: initialData?.color || '',
    tag: initialData?.tag || '',
    is_featured: initialData?.is_featured ?? false,
    is_new_arrival: initialData?.is_new_arrival ?? false,
    show_in_banner: initialData?.show_in_banner ?? false,
    banner_order: initialData?.banner_order ?? 0,
    is_active: initialData?.is_active ?? true,
    sort_order: initialData?.sort_order ?? 0,
    content: initialData?.content || '',
    xs_image: initialData?.xs_image || '',
    sm_image: initialData?.sm_image || '',
    md_image: initialData?.md_image || '',
    home_collection_img: initialData?.home_collection_img || '',
    category_banner_img: initialData?.category_banner_img || '',
    alt_image: initialData?.alt_image || '',
    sold_out_sticker: initialData?.sold_out_sticker || '',
    best_seller_sticker: initialData?.best_seller_sticker || '',
    offer_sticker: initialData?.offer_sticker || '',
    category_ids: initialData?.product_categories?.map((pc: any) => pc.category_id) || [],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const slug = watch('slug');
  const categoryIds = watch('category_ids');

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setValue('title', title);
    if (!isEdit) {
      setValue('slug', slugify(title));
    }
  }

  async function onSubmit(data: ProductFormData) {
    setSubmitting(true);
    setServerError(null);

    try {
      const url = isEdit
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';
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

      router.push('/admin/products');
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

      {/* 基本資訊 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">基本資訊</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">商品名稱 *</label>
            <input
              {...register('title')}
              onChange={handleTitleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slug * {isEdit && <span className="text-xs text-gray-400">（編輯時不可修改）</span>}
            </label>
            <input
              {...register('slug')}
              readOnly={isEdit}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isEdit ? 'cursor-not-allowed bg-gray-100' : ''
              }`}
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">價格 *</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">折扣價</label>
            <input
              type="number"
              step="0.01"
              {...register('discount_price', { setValueAs: (v: string) => v === '' ? null : Number(v) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.discount_price && <p className="mt-1 text-sm text-red-600">{errors.discount_price.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">SKU</label>
            <input
              {...register('sku', { setValueAs: (v: any) => (v == null || (typeof v === 'number' && isNaN(v))) ? '' : String(v) })}
              placeholder="例：TEA-001"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">商品描述</label>
            <textarea
              {...register('desc_text')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 商品圖片 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">商品圖片</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProductImageUploader
            label="XS 圖片"
            hint="74x74"
            slug={slug}
            imageType="xs"
            value={watch('xs_image')}
            onChange={(url) => setValue('xs_image', url)}
          />
          <ProductImageUploader
            label="SM 圖片"
            hint="300x300"
            slug={slug}
            imageType="sm"
            value={watch('sm_image')}
            onChange={(url) => setValue('sm_image', url)}
          />
          <ProductImageUploader
            label="MD 圖片"
            hint="585x585"
            slug={slug}
            imageType="md"
            value={watch('md_image')}
            onChange={(url) => setValue('md_image', url)}
          />
          <ProductImageUploader
            label="首頁集合圖"
            slug={slug}
            imageType="home-collection"
            value={watch('home_collection_img')}
            onChange={(url) => setValue('home_collection_img', url)}
          />
          <ProductImageUploader
            label="分類橫幅圖"
            slug={slug}
            imageType="category-banner"
            value={watch('category_banner_img')}
            onChange={(url) => setValue('category_banner_img', url)}
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">圖片替代文字</label>
          <input
            {...register('alt_image')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* 分類與標籤 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">分類與標籤</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CategoryMultiSelect
            categories={categories}
            selected={categoryIds}
            onChange={(ids) => setValue('category_ids', ids)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">標籤</label>
            <input
              {...register('tag')}
              placeholder="例：chair, table"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 商品屬性 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">商品屬性</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">尺寸</label>
            <select
              {...register('size')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">未設定</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">顏色</label>
            <input
              {...register('color')}
              placeholder="例：yellow, red"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">庫存狀態</label>
            <select
              {...register('availability')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="in-stock">有庫存</option>
              <option value="out-of-stock">缺貨</option>
            </select>
          </div>
        </div>
      </section>

      {/* 標籤貼紙 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">標籤貼紙</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">售罄標籤</label>
            <input
              {...register('sold_out_sticker')}
              placeholder="例：Out of Stock"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">暢銷標籤</label>
            <input
              {...register('best_seller_sticker')}
              placeholder="例：Sale"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">優惠標籤</label>
            <input
              {...register('offer_sticker')}
              placeholder="例：-25%"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 設定 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">設定</h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" {...register('is_featured')} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">精選商品</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" {...register('is_new_arrival')} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">新品到貨</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" {...register('show_in_banner')} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">分類 Banner</span>
          </label>
          {watch('show_in_banner') && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Banner 排序</label>
              <input
                type="number"
                {...register('banner_order', { valueAsNumber: true })}
                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">上架中</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">排序</label>
            <input
              type="number"
              {...register('sort_order', { valueAsNumber: true })}
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 商品內容 (Markdown) */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">商品內容</h2>
        <textarea
          {...register('content')}
          rows={10}
          placeholder="支援 Markdown 格式"
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : isEdit ? '更新商品' : '新增商品'}
        </button>
      </div>
    </form>
  );
}
