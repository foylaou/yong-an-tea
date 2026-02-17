'use client';

import { useState, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import CropModal from './CropModal';
import { parseAspectRatio } from '@/lib/parse-aspect-ratio';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

interface AdminImageUploaderProps {
  label: string;
  hint?: string;
  slug: string;
  imageType: string;
  bucket: string; // 'product-images' | 'blog-images' | 'site-assets'
  value: string | null | undefined;
  onChange: (url: string) => void;
  slugRequiredMessage?: string;
  targetWidth?: number;
  targetHeight?: number;
}

type State = 'idle' | 'preparing' | 'cropping' | 'committing';

export default function AdminImageUploader({
  label,
  hint,
  slug,
  imageType,
  bucket,
  value,
  onChange,
  slugRequiredMessage = '請先填寫名稱以產生 Slug',
  targetWidth,
  targetHeight,
}: AdminImageUploaderProps) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [tempKey, setTempKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = parseAspectRatio(hint);

  async function handleFile(file: File) {
    if (!slug) {
      setError(slugRequiredMessage);
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

    // Determine target dimensions
    const w = targetWidth || croppedAreaPixels.width;
    const h = targetHeight || croppedAreaPixels.height;

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
            {
              slug,
              imageType,
              bucket,
              width: w,
              height: h,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '處理失敗');
        setState('idle');
        return;
      }

      onChange(data.urls[imageType]);
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
      // Clean up temp file
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
  const statusText = state === 'preparing' ? '處理中...' : state === 'committing' ? '裁剪中...' : '點擊或拖放圖片到此處';

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mb-1 text-xs text-gray-500">{hint}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !busy && inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {value ? (
          <img src={value} alt={label} className="mb-2 max-h-32 rounded object-contain" />
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            {statusText}
          </div>
        )}
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

      {state === 'cropping' && previewUrl && (
        <CropModal
          imageUrl={previewUrl}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
