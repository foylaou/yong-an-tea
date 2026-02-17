'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productFormSchema, type ProductFormData } from '@/lib/validations/product';
import ProductImageBatchUploader from '../common/ProductImageBatchUploader';
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
    stock_qty: initialData?.stock_qty ?? 0,
    max_qty: initialData?.max_qty ?? 0,
    detail_desc: initialData?.detail_desc || '',
    features: initialData?.features || '',
    attributes_json: initialData?.attributes_json || '[]',
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

  // --- 自訂屬性 (attributes_json) ---
  type Attribute = { name: string; value: string; unit: string };
  const parseAttrs = (json: string | null | undefined): Attribute[] => {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  };
  const [attributes, setAttributes] = useState<Attribute[]>(
    parseAttrs(defaultValues.attributes_json)
  );
  const syncAttrs = (next: Attribute[]) => {
    setAttributes(next);
    setValue('attributes_json', JSON.stringify(next));
  };
  const addAttribute = () => syncAttrs([...attributes, { name: '', value: '', unit: '' }]);
  const removeAttribute = (idx: number) => syncAttrs(attributes.filter((_, i) => i !== idx));
  const updateAttribute = (idx: number, field: keyof Attribute, val: string) => {
    const next = attributes.map((a, i) => i === idx ? { ...a, [field]: val } : a);
    syncAttrs(next);
  };

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
        <ProductImageBatchUploader
          slug={slug}
          values={{
            xs_image: watch('xs_image') || null,
            sm_image: watch('sm_image') || null,
            md_image: watch('md_image') || null,
            home_collection_img: watch('home_collection_img') || null,
            category_banner_img: watch('category_banner_img') || null,
          }}
          onChange={(field, url) => setValue(field as keyof ProductFormData, url)}
        />
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

      {/* 商品詳情（前台詳情頁 Tab） */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">商品詳情</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">商品描述</label>
            <textarea
              {...register('detail_desc')}
              rows={4}
              placeholder="前台商品詳情頁「商品描述」tab 的描述內文"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">產品特色</label>
            <textarea
              {...register('features')}
              rows={5}
              placeholder={"每行一項，例：\n全襯墊背板，織帶提把\n內部襯墊袋可放置 15 吋筆電\n高級棉帆布面料"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">每行一項產品特色</p>
          </div>
        </div>
      </section>

      {/* 庫存管理 */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">庫存管理</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">庫存數量</label>
            <input
              type="number"
              min="0"
              {...register('stock_qty', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.stock_qty && <p className="mt-1 text-sm text-red-600">{errors.stock_qty.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">購物車上限</label>
            <input
              type="number"
              min="0"
              {...register('max_qty', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">0 = 不限制</p>
            {errors.max_qty && <p className="mt-1 text-sm text-red-600">{errors.max_qty.message}</p>}
          </div>
        </div>
      </section>

      {/* 自訂屬性（其他資訊） */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">自訂屬性</h2>
          <button
            type="button"
            onClick={addAttribute}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            + 新增屬性
          </button>
        </div>
        <p className="mb-3 text-xs text-gray-400">前台「其他資訊」tab 顯示的屬性，如重量、尺寸、容量等</p>
        {attributes.length === 0 && (
          <p className="text-sm text-gray-400">尚未新增任何屬性</p>
        )}
        <div className="space-y-3">
          {attributes.map((attr, idx) => (
            <div key={idx} className="flex items-end gap-3">
              <div className="flex-1">
                {idx === 0 && <label className="mb-1 block text-xs font-medium text-gray-500">屬性名稱</label>}
                <input
                  value={attr.name}
                  onChange={(e) => updateAttribute(idx, 'name', e.target.value)}
                  placeholder="例：重量"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                {idx === 0 && <label className="mb-1 block text-xs font-medium text-gray-500">數值</label>}
                <input
                  value={attr.value}
                  onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                  placeholder="例：1.2"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-32">
                {idx === 0 && <label className="mb-1 block text-xs font-medium text-gray-500">單位</label>}
                <input
                  list="unit-suggestions"
                  value={attr.unit}
                  onChange={(e) => updateAttribute(idx, 'unit', e.target.value)}
                  placeholder="例：kg"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAttribute(idx)}
                className="mb-0.5 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="刪除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <datalist id="unit-suggestions">
          <option value="kg" />
          <option value="g" />
          <option value="L" />
          <option value="mL" />
          <option value="cm" />
          <option value="mm" />
          <option value="m" />
          <option value="oz" />
          <option value="lb" />
          <option value="pcs" />
        </datalist>
        <input type="hidden" {...register('attributes_json')} />
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
