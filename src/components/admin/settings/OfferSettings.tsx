'use client';

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';

interface OfferSettingsProps {
  initialData: Record<string, unknown>;
}

interface ProductOption {
  id: string;
  slug: string;
  title: string;
}

export default function OfferSettings({ initialData }: OfferSettingsProps) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const raw = initialData.offer_enabled as string;
    return raw !== 'false';
  });
  const [title, setTitle] = useState(() => (initialData.offer_title as string) || '');
  const [desc, setDesc] = useState(() => (initialData.offer_desc as string) || '');
  const [countdownDate, setCountdownDate] = useState(() => (initialData.offer_countdown_date as string) || '');
  const [link, setLink] = useState(() => (initialData.offer_link as string) || '');
  const [image, setImage] = useState(() => (initialData.offer_image as string) || '');

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products?perPage=200');
        const data = await res.json();
        if (res.ok && data.products) {
          setProducts(
            data.products.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
            }))
          );
        }
      } catch {
        // silently fail
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const currentSlug = link.replace(/^\/products\//, '');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const settings: Record<string, string> = {
      offer_enabled: enabled ? 'true' : 'false',
      offer_title: title,
      offer_desc: desc,
      offer_countdown_date: countdownDate,
      offer_link: link,
      offer_image: image,
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'offer', settings }),
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

  const inputCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">限時優惠設定</h2>
        <p className="mb-4 text-sm text-gray-500">設定首頁限時優惠區塊的內容</p>

        {/* Enable toggle */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${enabled ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">{enabled ? '已啟用' : '已停用'}</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">標題（支援 HTML）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='裝飾精選系列 <span class="offer">5 折優惠</span>'
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-400">可使用 HTML 標籤，例如 &lt;span class=&quot;offer&quot;&gt;...&lt;/span&gt;</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">描述文字</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="精選裝飾系列現正舉辦限時特惠活動..."
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">倒數日期</label>
              <input
                type="date"
                value={countdownDate}
                onChange={(e) => setCountdownDate(e.target.value)}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-gray-400">倒數計時的目標日期</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">按鈕連結商品</label>
              <select
                value={currentSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  setLink(slug ? `/products/${slug}` : '/');
                }}
                className={inputCls}
              >
                <option value="">— 請選擇商品 —</option>
                {!loadingProducts && products.map((p) => (
                  <option key={p.id} value={p.slug}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
          <ImageUploader
            label="背景圖片"
            hint="建議尺寸 1920×635px，橫幅大圖"
            folder="offer"
            name="background"
            value={image}
            onChange={setImage}
          />
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
