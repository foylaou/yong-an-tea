'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminImageUploader from '@/components/admin/common/AdminImageUploader';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

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
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const url = editingId ? `/api/admin/branches/${editingId}` : '/api/admin/branches';
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

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/branches/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '刪除失敗');
        return;
      }

      setSuccess('分店已刪除');
      setTimeout(() => setSuccess(null), 3000);
      if (editingId === deleteTarget.id) {
        setEditingId(null);
      }
      await fetchBranches();
    } catch {
      setError('刪除失敗，請稍後再試');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function updateForm<K extends keyof Omit<Branch, 'id'>>(key: K, value: Omit<Branch, 'id'>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // The form for editing/creating a branch
  function renderForm(branchId?: string) {
    const slug = branchId ? `branch-${branchId}` : `branch-new-${Date.now()}`;

    return (
      <div className="bg-base-200/50 border-base-300 space-y-4 rounded-md border p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              分店名稱 <span className="text-error">*</span>
            </legend>
            <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="例：永安茶園 總店" className="input input-sm w-full" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">電話</legend>
            <input type="text" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="02-12345678" className="input input-sm w-full" />
          </fieldset>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Email</legend>
            <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="store@example.com" className="input input-sm w-full" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">地址</legend>
            <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="台北市信義區信義路五段7號" className="input input-sm w-full" />
          </fieldset>
        </div>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">營業時間</legend>
          <textarea
            value={form.business_hours}
            onChange={(e) => updateForm('business_hours', e.target.value)}
            rows={2}
            placeholder="週一 – 週五：8:30 – 18:00&#10;週六 – 週日：9:00 – 17:00"
            className="textarea textarea-sm w-full"
          />
          <p className="text-base-content/50 mt-1 text-xs">每行一個時段</p>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Google Maps 嵌入網址</legend>
          <input
            type="text"
            value={form.map_embed_url}
            onChange={(e) => updateForm('map_embed_url', e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="input input-sm w-full"
          />
          <p className="text-base-content/50 mt-1 text-xs">前往 Google Maps &rarr; 分享 &rarr; 嵌入地圖 &rarr; 複製 iframe 中的 src 網址</p>
        </fieldset>

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
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_primary} onChange={(e) => updateForm('is_primary', e.target.checked)} className="checkbox checkbox-sm" />
            <span className="font-medium">設為主要分店</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => updateForm('is_active', e.target.checked)} className="checkbox checkbox-sm" />
            <span className="font-medium">啟用</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn btn-sm btn-primary">
            {saving ? '儲存中...' : '儲存'}
          </button>
          <button onClick={cancelEdit} className="btn btn-sm btn-outline">
            取消
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <div className="text-base-content/60 flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
            載入中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="card-title">分店管理</h2>
              <p className="text-base-content/60 text-sm">管理分店聯絡資訊，主要分店將作為網站預設聯絡資訊</p>
            </div>
            {!showNew && (
              <button onClick={startNew} className="btn btn-sm btn-primary">
                + 新增分店
              </button>
            )}
          </div>

          {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
          {success && <div className="alert alert-success mb-4 text-sm">{success}</div>}

          {/* New branch form */}
          {showNew && renderForm()}

          {/* Branch list */}
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id}>
                {editingId === branch.id ? (
                  renderForm(branch.id)
                ) : (
                  <div className="border-base-300 hover:bg-base-200/50 flex items-center gap-4 rounded-md border p-4 transition-colors">
                    {/* Branch image thumbnail */}
                    {branch.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={branch.image_url} alt={branch.name} className="h-14 w-14 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="bg-base-200 text-base-content/40 flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-xl">🏪</div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{branch.name}</span>
                        {branch.is_primary && <span className="badge badge-sm badge-primary">主要</span>}
                        {!branch.is_active && <span className="badge badge-sm badge-ghost">停用</span>}
                      </div>
                      <div className="text-base-content/60 mt-0.5 text-sm">{[branch.address, branch.phone].filter(Boolean).join(' / ') || '尚未填寫資訊'}</div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => startEdit(branch)} className="btn btn-sm btn-outline btn-info">
                        編輯
                      </button>
                      {!branch.is_primary && (
                        <button onClick={() => setDeleteTarget(branch)} className="btn btn-sm btn-outline btn-error">
                          刪除
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {branches.length === 0 && !showNew && <p className="text-base-content/40 py-8 text-center text-sm">尚無分店資料，請點擊「+ 新增分店」</p>}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除分店"
        message={`確定要刪除「${deleteTarget?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
