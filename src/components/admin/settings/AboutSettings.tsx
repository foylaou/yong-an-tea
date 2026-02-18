'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  aboutSettingsSchema,
  type AboutSettingsData,
} from '@/lib/validations/settings';
import AdminImageUploader from '@/components/admin/common/AdminImageUploader';

interface SupportInfoItem {
  id: string;
  infoIcon: string;
  title: string;
  desc: string;
}

interface ProgressItem {
  title: string;
  progressText: string;
}

interface AboutSettingsProps {
  initialData: Record<string, unknown>;
}

function parseJSON<T>(raw: unknown, fallback: T): T {
  try {
    if (typeof raw === 'string' && raw) return JSON.parse(raw);
    return fallback;
  } catch {
    return fallback;
  }
}

const ICON_OPTIONS = [
  { value: 'IoBagHandleOutline', label: '購物袋' },
  { value: 'IoLogoPaypal', label: 'PayPal' },
  { value: 'IoNavigateOutline', label: '導航/運送' },
  { value: 'IoStopwatchOutline', label: '碼錶/時間' },
  { value: 'IoCallOutline', label: '電話' },
  { value: 'IoMailOpenOutline', label: '信件' },
  { value: 'IoLocationOutline', label: '位置' },
  { value: 'IoShieldCheckmarkOutline', label: '安全' },
  { value: 'IoCardOutline', label: '信用卡' },
  { value: 'IoGiftOutline', label: '禮物' },
];

