'use client';

import { useState, useRef } from 'react';

interface ProductImageUploaderProps {
  label: string;
  slug: string;
  imageType: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  hint?: string;
}

function getDisplayUrl(value: string | null | undefined, slug: string): string {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `/images/products/${slug}/${value}`;
}

export default function ProductImageUploader({
  label,
  slug,
  imageType,
  value,
  onChange,
  hint,
}: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = getDisplayUrl(value, slug);

  async function uploadFile(file: File) {
    if (!slug) {
      setError('請先填寫商品名稱以產生 Slug');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', slug);
    formData.append('imageType', imageType);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '上傳失敗');
        return;
      }
      onChange(data.url);
    } catch {
      setError('上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mb-1 text-xs text-gray-500">{hint}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={label}
            className="mb-2 max-h-32 rounded object-contain"
          />
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            {uploading ? '上傳中...' : '點擊或拖放圖片到此處'}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
