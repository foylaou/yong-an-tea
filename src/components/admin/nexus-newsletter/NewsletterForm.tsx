'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewsletterFormProps {
  initialData?: {
    id: string;
    subject: string;
    content_html: string;
  };
}

export function NewsletterForm({ initialData }: NewsletterFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [subject, setSubject] = useState(initialData?.subject || '');
  const [contentHtml, setContentHtml] = useState(initialData?.content_html || '');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!subject.trim() || !contentHtml.trim()) {
      setError('主旨與內容為必填');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isEditing ? `/api/admin/newsletter/${initialData.id}` : '/api/admin/newsletter';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content_html: contentHtml }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '儲存失敗');
        return;
      }

      router.push('/admin/newsletter');
      router.refresh();
    } catch {
      setError('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!isEditing) return;
    if (!confirm('確定要發送此電子報給所有訂閱者？此操作無法撤銷。')) return;

    setSending(true);
    setError(null);

    try {
      const saveRes = await fetch(`/api/admin/newsletter/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content_html: contentHtml }),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        setError(saveData.error || '儲存失敗');
        return;
      }

      const res = await fetch(`/api/admin/newsletter/${initialData.id}/send`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        alert(`發送完成！成功 ${data.sentCount}/${data.totalSubscribers} 封`);
        router.push('/admin/newsletter');
        router.refresh();
      } else {
        setError(data.error || '發送失敗');
      }
    } catch {
      setError('發送失敗，請稍後再試');
    } finally {
      setSending(false);
    }
  }

  const isLoading = saving || sending;

  return (
    <div className="space-y-6">
      <div className="card card-border bg-base-100">
        <div className="card-body space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">主旨</legend>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="輸入電子報主旨" className="input w-full" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">內容（HTML）</legend>
            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              rows={16}
              placeholder="輸入電子報 HTML 內容"
              className="textarea w-full font-mono text-sm"
            />
          </fieldset>
        </div>
      </div>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      <div className="flex items-center justify-end gap-3">
        <button onClick={() => router.push('/admin/newsletter')} className="btn btn-outline">
          取消
        </button>
        <button onClick={handleSave} disabled={isLoading} className="btn btn-primary">
          {saving ? '儲存中...' : '儲存草稿'}
        </button>
        {isEditing && (
          <button onClick={handleSend} disabled={isLoading} className="btn btn-success">
            {sending ? '發送中...' : '立即發送'}
          </button>
        )}
      </div>
    </div>
  );
}
