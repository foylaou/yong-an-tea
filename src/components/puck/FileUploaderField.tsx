'use client';

import { useState, useRef } from 'react';

interface FileItem {
  id: string;
  name: string;
  url: string;
  size: string;
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'zip' | 'image' | 'other';
}

interface FileUploaderFieldProps {
  value: FileItem[];
  onChange: (files: FileItem[]) => void;
  label?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function detectType(name: string): FileItem['type'] {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx'].includes(ext)) return 'xls';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
  return 'other';
}

export function FileUploaderField({ value, onChange, label }: FileUploaderFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const prepRes = await fetch('/api/admin/upload-prepare', {
        method: 'POST',
        body: formData,
      });
      const prepData = await prepRes.json();
      if (!prepRes.ok) return;

      const commitRes = await fetch('/api/admin/upload-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempKey: prepData.tempKey,
          crop: { x: 0, y: 0, width: prepData.width || 100, height: prepData.height || 100 },
          targets: [
            {
              slug: `file-${Date.now()}`,
              imageType: 'file',
              bucket: 'product-images',
              width: prepData.width || 100,
              height: prepData.height || 100,
            },
          ],
        }),
      });
      const commitData = await commitRes.json();
      if (!commitRes.ok) return;

      const url = commitData.urls?.file || Object.values(commitData.urls)[0] as string;
      const newFile: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        size: formatSize(file.size),
        type: detectType(file.name),
      };
      onChange([...value, newFile]);
    } finally {
      setUploading(false);
    }
  }

  function removeFile(id: string) {
    onChange(value.filter((f) => f.id !== id));
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>}
      <div className="space-y-1">
        {value.map((f) => (
          <div key={f.id} className="flex items-center gap-2 rounded border border-gray-200 px-2 py-1 text-xs">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono uppercase">{f.type}</span>
            <span className="flex-1 truncate">{f.name}</span>
            <span className="text-gray-400">{f.size}</span>
            <button type="button" onClick={() => removeFile(f.id)} className="text-red-400 hover:text-red-600">&times;</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
      >
        {uploading ? '上傳中...' : '+ 新增檔案'}
      </button>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          if (inputRef.current) inputRef.current.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
