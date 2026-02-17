'use client';

import { useState } from 'react';
import AdminImageUploader from '../common/AdminImageUploader';
import { OVERLAY_DEFAULTS } from '../../Hero/hero-utils';

interface HeroSettingsProps {
  initialData: Record<string, unknown>;
}

interface DefaultSlide {
  id: string;
  backgroundImage: string;
  subtitle: string;
  title: string;
  desc: string;
  textColor: string;
  subtitleColor: string;
  overlayColor: string;
  overlayOpacity: number;
  overlayDirection: string;
  buttonStyle: string;
}

interface BoxedSlide {
  id: string;
  image: string;
  imageAlt: string;
  subtitle: string;
  title: string;
}

interface CarouselSlide {
  id: string;
  backgroundImage: string;
  title: string;
  desc: string;
  textColor: string;
  overlayColor: string;
  overlayOpacity: number;
  overlayDirection: string;
  buttonStyle: string;
}

interface CollectionSlide {
  id: string;
  subtitle: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
}

function parseJson<T>(raw: unknown, fallback: T[]): T[] {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

// --- Collapsible Section ---
function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white shadow">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between p-6 text-left">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <svg className={`h-5 w-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="border-t border-gray-100 p-6 pt-4">{children}</div>}
    </section>
  );
}

// --- Field Row ---
function Field({ label, value, onChange, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  const cls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={cls} placeholder={placeholder} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} />
      )}
    </div>
  );
}

// --- Overlay Controls Block ---
const DIRECTION_OPTIONS = [
  { value: 'full', label: '全覆蓋' },
  { value: 'left', label: '從左漸變' },
  { value: 'right', label: '從右漸變' },
  { value: 'top', label: '從上漸變' },
  { value: 'bottom', label: '從下漸變' },
];
const BUTTON_STYLE_OPTIONS = [
  { value: 'dark', label: '深色按鈕' },
  { value: 'light', label: '淺色按鈕' },
];

function OverlayControls<T extends Record<string, any>>({
  slide,
  index,
  list,
  setList,
  updateSlide,
  showSubtitleColor,
}: {
  slide: T;
  index: number;
  list: T[];
  setList: (v: T[]) => void;
  updateSlide: (list: T[], setList: (v: T[]) => void, index: number, patch: Partial<T>) => void;
  showSubtitleColor?: boolean;
}) {
  const selCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";
  return (
    <div className="mt-3 rounded-md border border-dashed border-gray-300 p-3">
      <p className="mb-2 text-xs font-medium text-gray-500">文字與覆蓋層設定</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {/* Text Color */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">文字顏色</label>
          <input type="color" value={slide.textColor ?? OVERLAY_DEFAULTS.textColor} onChange={(e) => updateSlide(list, setList, index, { textColor: e.target.value } as any)} className="h-9 w-full cursor-pointer rounded-md border border-gray-300" />
        </div>
        {/* Subtitle Color (default only) */}
        {showSubtitleColor && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">副標題顏色</label>
            <input type="color" value={slide.subtitleColor ?? OVERLAY_DEFAULTS.subtitleColor} onChange={(e) => updateSlide(list, setList, index, { subtitleColor: e.target.value } as any)} className="h-9 w-full cursor-pointer rounded-md border border-gray-300" />
          </div>
        )}
        {/* Overlay Color */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">覆蓋層顏色</label>
          <input type="color" value={slide.overlayColor ?? OVERLAY_DEFAULTS.overlayColor} onChange={(e) => updateSlide(list, setList, index, { overlayColor: e.target.value } as any)} className="h-9 w-full cursor-pointer rounded-md border border-gray-300" />
        </div>
        {/* Button Style */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">按鈕樣式</label>
          <select value={slide.buttonStyle ?? OVERLAY_DEFAULTS.buttonStyle} onChange={(e) => updateSlide(list, setList, index, { buttonStyle: e.target.value } as any)} className={selCls}>
            {BUTTON_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Overlay Opacity */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">覆蓋層不透明度: {slide.overlayOpacity ?? 0}%</label>
          <input type="range" min={0} max={100} step={5} value={slide.overlayOpacity ?? 0} onChange={(e) => updateSlide(list, setList, index, { overlayOpacity: Number(e.target.value) } as any)} className="w-full" />
        </div>
        {/* Overlay Direction */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">覆蓋層方向</label>
          <select value={slide.overlayDirection ?? OVERLAY_DEFAULTS.overlayDirection} onChange={(e) => updateSlide(list, setList, index, { overlayDirection: e.target.value } as any)} className={selCls}>
            {DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function HeroSettings({ initialData }: HeroSettingsProps) {
  // --- state ---
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ default: true });
  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [defaultSlides, setDefaultSlides] = useState<DefaultSlide[]>(() =>
    parseJson<DefaultSlide>(initialData.hero_default_json, [])
  );
  const [boxedSlides, setBoxedSlides] = useState<BoxedSlide[]>(() =>
    parseJson<BoxedSlide>(initialData.hero_boxed_json, [])
  );
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() =>
    parseJson<CarouselSlide>(initialData.hero_carousel_json, [])
  );
  const [collectionSlides, setCollectionSlides] = useState<CollectionSlide[]>(() =>
    parseJson<CollectionSlide>(initialData.hero_collection_json, [])
  );

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- generic helpers ---
  function updateSlide<T>(list: T[], setList: (v: T[]) => void, index: number, patch: Partial<T>) {
    setList(list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function removeSlide<T>(list: T[], setList: (v: T[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  // --- submit ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const settings: Record<string, string> = {
      hero_default_json: JSON.stringify(defaultSlides),
      hero_boxed_json: JSON.stringify(boxedSlides),
      hero_carousel_json: JSON.stringify(carouselSlides),
      hero_collection_json: JSON.stringify(collectionSlides),
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'hero', settings }),
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

  const removeBtn = "text-xs text-red-600 hover:text-red-800";
  const addBtn = "mt-3 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ===== 預設版 ===== */}
      <Section title="Hero 預設版" open={!!openSections.default} onToggle={() => toggle('default')}>
        <p className="mb-4 text-sm text-gray-500">每張幻燈片包含：背景圖片、副標題、標題、描述</p>
        <div className="space-y-4">
          {defaultSlides.map((slide, i) => (
            <div key={slide.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">幻燈片 {i + 1}</span>
                <button type="button" onClick={() => removeSlide(defaultSlides, setDefaultSlides, i)} className={removeBtn}>刪除</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AdminImageUploader
                  label="背景圖片"
                  hint="建議尺寸 1920×1080px，全寬背景"
                  slug="hero-default"
                  imageType={`slide-${i + 1}`}
                  bucket="site-assets"
                  value={slide.backgroundImage}
                  onChange={(url) => updateSlide(defaultSlides, setDefaultSlides, i, { backgroundImage: url })}
                />
                <Field label="副標題 (支援 HTML)" value={slide.subtitle} onChange={(v) => updateSlide(defaultSlides, setDefaultSlides, i, { subtitle: v })} />
                <Field label="標題 (支援 HTML)" value={slide.title} onChange={(v) => updateSlide(defaultSlides, setDefaultSlides, i, { title: v })} />
                <Field label="描述 (支援 HTML)" value={slide.desc} onChange={(v) => updateSlide(defaultSlides, setDefaultSlides, i, { desc: v })} />
              </div>
              <OverlayControls slide={slide} index={i} list={defaultSlides} setList={setDefaultSlides} updateSlide={updateSlide} showSubtitleColor />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setDefaultSlides([...defaultSlides, { id: genId('hero-default'), backgroundImage: '', subtitle: '', title: '', desc: '', textColor: OVERLAY_DEFAULTS.textColor, subtitleColor: OVERLAY_DEFAULTS.subtitleColor, overlayColor: OVERLAY_DEFAULTS.overlayColor, overlayOpacity: OVERLAY_DEFAULTS.overlayOpacity, overlayDirection: OVERLAY_DEFAULTS.overlayDirection, buttonStyle: OVERLAY_DEFAULTS.buttonStyle }])} className={addBtn}>+ 新增幻燈片</button>
      </Section>

      {/* ===== 盒裝版 ===== */}
      <Section title="Hero 盒裝版" open={!!openSections.boxed} onToggle={() => toggle('boxed')}>
        <p className="mb-4 text-sm text-gray-500">每張幻燈片包含：圖片、圖片替代文字、副標題、標題</p>
        <div className="space-y-4">
          {boxedSlides.map((slide, i) => (
            <div key={slide.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">幻燈片 {i + 1}</span>
                <button type="button" onClick={() => removeSlide(boxedSlides, setBoxedSlides, i)} className={removeBtn}>刪除</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AdminImageUploader
                  label="圖片"
                  hint="建議去背 PNG，最小 600×600px"
                  slug="hero-boxed"
                  imageType={`slide-${i + 1}`}
                  bucket="site-assets"
                  value={slide.image}
                  onChange={(url) => updateSlide(boxedSlides, setBoxedSlides, i, { image: url })}
                />
                <Field label="圖片替代文字" value={slide.imageAlt} onChange={(v) => updateSlide(boxedSlides, setBoxedSlides, i, { imageAlt: v })} />
                <Field label="副標題" value={slide.subtitle} onChange={(v) => updateSlide(boxedSlides, setBoxedSlides, i, { subtitle: v })} />
                <Field label="標題 (支援 HTML)" value={slide.title} onChange={(v) => updateSlide(boxedSlides, setBoxedSlides, i, { title: v })} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setBoxedSlides([...boxedSlides, { id: genId('hero-boxed'), image: '', imageAlt: '', subtitle: '', title: '' }])} className={addBtn}>+ 新增幻燈片</button>
      </Section>

      {/* ===== 輪播版 ===== */}
      <Section title="Hero 輪播版" open={!!openSections.carousel} onToggle={() => toggle('carousel')}>
        <p className="mb-4 text-sm text-gray-500">每張幻燈片包含：背景圖片、標題、描述</p>
        <div className="space-y-4">
          {carouselSlides.map((slide, i) => (
            <div key={slide.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">幻燈片 {i + 1}</span>
                <button type="button" onClick={() => removeSlide(carouselSlides, setCarouselSlides, i)} className={removeBtn}>刪除</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AdminImageUploader
                  label="背景圖片"
                  hint="建議尺寸 1920×1080px，全寬背景"
                  slug="hero-carousel"
                  imageType={`slide-${i + 1}`}
                  bucket="site-assets"
                  value={slide.backgroundImage}
                  onChange={(url) => updateSlide(carouselSlides, setCarouselSlides, i, { backgroundImage: url })}
                />
                <Field label="標題 (支援 HTML)" value={slide.title} onChange={(v) => updateSlide(carouselSlides, setCarouselSlides, i, { title: v })} />
                <div className="md:col-span-2">
                  <Field label="描述 (支援 HTML)" value={slide.desc} onChange={(v) => updateSlide(carouselSlides, setCarouselSlides, i, { desc: v })} />
                </div>
              </div>
              <OverlayControls slide={slide} index={i} list={carouselSlides} setList={setCarouselSlides} updateSlide={updateSlide} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setCarouselSlides([...carouselSlides, { id: genId('hero-carousel'), backgroundImage: '', title: '', desc: '', textColor: OVERLAY_DEFAULTS.textColor, overlayColor: OVERLAY_DEFAULTS.overlayColor, overlayOpacity: OVERLAY_DEFAULTS.overlayOpacity, overlayDirection: OVERLAY_DEFAULTS.overlayDirection, buttonStyle: OVERLAY_DEFAULTS.buttonStyle }])} className={addBtn}>+ 新增幻燈片</button>
      </Section>

      {/* ===== 精選版 ===== */}
      <Section title="Hero 精選版" open={!!openSections.collection} onToggle={() => toggle('collection')}>
        <p className="mb-4 text-sm text-gray-500">每張幻燈片包含：副標題、標題、描述、圖片、圖片替代文字</p>
        <div className="space-y-4">
          {collectionSlides.map((slide, i) => (
            <div key={slide.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">幻燈片 {i + 1}</span>
                <button type="button" onClick={() => removeSlide(collectionSlides, setCollectionSlides, i)} className={removeBtn}>刪除</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="副標題" value={slide.subtitle} onChange={(v) => updateSlide(collectionSlides, setCollectionSlides, i, { subtitle: v })} />
                <Field label="標題" value={slide.title} onChange={(v) => updateSlide(collectionSlides, setCollectionSlides, i, { title: v })} />
                <div className="md:col-span-2">
                  <Field label="描述 (支援 HTML)" value={slide.desc} onChange={(v) => updateSlide(collectionSlides, setCollectionSlides, i, { desc: v })} />
                </div>
                <AdminImageUploader
                  label="圖片"
                  hint="建議去背 PNG，最小 600×600px"
                  slug="hero-collection"
                  imageType={`slide-${i + 1}`}
                  bucket="site-assets"
                  value={slide.image}
                  onChange={(url) => updateSlide(collectionSlides, setCollectionSlides, i, { image: url })}
                />
                <Field label="圖片替代文字" value={slide.imageAlt} onChange={(v) => updateSlide(collectionSlides, setCollectionSlides, i, { imageAlt: v })} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setCollectionSlides([...collectionSlides, { id: genId('hero-collection'), subtitle: '', title: '', desc: '', image: '', imageAlt: '' }])} className={addBtn}>+ 新增幻燈片</button>
      </Section>

      {/* ===== Messages & Submit ===== */}
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
