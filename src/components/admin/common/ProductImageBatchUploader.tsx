'use client';

import { useState, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import CropModal from './CropModal';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

const PRODUCT_TARGETS = [
  { imageType: 'xs', width: 74, height: 74, label: 'XS (74x74)' },
  { imageType: 'sm', width: 300, height: 300, label: 'SM (300x300)' },
  { imageType: 'md', width: 585, height: 585, label: 'MD (585x585)' },
  { imageType: 'home-collection', width: 600, height: 600, label: '首頁集合 (600x600)' },
  { imageType: 'category-banner', width: 600, height: 600, label: '分類橫幅 (600x600)' },
] as const;

const IMAGE_TYPE_TO_FIELD: Record<string, string> = {
  xs: 'xs_image',
  sm: 'sm_image',
  md: 'md_image',
  'home-collection': 'home_collection_img',
  'category-banner': 'category_banner_img',
};

interface ProductImageBatchUploaderProps {
  slug: string;
  values: {
    xs_image: string | null;
    sm_image: string | null;
    md_image: string | null;
    home_collection_img: string | null;
    category_banner_img: string | null;
  };
  onChange: (field: string, url: string) => void;
}

type State = 'idle' | 'preparing' | 'cropping' | 'committing';

export default function ProductImageBatchUploader({
  slug,
  values,
  onChange,
}: ProductImageBatchUploaderProps) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [tempKey, setTempKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!slug) {
      setError('請先填寫商品名稱以產生 Slug');
      return;
    }

    setState('preparing');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload-prepare', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '上傳失敗');
        setState('idle');
        return;
      }

      setTempKey(data.tempKey);
      setPreviewUrl(data.previewUrl);
      setState('cropping');
    } catch {
      setError('上傳失敗，請稍後再試');
      setState('idle');
    }
  }

  async function handleCropConfirm(croppedAreaPixels: Area) {
    if (!tempKey) return;

    setState('committing');

    try {
      const res = await fetch('/api/admin/upload-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempKey,
          crop: {
            x: croppedAreaPixels.x,
            y: croppedAreaPixels.y,
            width: croppedAreaPixels.width,
            height: croppedAreaPixels.height,
          },
          targets: PRODUCT_TARGETS.map((t) => ({
            slug,
            imageType: t.imageType,
            bucket: 'product-images',
            width: t.width,
            height: t.height,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '處理失敗');
        setState('idle');
        return;
      }

      // Update each field
      for (const [imageType, url] of Object.entries(data.urls as Record<string, string>)) {
        const field = IMAGE_TYPE_TO_FIELD[imageType];
        if (field) {
          onChange(field, url);
        }
      }

      setTempKey(null);
      setPreviewUrl(null);
      setState('idle');
    } catch {
      setError('處理失敗，請稍後再試');
      setState('idle');
    }
  }

  async function handleCropCancel() {
    if (tempKey) {
      fetch('/api/admin/upload-prepare', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempKey }),
      }).catch(() => {});
    }
    setTempKey(null);
    setPreviewUrl(null);
    setState('idle');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  const busy = state === 'preparing' || state === 'committing';
  const statusText = state === 'preparing'
    ? '處理中...'
    : state === 'committing'
      ? '生成 5 種尺寸中...'
      : '點擊或拖放商品圖片（將自動生成 5 種尺寸）';

  // Collect existing thumbnails
  const thumbs = PRODUCT_TARGETS.map((t) => {
    const field = IMAGE_TYPE_TO_FIELD[t.imageType];
    const url = values[field as keyof typeof values];
    return { label: t.label, url };
  });

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">商品圖片（批次上傳）</label>
      <p className="mb-2 text-xs text-gray-500">上傳一張圖片，自動裁剪並生成 5 種尺寸</p>

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !busy && inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="text-center text-sm text-gray-500">
          {statusText}
        </div>
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Thumbnails preview */}
      {thumbs.some((t) => t.url) && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {thumbs.map((t) => (
            <div key={t.label} className="text-center">
              {t.url ? (
                <img
                  src={t.url}
                  alt={t.label}
                  className="mx-auto h-16 w-16 rounded border border-gray-200 object-cover"
                />
              ) : (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
                  無
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">{t.label}</p>
            </div>
          ))}
        </div>
      )}

      {state === 'cropping' && previewUrl && (
        <CropModal
          imageUrl={previewUrl}
          aspectRatio={1}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
