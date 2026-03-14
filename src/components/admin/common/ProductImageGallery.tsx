'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Area } from 'react-easy-crop';

const CropModal = dynamic(() => import('./CropModal'), { ssr: false });

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

export interface GalleryImage {
  id: string;
  sm_url: string;
  md_url: string;
  alt_text: string;
}

interface ProductImageGalleryProps {
  slug: string;
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

type State = 'idle' | 'preparing' | 'cropping' | 'committing';

export default function ProductImageGallery({
  slug,
  images,
  onChange,
}: ProductImageGalleryProps) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
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

    const imageId = crypto.randomUUID();
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
          targets: [
            { slug, imageType: `gallery/${imageId}-sm`, bucket: 'product-images', width: 300, height: 300 },
            { slug, imageType: `gallery/${imageId}-md`, bucket: 'product-images', width: 585, height: 585 },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '處理失敗');
        setState('idle');
        return;
      }

      const urls = data.urls as Record<string, string>;
      const smKey = `gallery/${imageId}-sm`;
      const mdKey = `gallery/${imageId}-md`;

      const newImage: GalleryImage = {
        id: imageId,
        sm_url: urls[smKey] || '',
        md_url: urls[mdKey] || '',
        alt_text: '',
      };

      onChange([...images, newImage]);
      setTempKey(null);
      setPreviewUrl(null);
      setState('idle');
    } catch {
      setError('處理失敗，請稍後再試');
      setState('idle');
    }
  }

  function handleCropCancel() {
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

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function handleMoveDown(index: number) {
    if (index >= images.length - 1) return;
    const next = [...images];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const busy = state === 'preparing' || state === 'committing';

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">商品圖片</label>
      <p className="mb-3 text-xs text-gray-500">
        可上傳多張圖片，第一張為主圖。前台將以輪播方式顯示。
      </p>

      {/* Image grid */}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="group relative rounded-lg border border-gray-200 bg-gray-50 p-1"
          >
            <img
              src={img.sm_url}
              alt={img.alt_text || `商品圖片 ${idx + 1}`}
              className="aspect-square w-full rounded object-cover"
            />
            {idx === 0 && (
              <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                主圖
              </span>
            )}
            {/* Controls */}
            <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  className="rounded bg-white/90 p-1 text-xs shadow hover:bg-gray-100"
                  title="往前"
                >
                  ←
                </button>
              )}
              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  className="rounded bg-white/90 p-1 text-xs shadow hover:bg-gray-100"
                  title="往後"
                >
                  →
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded bg-white/90 p-1 text-xs text-red-500 shadow hover:bg-red-50"
                title="刪除"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Add image card */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !busy && inputRef.current?.click()}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-gray-400"
        >
          {busy ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          ) : (
            <>
              <span className="text-2xl text-gray-400">+</span>
              <span className="mt-1 text-xs text-gray-400">新增圖片</span>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

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
