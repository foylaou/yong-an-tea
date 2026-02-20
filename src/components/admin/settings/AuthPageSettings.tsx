'use client';

import { useState } from 'react';

interface AuthTabItem {
  id: string;
  authMenuName: string;
  tabStateNo: number;
}

interface AuthPageSettingsProps {
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

export default function AuthPageSettings({ initialData }: AuthPageSettingsProps) {
  const [tabItems, setTabItems] = useState<AuthTabItem[]>(() => parseJson(initialData, 'auth_tab_menu_json', []));

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addTabItem() {
    const nextNo = tabItems.length > 0 ? Math.max(...tabItems.map(t => t.tabStateNo)) + 1 : 1;
    setTabItems([...tabItems, { id: `tab-${Date.now()}`, authMenuName: '', tabStateNo: nextNo }]);
  }

  function removeTabItem(index: number) {
    setTabItems(tabItems.filter((_, i) => i !== index));
  }

  function updateTabItem(index: number, value: string) {
    const updated = [...tabItems];
    updated[index] = { ...updated[index], authMenuName: value };
    setTabItems(updated);
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
          group: 'auth_page',
          settings: {
            auth_tab_menu_json: JSON.stringify(tabItems),
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">登入頁面設定</h2>
          <button type="button" onClick={addTabItem}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增 Tab
          </button>
        </div>

        <p className="mb-4 text-xs text-gray-500">Tab 編號對應前台的登入(1)/註冊(2)表單面板</p>

        {tabItems.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">尚無 Tab 項目，請點擊「新增 Tab」</p>
        ) : (
          <div className="space-y-2">
            {tabItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-16 text-center text-sm text-gray-500">#{item.tabStateNo}</span>
                <input type="text" value={item.authMenuName} onChange={(e) => updateTabItem(index, e.target.value)}
                  placeholder="Tab 名稱" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                <button type="button" onClick={() => removeTabItem(index)}
                  className="text-xs text-red-600 hover:text-red-800">刪除</button>
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
