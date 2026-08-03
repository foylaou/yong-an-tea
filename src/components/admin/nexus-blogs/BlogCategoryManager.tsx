'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import { BlogSubNav } from './BlogSubNav';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function BlogCategoryManager() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blog-categories');
      if (!res.ok) throw new Error('載入失敗');
      const data = await res.json();
      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function handleNewNameChange(value: string) {
    setNewName(value);
    setNewSlug(slugify(value));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blog-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '新增失敗');
      }
      const data = await res.json();
      setCategories((prev) => [...prev, data.category]);
      setNewName('');
      setNewSlug('');
    } catch (err: any) {
      setError(err.message || '新增失敗');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(category: BlogCategory) {
    setEditId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName('');
    setEditSlug('');
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim() || !editSlug.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog-categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '儲存失敗');
      }
      const data = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === editId ? data.category : c)));
      cancelEdit();
    } catch (err: any) {
      setError(err.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog-categories/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '刪除失敗');
      }
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || '刪除失敗');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageTitle title="部落格管理" />
      <BlogSubNav />

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-end gap-3">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">名稱</legend>
          <input type="text" value={newName} onChange={(e) => handleNewNameChange(e.target.value)} placeholder="分類名稱" className="input input-sm w-48" />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Slug</legend>
          <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="category-slug" className="input input-sm w-48" />
        </fieldset>
        <button type="submit" disabled={adding || !newName.trim() || !newSlug.trim()} className="btn btn-sm btn-primary">
          {adding ? '新增中...' : '新增'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>名稱</th>
              <th>Slug</th>
              <th className="w-[180px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-base-content/50 py-8 text-center">
                  載入中...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-base-content/40 py-8 text-center">
                  尚無分類
                </td>
              </tr>
            ) : (
              categories.map((category) =>
                editId === category.id ? (
                  <tr key={category.id}>
                    <td>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input input-sm w-full" />
                    </td>
                    <td>
                      <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="input input-sm w-full" />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} disabled={saving || !editName.trim() || !editSlug.trim()} className="btn btn-xs btn-primary">
                          {saving ? '儲存中...' : '儲存'}
                        </button>
                        <button onClick={cancelEdit} disabled={saving} className="btn btn-xs btn-outline">
                          取消
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={category.id}>
                    <td className="font-medium">{category.name}</td>
                    <td className="text-base-content/60">{category.slug}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(category)} className="btn btn-xs btn-outline btn-info">
                          編輯
                        </button>
                        <button onClick={() => setDeleteTarget(category)} className="btn btn-xs btn-outline btn-error">
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除分類"
        message={`確定要刪除「${deleteTarget?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
