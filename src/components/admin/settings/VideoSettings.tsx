'use client';

import { useState } from 'react';
import AdminImageUploader from '../common/AdminImageUploader';

interface VideoSettingsProps {
  initialData: Record<string, unknown>;
}

export default function VideoSettings({ initialData }: VideoSettingsProps) {
  const [title, setTitle] = useState(() => (initialData.video_title as string) || '');
  const [desc, setDesc] = useState(() => (initialData.video_desc as string) || '');
  const [image, setImage] = useState(() => (initialData.video_image as string) || '');
  const [imageAlt, setImageAlt] = useState(() => (initialData.video_image_alt as string) || '');
  const [url, setUrl] = useState(() => (initialData.video_url as string) || '');

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const settings: Record<string, string> = {
      video_title: title,
      video_desc: desc,
      video_image: image,
      video_image_alt: imageAlt,
      video_url: url,
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'video', settings }),
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
        <h2 className="mb-2 text-lg font-semibold text-gray-900">影片區塊設定</h2>
        <p className="mb-4 text-sm text-gray-500">設定首頁影片彈窗區塊的內容，留空則使用預設值</p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="永安茶園"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">描述文字</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="從一幅肖像開始..."
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminImageUploader
              label="背景圖片"
              hint="建議尺寸 1920×635px，橫幅大圖"
              slug="video"
              imageType="banner"
              bucket="site-assets"
              value={image}
              onChange={setImage}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">圖片替代文字</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="影片彈窗"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">YouTube 嵌入網址</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/fkoEj95puX0"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-400">格式：https://www.youtube.com/embed/影片ID</p>
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