export default function AboutSettings({ initialData }: AboutSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // JSON-managed arrays
  const [supportInfo, setSupportInfo] = useState<SupportInfoItem[]>(() =>
    parseJSON(initialData.about_support_info_json, [])
  );
  const [progressBars, setProgressBars] = useState<ProgressItem[]>(() =>
    parseJSON(initialData.about_progress_json, [])
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AboutSettingsData>({
    resolver: zodResolver(aboutSettingsSchema),
    defaultValues: {
      about_video_banner: (initialData.about_video_banner as string) || '',
      about_video_banner_alt: (initialData.about_video_banner_alt as string) || '',
      about_video_url: (initialData.about_video_url as string) || '',
      about_perfection_title: (initialData.about_perfection_title as string) || '',
      about_perfection_desc: (initialData.about_perfection_desc as string) || '',
      about_banner_alt: (initialData.about_banner_alt as string) || '',
      about_banner_one: (initialData.about_banner_one as string) || '',
      about_banner_two: (initialData.about_banner_two as string) || '',
      about_banner_three: (initialData.about_banner_three as string) || '',
      about_banner_four: (initialData.about_banner_four as string) || '',
      about_banner_five: (initialData.about_banner_five as string) || '',
    },
  });

  // --- Support info helpers ---
  function addSupportItem() {
    setSupportInfo([...supportInfo, { id: String(Date.now()), infoIcon: 'IoBagHandleOutline', title: '', desc: '' }]);
  }
  function removeSupportItem(index: number) {
    setSupportInfo(supportInfo.filter((_, i) => i !== index));
  }
  function updateSupportItem(index: number, field: keyof SupportInfoItem, value: string) {
    const updated = [...supportInfo];
    updated[index] = { ...updated[index], [field]: value };
    setSupportInfo(updated);
  }

  // --- Progress bar helpers ---
  function addProgress() {
    setProgressBars([...progressBars, { title: '', progressText: '50%' }]);
  }
  function removeProgress(index: number) {
    setProgressBars(progressBars.filter((_, i) => i !== index));
  }
  function updateProgress(index: number, field: keyof ProgressItem, value: string) {
    const updated = [...progressBars];
    updated[index] = { ...updated[index], [field]: value };
    setProgressBars(updated);
  }

  async function onSubmit(data: AboutSettingsData) {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const payload: AboutSettingsData = {
      ...data,
      about_support_info_json: JSON.stringify(supportInfo),
      about_progress_json: JSON.stringify(progressBars),
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'about', settings: payload }),
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

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Video Banner Section */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">影片橫幅</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">橫幅圖片路徑</label>
            <input type="text" {...register('about_video_banner')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">圖片替代文字</label>
            <input type="text" {...register('about_video_banner_alt')} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">YouTube 嵌入網址</label>
            <input type="text" {...register('about_video_url')} placeholder="https://www.youtube.com/embed/..." className={inputClass} />
          </div>
        </div>
      </section>

      {/* Support Info Section */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">服務特色</h2>
            <p className="text-sm text-gray-500">頁面上方的 4 個服務特色卡片</p>
          </div>
          <button type="button" onClick={addSupportItem} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增項目
          </button>
        </div>

        {supportInfo.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">尚無服務特色，請點擊「新增項目」</p>
        )}

        <div className="space-y-4">
          {supportInfo.map((item, index) => (
            <div key={item.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">項目 {index + 1}</span>
                <button type="button" onClick={() => removeSupportItem(index)} className="text-xs text-red-600 hover:text-red-800">刪除</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">圖示</label>
                  <select
                    value={item.infoIcon}
                    onChange={(e) => updateSupportItem(index, 'infoIcon', e.target.value)}
                    className={inputClass}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">標題</label>
                  <input type="text" value={item.title} onChange={(e) => updateSupportItem(index, 'title', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
                  <input type="text" value={item.desc} onChange={(e) => updateSupportItem(index, 'desc', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Perfection Section */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">理念介紹</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">標題</label>
            <input type="text" {...register('about_perfection_title')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
            <textarea {...register('about_perfection_desc')} rows={3} className={inputClass} />
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">進度條</h3>
            <button type="button" onClick={addProgress} className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
              + 新增
            </button>
          </div>
          <div className="space-y-3">
            {progressBars.map((bar, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={bar.title}
                  onChange={(e) => updateProgress(index, 'title', e.target.value)}
                  placeholder="標題"
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="text"
                  value={bar.progressText}
                  onChange={(e) => updateProgress(index, 'progressText', e.target.value)}
                  placeholder="82%"
                  className={`${inputClass} w-20`}
                />
                <button type="button" onClick={() => removeProgress(index)} className="text-xs text-red-600 hover:text-red-800">刪除</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Banners */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">圖片牆</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">圖片替代文字</label>
            <input type="text" {...register('about_banner_alt')} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminImageUploader
              label="大圖 1"
              hint="建議尺寸 780x770 (約 1:1)"
              slug="about"
              imageType="banner-one"
              bucket="site-assets"
              value={watch('about_banner_one')}
              onChange={(url) => setValue('about_banner_one', url, { shouldDirty: true })}
              targetWidth={780}
              targetHeight={770}
            />
            <AdminImageUploader
              label="小圖 2"
              hint="建議尺寸 380x380 (1:1)"
              slug="about"
              imageType="banner-two"
              bucket="site-assets"
              value={watch('about_banner_two')}
              onChange={(url) => setValue('about_banner_two', url, { shouldDirty: true })}
              targetWidth={380}
              targetHeight={380}
            />
            <AdminImageUploader
              label="小圖 3"
              hint="建議尺寸 380x380 (1:1)"
              slug="about"
              imageType="banner-three"
              bucket="site-assets"
              value={watch('about_banner_three')}
              onChange={(url) => setValue('about_banner_three', url, { shouldDirty: true })}
              targetWidth={380}
              targetHeight={380}
            />
            <AdminImageUploader
              label="小圖 4"
              hint="建議尺寸 380x380 (1:1)"
              slug="about"
              imageType="banner-four"
              bucket="site-assets"
              value={watch('about_banner_four')}
              onChange={(url) => setValue('about_banner_four', url, { shouldDirty: true })}
              targetWidth={380}
              targetHeight={380}
            />
            <div className="md:col-span-2">
              <AdminImageUploader
                label="大圖 5"
                hint="建議尺寸 780x380 (約 2:1)"
                slug="about"
                imageType="banner-five"
                bucket="site-assets"
                value={watch('about_banner_five')}
                onChange={(url) => setValue('about_banner_five', url, { shouldDirty: true })}
                targetWidth={780}
                targetHeight={380}
              />
            </div>
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
