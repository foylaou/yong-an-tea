'use client';

import { useState, useEffect, useRef } from 'react';
import AdminImageUploader from '../common/AdminImageUploader';

interface FeaturedSettingsProps {
  initialData: Record<string, unknown>;
}

interface FeaturedBlock {
  id: string;
  subTitle: string;
  title: string;
  excerpt: string;
  image: string;
  altImage: string;
  path: string;
  buttonText: string;
  bgLabel: string;
}

interface ProductOption {
  id: string;
  slug: string;
  title: string;
}

function genId() {
  return Date.now().toString(36);
}

const emptyBlock = (): FeaturedBlock => ({
  id: genId(),
  subTitle: '',
  title: '',
  excerpt: '',
  image: '',
  altImage: '',
  path: '',
  buttonText: '',
  bgLabel: '',
});

function parseBlocks(raw: unknown): FeaturedBlock[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    return JSON.parse(raw) as FeaturedBlock[];
  } catch {
    return [];
  }
}

// --- Field ---
function Field({ label, value, onChange, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  const cls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} placeholder={placeholder} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} />
      )}
    </div>
  );
}

// --- Product Select ---
function ProductSelect({ label, value, onChange, products }: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  products: ProductOption[];
}) {
  const currentSlug = value.replace(/^\/products\//, '');

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={currentSlug}
        onChange={(e) => {
          const slug = e.target.value;
          onChange(slug ? `/products/${slug}` : '');
        }}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      >
        <option value="">— 請選擇商品 —</option>
        {products.map((p) => (
          <option key={p.id} value={p.slug}>{p.title}</option>
        ))}
      </select>
    </div>
  );
}

export default function FeaturedSettings({ initialData }: FeaturedSettingsProps) {
  const [blocks, setBlocks] = useState<FeaturedBlock[]>(() =>
    parseBlocks(initialData.featured_products_json)
  );
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch product list for the dropdown
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
        // silently fail — dropdown will be empty
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  function updateBlock(index: number, patch: Partial<FeaturedBlock>) {
    setBlocks(blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function removeBlock(index: number) {
    setBlocks(blocks.filter((_, i) => i !== index));
  }

  function addBlock() {
    setBlocks([...blocks, emptyBlock()]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const settings: Record<string, string> = {
      featured_products_json: JSON.stringify(blocks),
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'featured', settings }),
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
      {blocks.map((block, i) => (
        <section key={block.id} className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">精選區塊 {i + 1}</h2>
            <button type="button" onClick={() => removeBlock(i)} className="text-xs text-red-600 hover:text-red-800">刪除</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="副標題" value={block.subTitle} onChange={(v) => updateBlock(i, { subTitle: v })} placeholder="精選商品" />
            <Field label="標題" value={block.title} onChange={(v) => updateBlock(i, { title: v })} placeholder="Nancy Chair" />
            <div className="md:col-span-2">
              <Field label="描述 (支援 HTML)" value={block.excerpt} onChange={(v) => updateBlock(i, { excerpt: v })} multiline placeholder="商品描述文字..." />
            </div>
            <AdminImageUploader
              label="圖片"
              hint="建議比例 1:1，最小 585×585px"
              slug="featured"
              imageType={`block-${i + 1}`}
              bucket="site-assets"
              value={block.image}
              onChange={(url) => updateBlock(i, { image: url })}
            />
            <div className="flex flex-col gap-4">
              <Field label="圖片替代文字" value={block.altImage} onChange={(v) => updateBlock(i, { altImage: v })} placeholder="精選商品圖片" />
              <ProductSelect
                label="連結商品"
                value={block.path}
                onChange={(path) => updateBlock(i, { path })}
                products={loadingProducts ? [] : products}
              />
            </div>
            <Field label="按鈕文字" value={block.buttonText} onChange={(v) => updateBlock(i, { buttonText: v })} placeholder="僅 $90" />
            <Field label="背景標籤" value={block.bgLabel} onChange={(v) => updateBlock(i, { bgLabel: v })} placeholder="木質布藝" />
          </div>
        </section>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="w-full rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
      >
        + 新增精選區塊
      </button>

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
