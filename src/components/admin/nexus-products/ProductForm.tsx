'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productFormSchema, type ProductFormData } from '@/lib/validations/product';
import ProductImageGallery, { type GalleryImage } from '@/components/admin/common/ProductImageGallery';
import CategoryMultiSelect from '@/components/admin/products/CategoryMultiSelect';
import type { AdminProduct } from '@/types/admin-product';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: AdminProduct;
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

export function ProductForm({ categories, initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: ProductFormData = {
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    price: initialData?.price ?? 0,
    discount_price: initialData?.discount_price ?? null,
    wholesale_price: initialData?.wholesale_price ?? null,
    sku: initialData?.sku != null ? String(initialData.sku) : '',
    desc_text: initialData?.desc_text || '',
    availability: initialData?.availability || 'in-stock',
    thermosphere: initialData?.thermosphere || '0001',
    stock_qty: initialData?.stock_qty ?? 0,
    max_qty: initialData?.max_qty ?? 0,
    detail_desc: (initialData as any)?.detail_desc || '',
    features: (initialData as any)?.features || '',
    attributes_json: initialData?.attributes_json || '[]',
    tag: initialData?.tag || '',
    is_featured: initialData?.is_featured ?? false,
    is_new_arrival: initialData?.is_new_arrival ?? false,
    show_in_banner: initialData?.show_in_banner ?? false,
    banner_order: initialData?.banner_order ?? 0,
    is_active: initialData?.is_active ?? true,
    sort_order: initialData?.sort_order ?? 0,
    content: (initialData as any)?.content || '',
    xs_image: initialData?.xs_image || '',
    sm_image: initialData?.sm_image || '',
    md_image: initialData?.md_image || '',
    home_collection_img: initialData?.home_collection_img || '',
    category_banner_img: initialData?.category_banner_img || '',
    alt_image: initialData?.alt_image || '',
    sold_out_sticker: initialData?.sold_out_sticker || '',
    best_seller_sticker: initialData?.best_seller_sticker || '',
    offer_sticker: initialData?.offer_sticker || '',
    category_ids: initialData?.product_categories?.map((pc) => pc.category_id) || [],
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
    try {
      return JSON.parse(json || '[]');
    } catch {
      return [];
    }
  };
  const [attributes, setAttributes] = useState<Attribute[]>(parseAttrs(defaultValues.attributes_json));
  const syncAttrs = (next: Attribute[]) => {
    setAttributes(next);
    setValue('attributes_json', JSON.stringify(next));
  };
  const addAttribute = () => syncAttrs([...attributes, { name: '', value: '', unit: '' }]);
  const removeAttribute = (idx: number) => syncAttrs(attributes.filter((_, i) => i !== idx));
  const updateAttribute = (idx: number, field: keyof Attribute, val: string) => {
    syncAttrs(attributes.map((a, i) => (i === idx ? { ...a, [field]: val } : a)));
  };

  // --- 商品圖片 (gallery images) ---
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    initialData?.product_images?.map((img) => ({
      id: img.id,
      sm_url: img.sm_url,
      md_url: img.md_url,
      alt_text: img.alt_text || '',
    })) || [],
  );

  // --- 產品變體 (variants) ---
  type Variant = { name: string; price: number; discount_price: number | null; wholesale_price: number | null; stock_qty: number; sku: string; image_index: number | null };
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.product_variants?.map((v) => ({
      name: v.name || '',
      price: v.price ?? 0,
      discount_price: v.discount_price ?? null,
      wholesale_price: v.wholesale_price ?? null,
      stock_qty: v.stock_qty ?? 0,
      sku: v.sku || '',
      image_index: v.image_index ?? null,
    })) || [],
  );
  const [variantStockMode, setVariantStockMode] = useState<'shared' | 'independent'>(initialData?.variant_stock_mode || 'shared');
  const addVariant = () =>
    setVariants([...variants, { name: '', price: 0, discount_price: null, wholesale_price: null, stock_qty: 0, sku: '', image_index: null }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: keyof Variant, val: string | number | null) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: val } : v)));
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
      const url = isEdit ? `/api/admin/products/${initialData!.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, variant_stock_mode: variantStockMode, variants, gallery_images: galleryImages }),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <div className="alert alert-error text-sm">{serverError}</div>}

      {/* 基本資訊 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">基本資訊</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">商品名稱 *</legend>
              <input {...register('title')} onChange={handleTitleChange} className="input w-full" />
              {errors.title && <p className="text-error mt-1 text-sm">{errors.title.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Slug * {isEdit && <span className="text-base-content/40 text-xs">（編輯時不可修改）</span>}
              </legend>
              <input {...register('slug')} readOnly={isEdit} className={`input w-full ${isEdit ? 'cursor-not-allowed opacity-60' : ''}`} />
              {errors.slug && <p className="text-error mt-1 text-sm">{errors.slug.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">價格 *</legend>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="input w-full" />
              {errors.price && <p className="text-error mt-1 text-sm">{errors.price.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">折扣價</legend>
              <input
                type="number"
                step="0.01"
                {...register('discount_price', { setValueAs: (v: string) => (v === '' ? null : Number(v)) })}
                className="input w-full"
              />
              {errors.discount_price && <p className="text-error mt-1 text-sm">{errors.discount_price.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">批發價</legend>
              <input
                type="number"
                step="0.01"
                {...register('wholesale_price', { setValueAs: (v: string) => (v === '' ? null : Number(v)) })}
                className="input w-full"
              />
              {errors.wholesale_price && <p className="text-error mt-1 text-sm">{errors.wholesale_price.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">SKU</legend>
              <input
                {...register('sku', { setValueAs: (v: any) => (v == null || (typeof v === 'number' && isNaN(v)) ? '' : String(v)) })}
                placeholder="例：TEA-001"
                className="input w-full"
              />
              {errors.sku && <p className="text-error mt-1 text-sm">{errors.sku.message}</p>}
            </fieldset>
            <fieldset className="fieldset md:col-span-2">
              <legend className="fieldset-legend">商品描述</legend>
              <textarea {...register('desc_text')} rows={3} className="textarea w-full" />
            </fieldset>
          </div>
        </div>
      </div>

      {/* 商品圖片 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">商品圖片</h2>
          <ProductImageGallery slug={slug} images={galleryImages} onChange={setGalleryImages} />
          <fieldset className="fieldset mt-2">
            <legend className="fieldset-legend">圖片替代文字</legend>
            <input {...register('alt_image')} className="input w-full" />
          </fieldset>
        </div>
      </div>

      {/* 分類與標籤 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">分類與標籤</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CategoryMultiSelect categories={categories} selected={categoryIds || []} onChange={(ids) => setValue('category_ids', ids)} />
            <fieldset className="fieldset">
              <legend className="fieldset-legend">標籤</legend>
              <input {...register('tag')} placeholder="例：chair, table" className="input w-full" />
            </fieldset>
          </div>
        </div>
      </div>

      {/* 商品頁面內容（Puck 編輯器） */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">商品頁面內容</h2>
          {isEdit && initialData?.id ? (
            <div>
              <a href={`/admin/products/${initialData.id}/editor`} className="btn btn-sm">
                <span className="iconify lucide--pencil-line size-4" />
                編輯頁面內容
              </a>
              {initialData?.puck_data != null && (
                <p className="text-base-content/50 mt-2 text-xs">
                  已有頁面內容（{(initialData.puck_data as any)?.content?.length ?? 0} 個區塊）
                </p>
              )}
            </div>
          ) : (
            <p className="text-base-content/40 text-sm">請先儲存商品後再編輯頁面內容</p>
          )}
        </div>
      </div>

      {/* 庫存管理 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">庫存管理</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">庫存狀態</legend>
              <select {...register('availability')} className="select w-full">
                <option value="in-stock">有庫存</option>
                <option value="out-of-stock">缺貨</option>
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">保存溫層</legend>
              <select {...register('thermosphere')} className="select w-full">
                <option value="0001">常溫</option>
                <option value="0002">冷藏</option>
                <option value="0003">冷凍</option>
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">庫存數量</legend>
              <input type="number" min="0" {...register('stock_qty', { valueAsNumber: true })} className="input w-full" />
              {errors.stock_qty && <p className="text-error mt-1 text-sm">{errors.stock_qty.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">購物車上限</legend>
              <input type="number" min="0" {...register('max_qty', { valueAsNumber: true })} className="input w-full" />
              <p className="text-base-content/40 mt-1 text-xs">0 = 不限制</p>
              {errors.max_qty && <p className="text-error mt-1 text-sm">{errors.max_qty.message}</p>}
            </fieldset>
          </div>
        </div>
      </div>

      {/* 產品變體 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">產品變體</h2>
            <button type="button" onClick={addVariant} className="btn btn-sm btn-outline">
              + 新增變體
            </button>
          </div>
          <p className="text-base-content/40 text-xs">例如：罐裝 $500、無罐裝 $400。未選擇時前台顯示價格區間。</p>

          {variants.length > 0 && (
            <div className="bg-base-200 mb-2 rounded-box p-3">
              <p className="text-base-content/60 mb-2 text-xs font-medium">庫存管理方式</p>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="variant_stock_mode"
                    className="radio radio-sm"
                    checked={variantStockMode === 'shared'}
                    onChange={() => setVariantStockMode('shared')}
                  />
                  <span>與商品共用庫存</span>
                  <span className="text-base-content/40 text-xs">（所有規格共用商品庫存 {watch('stock_qty') ?? 0}）</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="variant_stock_mode"
                    className="radio radio-sm"
                    checked={variantStockMode === 'independent'}
                    onChange={() => setVariantStockMode('independent')}
                  />
                  <span>各規格獨立庫存</span>
                </label>
              </div>
            </div>
          )}

          {variants.length === 0 && <p className="text-base-content/40 text-sm">尚未新增變體（使用主商品價格）</p>}

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 basis-40">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">變體名稱 *</label>}
                  <input value={v.name} onChange={(e) => updateVariant(idx, 'name', e.target.value)} placeholder="例：罐裝" className="input input-sm w-full" />
                </div>
                <div className="w-28">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">價格 *</label>}
                  <input
                    type="number"
                    step="0.01"
                    value={v.price}
                    onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                    className="input input-sm w-full"
                  />
                </div>
                <div className="w-28">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">折扣價</label>}
                  <input
                    type="number"
                    step="0.01"
                    value={v.discount_price ?? ''}
                    onChange={(e) => updateVariant(idx, 'discount_price', e.target.value === '' ? null : Number(e.target.value))}
                    className="input input-sm w-full"
                  />
                </div>
                <div className="w-28">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">批發價</label>}
                  <input
                    type="number"
                    step="0.01"
                    value={v.wholesale_price ?? ''}
                    onChange={(e) => updateVariant(idx, 'wholesale_price', e.target.value === '' ? null : Number(e.target.value))}
                    className="input input-sm w-full"
                  />
                </div>
                {variantStockMode === 'independent' && (
                  <div className="w-20">
                    {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">庫存</label>}
                    <input
                      type="number"
                      min="0"
                      value={v.stock_qty}
                      onChange={(e) => updateVariant(idx, 'stock_qty', Number(e.target.value))}
                      className="input input-sm w-full"
                    />
                  </div>
                )}
                <div className="w-28">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">SKU</label>}
                  <input value={v.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} placeholder="選填" className="input input-sm w-full" />
                </div>
                <div className="w-24">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">對應圖片</label>}
                  <select
                    value={v.image_index ?? ''}
                    onChange={(e) => updateVariant(idx, 'image_index', e.target.value === '' ? null : Number(e.target.value))}
                    className="select select-sm w-full"
                  >
                    <option value="">無</option>
                    {galleryImages.map((_, imgIdx) => (
                      <option key={imgIdx} value={imgIdx}>
                        圖 {imgIdx + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => removeVariant(idx)} className="btn btn-sm btn-square btn-ghost text-error" title="刪除">
                  <span className="iconify lucide--x size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 自訂屬性 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">自訂屬性</h2>
            <button type="button" onClick={addAttribute} className="btn btn-sm btn-outline">
              + 新增屬性
            </button>
          </div>
          <p className="text-base-content/40 text-xs">前台「其他資訊」tab 顯示的屬性，如重量、尺寸、容量等</p>
          {attributes.length === 0 && <p className="text-base-content/40 text-sm">尚未新增任何屬性</p>}
          <div className="space-y-3">
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">屬性名稱</label>}
                  <input value={attr.name} onChange={(e) => updateAttribute(idx, 'name', e.target.value)} placeholder="例：重量" className="input input-sm w-full" />
                </div>
                <div className="flex-1">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">數值</label>}
                  <input value={attr.value} onChange={(e) => updateAttribute(idx, 'value', e.target.value)} placeholder="例：1.2" className="input input-sm w-full" />
                </div>
                <div className="w-32">
                  {idx === 0 && <label className="text-base-content/50 mb-1 block text-xs font-medium">單位</label>}
                  <input
                    list="unit-suggestions"
                    value={attr.unit}
                    onChange={(e) => updateAttribute(idx, 'unit', e.target.value)}
                    placeholder="例：kg"
                    className="input input-sm w-full"
                  />
                </div>
                <button type="button" onClick={() => removeAttribute(idx)} className="btn btn-sm btn-square btn-ghost text-error" title="刪除">
                  <span className="iconify lucide--x size-4" />
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
        </div>
      </div>

      {/* 標籤貼紙 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">標籤貼紙</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">售罄標籤</legend>
              <input {...register('sold_out_sticker')} placeholder="例：Out of Stock" className="input w-full" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">暢銷標籤</legend>
              <input {...register('best_seller_sticker')} placeholder="例：Sale" className="input w-full" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">優惠標籤</legend>
              <input {...register('offer_sticker')} placeholder="例：-25%" className="input w-full" />
            </fieldset>
          </div>
        </div>
      </div>

      {/* 設定 */}
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">設定</h2>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('is_featured')} className="checkbox checkbox-sm" />
              <span className="text-sm">精選商品</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('is_new_arrival')} className="checkbox checkbox-sm" />
              <span className="text-sm">新品到貨</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('show_in_banner')} className="checkbox checkbox-sm" />
              <span className="text-sm">分類 Banner</span>
            </label>
            {watch('show_in_banner') && (
              <div className="flex items-center gap-2">
                <label className="text-sm">Banner 排序</label>
                <input type="number" {...register('banner_order', { valueAsNumber: true })} className="input input-sm w-20" />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('is_active')} className="checkbox checkbox-sm" />
              <span className="text-sm">上架中</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm">排序</label>
              <input type="number" {...register('sort_order', { valueAsNumber: true })} className="input input-sm w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* hidden fields to preserve existing data */}
      <input type="hidden" {...register('detail_desc')} />
      <input type="hidden" {...register('features')} />
      <input type="hidden" {...register('content')} />

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/products')} className="btn btn-outline">
          取消
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? '儲存中...' : isEdit ? '更新商品' : '新增商品'}
        </button>
      </div>
    </form>
  );
}
