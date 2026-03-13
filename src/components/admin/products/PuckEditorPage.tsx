'use client';

import { useState, useCallback } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import { puckConfig } from '@/lib/puck/config';
import { useRouter } from 'next/navigation';

interface PuckEditorPageProps {
  productId: string;
  productTitle: string;
  initialData: Data | null;
}

export default function PuckEditorPage({ productId, productTitle, initialData }: PuckEditorPageProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handlePublish = useCallback(async (data: Data) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/puck-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puck_data: data }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '儲存失敗');
        return;
      }
      alert('頁面內容已儲存');
      router.push(`/admin/products/${productId}/edit`);
    } catch {
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  }, [productId, router]);

  const defaultData: Data = {
    root: { props: {} },
    content: [],
    zones: {},
  };

  return (
    <div className="puck-editor-wrapper">
      <Puck
        config={puckConfig}
        data={initialData || defaultData}
        onPublish={handlePublish}
        headerTitle={productTitle}
        headerPath={`/admin/products/${productId}/edit`}
      />
      {saving && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="rounded-lg bg-white px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
              <span>儲存中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
