'use client';

import { useState } from 'react';

interface GridTabItem {
  id: string;
  gridColumns: string;
  gridColumnImg: string;
  gridImgAlt: string;
  tabStateNo: number;
}

interface GridLayoutSettingsProps {
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

export default function GridLayoutSettings({ initialData }: GridLayoutSettingsProps) {
  const [grid2col, setGrid2col] = useState<GridTabItem[]>(() => parseJson(initialData, 'grid_tab_2col_json', []));
  const [grid3col, setGrid3col] = useState<GridTabItem[]>(() => parseJson(initialData, 'grid_tab_3col_json', []));
  const [grid3colAlt, setGrid3colAlt] = useState<GridTabItem[]>(() => parseJson(initialData, 'grid_tab_3col_alt_json', []));

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addGridItem(setter: React.Dispatch<React.SetStateAction<GridTabItem[]>>, list: GridTabItem[]) {
    const nextNo = list.length > 0 ? Math.max(...list.map(t => t.tabStateNo)) + 1 : 1;
    setter([...list, { id: `grid-${Date.now()}`, gridColumns: '', gridColumnImg: '', gridImgAlt: '', tabStateNo: nextNo }]);
  }

  function removeGridItem(setter: React.Dispatch<React.SetStateAction<GridTabItem[]>>, list: GridTabItem[], index: number) {
    setter(list.filter((_, i) => i !== index));
  }

  function updateGridItem(setter: React.Dispatch<React.SetStateAction<GridTabItem[]>>, list: GridTabItem[], index: number, field: keyof GridTabItem, value: string) {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
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
          group: 'grid_layout',
          settings: {
            grid_tab_2col_json: JSON.stringify(grid2col),
            grid_tab_3col_json: JSON.stringify(grid3col),
            grid_tab_3col_alt_json: JSON.stringify(grid3colAlt),
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

  function renderGridSection(
    title: string,
    description: string,
    list: GridTabItem[],
    setter: React.Dispatch<React.SetStateAction<GridTabItem[]>>,
  ) {
    return (
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <button type="button" onClick={() => addGridItem(setter, list)}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增選項
          </button>
        </div>

        {list.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">尚無版面選項，請點擊「新增選項」</p>
        ) : (
          <div className="space-y-3">
            {list.map((item, index) => (
              <div key={item.id} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-2 w-8 text-center text-xs text-gray-400">#{item.tabStateNo}</span>
                  <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">格數 Class</label>
                      <input type="text" value={item.gridColumns} onChange={(e) => updateGridItem(setter, list, index, 'gridColumns', e.target.value)}
                        placeholder="col-lg-6" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">圖示路徑</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={item.gridColumnImg} onChange={(e) => updateGridItem(setter, list, index, 'gridColumnImg', e.target.value)}
                          placeholder="/images/icon.svg" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                        {item.gridColumnImg && (
                          <img src={item.gridColumnImg} alt={item.gridImgAlt || 'preview'} className="h-8 w-8 object-contain" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">圖示 Alt</label>
                      <input type="text" value={item.gridImgAlt} onChange={(e) => updateGridItem(setter, list, index, 'gridImgAlt', e.target.value)}
                        placeholder="圖示描述" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeGridItem(setter, list, index)}
                    className="mt-5 text-xs text-red-600 hover:text-red-800">刪除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {renderGridSection('2 欄版面切換', '商品列表頁的 2 欄格狀版面選項', grid2col, setGrid2col)}
      {renderGridSection('3 欄版面切換', '商品列表頁的 3 欄格狀版面選項', grid3col, setGrid3col)}
      {renderGridSection('3 欄替代版面切換', '商品列表頁的 3 欄替代格狀版面選項', grid3colAlt, setGrid3colAlt)}

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
