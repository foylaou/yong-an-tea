'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  productDetailSettingsSchema,
  type ProductDetailSettingsData,
} from '@/lib/validations/settings';

interface TabMenuItem {
  id: string;
  name: string;
  tabMenuItemCName: string;
  separatorCName: string;
  tabStateNumber: number;
}

interface ProductDetailSettingsProps {
  initialData: Record<string, unknown>;
}

function parseJson<T>(data: Record<string, unknown>, key: string, fallback: T): T {
  try {
    const raw = data[key] as string;
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function ProductDetailSettings({ initialData }: ProductDetailSettingsProps) {
  // JSON field via state
  const [tabItems, setTabItems] = useState<TabMenuItem[]>(() => parseJson(initialData, 'product_tab_menu_json', []));

  // Text fields via useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductDetailSettingsData>({
    resolver: zodResolver(productDetailSettingsSchema),
    defaultValues: {
      product_tab_menu_json: (initialData.product_tab_menu_json as string) || '',
      product_desc_title: (initialData.product_desc_title as string) || '',
      product_feature_title: (initialData.product_feature_title as string) || '',
      product_review_heading: (initialData.product_review_heading as string) || '',
      product_review_title: (initialData.product_review_title as string) || '',
      product_rating_count: (initialData.product_rating_count as string) || '',
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addTabItem() {
    const nextNo = tabItems.length > 0 ? Math.max(...tabItems.map(t => t.tabStateNumber)) + 1 : 1;
    setTabItems([...tabItems, {
      id: `tab-${Date.now()}`,
      name: '',
      tabMenuItemCName: 'product-tab-list-item',
      separatorCName: 'separator',
      tabStateNumber: nextNo,
    }]);
  }

  function removeTabItem(index: number) {
    setTabItems(tabItems.filter((_, i) => i !== index));
  }

  function updateTabItem(index: number, field: keyof TabMenuItem, value: string) {
    const updated = [...tabItems];
    updated[index] = { ...updated[index], [field]: value };
    setTabItems(updated);
  }

  // Toggle advanced fields visibility
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function onSubmit(data: ProductDetailSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'product_detail',
          settings: {
            ...data,
            product_tab_menu_json: JSON.stringify(tabItems),
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">商品詳情設定</h2>

        <div className="space-y-4">
          {/* Tab Menu Visual Editor */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">頁籤選單</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-gray-500 hover:text-gray-700">
                  {showAdvanced ? '隱藏進階' : '顯示進階'}
                </button>
                <button type="button" onClick={addTabItem}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  + 新增 Tab
                </button>
              </div>
            </div>
            {tabItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">尚無 Tab 項目，請點擊「新增 Tab」</p>
            ) : (
              <div className="space-y-2">
                {tabItems.map((item, index) => (
                  <div key={item.id} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-center text-xs text-gray-400">#{item.tabStateNumber}</span>
                      <input type="text" value={item.name} onChange={(e) => updateTabItem(index, 'name', e.target.value)}
                        placeholder="Tab 名稱" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                      <button type="button" onClick={() => removeTabItem(index)}
                        className="text-xs text-red-600 hover:text-red-800">刪除</button>
                    </div>
                    {showAdvanced && (
                      <div className="mt-2 flex items-center gap-2 pl-12">
                        <input type="text" value={item.tabMenuItemCName} onChange={(e) => updateTabItem(index, 'tabMenuItemCName', e.target.value)}
                          placeholder="tabMenuItemCName" className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                        <input type="text" value={item.separatorCName} onChange={(e) => updateTabItem(index, 'separatorCName', e.target.value)}
                          placeholder="separatorCName" className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">商品描述標題</label>
            <input type="text" {...register('product_desc_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.product_desc_title && <p className="mt-1 text-sm text-red-600">{errors.product_desc_title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">商品特色標題</label>
            <input type="text" {...register('product_feature_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.product_feature_title && <p className="mt-1 text-sm text-red-600">{errors.product_feature_title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">評論區標題</label>
            <input type="text" {...register('product_review_heading')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.product_review_heading && <p className="mt-1 text-sm text-red-600">{errors.product_review_heading.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">評論標題</label>
            <input type="text" {...register('product_review_title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.product_review_title && <p className="mt-1 text-sm text-red-600">{errors.product_review_title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">評分數量</label>
            <input type="text" {...register('product_rating_count')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            {errors.product_rating_count && <p className="mt-1 text-sm text-red-600">{errors.product_rating_count.message}</p>}
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
        <button type="submit" disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  );
}
