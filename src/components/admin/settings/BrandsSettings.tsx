'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';

interface BrandItem {
  id: string;
  brandImg: string;
  brandImgAlt: string;
}

interface BrandsSettingsProps {
  initialData: Record<string, unknown>;
}

function parseBrands(data: Record<string, unknown>): BrandItem[] {
  try {
    const raw = data.brands_json as string;
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function BrandsSettings({ initialData }: BrandsSettingsProps) {
  const [brands, setBrands] = useState<BrandItem[]>(() => parseBrands(initialData));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addBrand() {
    setBrands([...brands, { id: String(Date.now()), brandImg: '', brandImgAlt: '品牌圖片' }]);
  }

  function removeBrand(index: number) {
    setBrands(brands.filter((_, i) => i !== index));
  }

  function updateBrand(index: number, field: keyof BrandItem, value: string) {
    const updated = [...brands];
    updated[index] = { ...updated[index], [field]: value };
    setBrands(updated);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const filtered = brands.filter((b) => b.brandImg.trim());

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'brands',
          settings: { brands_json: JSON.stringify(filtered) },
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
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">品牌輪播設定</h2>
            <p className="text-sm text-gray-500">管理首頁品牌 Logo 輪播區塊</p>
          </div>
          <button
            type="button"
            onClick={addBrand}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            + 新增品牌
          </button>
        </div>

        {brands.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">尚無品牌資料，請點擊「新增品牌」</p>
        )}

        <div className="space-y-4">
          {brands.map((brand, index) => (
            <div key={brand.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">品牌 {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeBrand(index)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  刪除
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ImageUploader
                  label="品牌圖片"
                  hint="建議尺寸 200×80px，PNG 去背"
                  folder="brands"
                  name={`brand-${index + 1}`}
                  value={brand.brandImg}
                  onChange={(url) => updateBrand(index, 'brandImg', url)}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">替代文字</label>
                  <input
                    type="text"
                    value={brand.brandImgAlt}
                    onChange={(e) => updateBrand(index, 'brandImgAlt', e.target.value)}
                    placeholder="品牌圖片"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          ))}
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
