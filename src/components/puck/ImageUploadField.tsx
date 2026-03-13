'use client';

import { useState, useRef } from 'react';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';

export function ImageUploadField({ value, onChange, label }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: upload-prepare
      const prepRes = await fetch('/api/admin/upload-prepare', {
        method: 'POST',
        body: formData,
      });
      const prepData = await prepRes.json();
      if (!prepRes.ok) {
        setError(prepData.error || '上傳失敗');
        return;
      }

      // Step 2: upload-commit (no crop, full image)
      const commitRes = await fetch('/api/admin/upload-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempKey: prepData.tempKey,
          crop: { x: 0, y: 0, width: prepData.width, height: prepData.height },
          targets: [
            {
              slug: `puck-${Date.now()}`,
              imageType: 'puck',
              bucket: 'product-images',
              width: Math.min(prepData.width, 1200),
              height: Math.min(prepData.height, Math.round((1200 / prepData.width) * prepData.height)),
            },
          ],
        }),
      });
      const commitData = await commitRes.json();
      if (!commitRes.ok) {
        setError(commitData.error || '處理失敗');
        return;
      }

      onChange(commitData.urls?.puck || Object.values(commitData.urls)[0] as string);
    } catch {
      setError('上傳失敗');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-3 hover:border-gray-400"
      >
        {value ? (
          <div className="relative w-full">
            <img src={value} alt="" className="max-h-40 w-full rounded object-contain" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-xs text-red-500 hover:bg-red-50"
            >
              &times;
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">
            {uploading ? '上傳中...' : '點擊上傳圖片'}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            if (inputRef.current) inputRef.current.value = '';
          }}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
