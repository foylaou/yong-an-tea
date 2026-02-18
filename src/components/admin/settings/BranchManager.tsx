'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminImageUploader from '@/components/admin/common/AdminImageUploader';

interface Branch {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  business_hours: string;
  map_embed_url: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  is_active: boolean;
}

const emptyBranch: Omit<Branch, 'id'> = {
  name: '',
  phone: '',
  email: '',
  address: '',
  business_hours: '',
  map_embed_url: '',
  image_url: '',
  is_primary: false,
  sort_order: 0,
  is_active: true,
};

export default function BranchManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Branch, 'id'>>(emptyBranch);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/branches');
      const data = await res.json();
      if (res.ok) setBranches(data.branches);
    } catch {
      setError('載入分店資料失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  function startEdit(branch: Branch) {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      business_hours: branch.business_hours || '',
      map_embed_url: branch.map_embed_url || '',
      image_url: branch.image_url || '',
      is_primary: branch.is_primary,
      sort_order: branch.sort_order,
      is_active: branch.is_active,
    });
    setShowNew(false);
    setError(null);
    setSuccess(null);
  }

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyBranch, sort_order: branches.length });
    setShowNew(true);
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNew(false);
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('分店名稱為必填');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingId
        ? `/api/admin/branches/${editingId}`
        : '/api/admin/branches';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '儲存失敗');
        return;
      }

      setSuccess(editingId ? '分店已更新' : '分店已新增');
      setTimeout(() => setSuccess(null), 3000);
      setEditingId(null);
      setShowNew(false);
      await fetchBranches();
    } catch {
      setError('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此分店嗎？')) return;

    setDeleting(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '刪除失敗');
        return;
      }

      setSuccess('分店已刪除');
      setTimeout(() => setSuccess(null), 3000);
      if (editingId === id) {
        setEditingId(null);
      }
      await fetchBranches();
    } catch {
      setError('刪除失敗，請稍後再試');
    } finally {
      setDeleting(null);
    }
  }

  function updateForm<K extends keyof Omit<Branch, 'id'>>(key: K, value: Omit<Branch, 'id'>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black';

  // The form for editing/creating a branch
  function renderForm(branchId?: string) {
    const slug = branchId ? `branch-${branchId}` : `branch-new-${Date.now()}`;

    return (
      <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              分店名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="例：永安茶園 總店"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">電話</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              placeholder="02-12345678"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="store@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">地址</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              placeholder="台北市信義區信義路五段7號"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">營業時間</label>
          <textarea
            value={form.business_hours}
            onChange={(e) => updateForm('business_hours', e.target.value)}
            rows={2}
            placeholder="週一 – 週五：8:30 – 18:00&#10;週六 – 週日：9:00 – 17:00"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">每行一個時段</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Google Maps 嵌入網址
          </label>
          <input
            type="text"
            value={form.map_embed_url}
            onChange={(e) => updateForm('map_embed_url', e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            前往 Google Maps &rarr; 分享 &rarr; 嵌入地圖 &rarr; 複製 iframe 中的 src 網址
          </p>
        </div>

        <AdminImageUploader
          label="分店照片"
          hint="建議尺寸 800x600 (4:3)"
          slug={slug}
          imageType="branch"
          bucket="site-assets"
          value={form.image_url || undefined}
          onChange={(url) => updateForm('image_url', url)}
          targetWidth={800}
          targetHeight={600}
        />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={(e) => updateForm('is_primary', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="font-medium text-gray-700">設為主要分店</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateForm('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="font-medium text-gray-700">啟用</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
          <button
            onClick={cancelEdit}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          載入中...
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">分店管理</h2>
            <p className="text-sm text-gray-500">
              管理分店聯絡資訊，主要分店將作為網站預設聯絡資訊
            </p>
          </div>
          {!showNew && (
            <button
              onClick={startNew}
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              + 新增分店
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        {/* New branch form */}
        {showNew && renderForm()}

        {/* Branch list */}
        <div className="space-y-3">
          {branches.map((branch) => (
            <div key={branch.id}>
              {editingId === branch.id ? (
                renderForm(branch.id)
              ) : (
                <div className="flex items-center gap-4 rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                  {/* Branch image thumbnail */}
                  {branch.image_url ? (
                    <img
                      src={branch.image_url}
                      alt={branch.name}
                      className="h-14 w-14 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xl text-gray-400">
                      🏪
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{branch.name}</span>
                      {branch.is_primary && (
                        <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                          主要
                        </span>
                      )}
                      {!branch.is_active && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                          停用
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {[branch.address, branch.phone].filter(Boolean).join(' / ') || '尚未填寫資訊'}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(branch)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      編輯
                    </button>
                    {!branch.is_primary && (
                      <button
                        onClick={() => handleDelete(branch.id)}
                        disabled={deleting === branch.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleting === branch.id ? '刪除中...' : '刪除'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {branches.length === 0 && !showNew && (
            <p className="py-8 text-center text-sm text-gray-400">
              尚無分店資料，請點擊「+ 新增分店」
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
