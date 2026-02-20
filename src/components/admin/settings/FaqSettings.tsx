'use client';

import { useState } from 'react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSettingsProps {
  initialData: Record<string, unknown>;
}

function parseJson<T>(data: Record<string, unknown>, key: string, fallback: T): T {
  try {
    const raw = data[key] as string;
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function FaqSettings({ initialData }: FaqSettingsProps) {
  const [faqPageTitle, setFaqPageTitle] = useState((initialData.faq_page_title as string) || '');
  const [faqPageDesc, setFaqPageDesc] = useState((initialData.faq_page_desc as string) || '');
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() => parseJson(initialData, 'faq_items_json', []));

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addFaqItem() {
    setFaqItems([...faqItems, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
  }

  function removeFaqItem(index: number) {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  }

  function updateFaqItem(index: number, field: 'question' | 'answer', value: string) {
    const updated = [...faqItems];
    updated[index] = { ...updated[index], [field]: value };
    setFaqItems(updated);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'faq',
          settings: {
            faq_page_title: faqPageTitle,
            faq_page_desc: faqPageDesc,
            faq_items_json: JSON.stringify(faqItems),
          },
        }),
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">常見問題設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">頁面標題</label>
            <input type="text" value={faqPageTitle} onChange={(e) => setFaqPageTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">頁面描述</label>
            <input type="text" value={faqPageDesc} onChange={(e) => setFaqPageDesc(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">常見問題項目</h2>
          <button type="button" onClick={addFaqItem}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增問答
          </button>
        </div>

        {faqItems.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">尚無 FAQ 項目，請點擊「新增問答」</p>
        ) : (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={item.id} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-xs font-medium text-gray-400">問答 #{index + 1}</span>
                  <button type="button" onClick={() => removeFaqItem(index)}
                    className="text-xs text-red-600 hover:text-red-800">刪除</button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">問題</label>
                    <input type="text" value={item.question} onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                      placeholder="輸入問題" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">答案</label>
                    <textarea value={item.answer} onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                      placeholder="輸入答案" rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">設定已成功儲存</div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  );
}
