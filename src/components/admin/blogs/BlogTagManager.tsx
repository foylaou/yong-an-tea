'use client';

import { useState, useEffect, useCallback } from 'react';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

interface BlogTag {
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

export default function BlogTagManager() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<BlogTag | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blog-tags');
      if (!res.ok) throw new Error('載入失敗');
      const data = await res.json();
      setTags(data.tags);
    } catch (err: any) {
      setError(err.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Auto-generate slug from name during creation
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
      const res = await fetch('/api/admin/blog-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '新增失敗');
      }
      const data = await res.json();
      // Optimistic update
      setTags((prev) => [...prev, data.tag]);
      setNewName('');
      setNewSlug('');
    } catch (err: any) {
      setError(err.message || '新增失敗');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(tag: BlogTag) {
    setEditId(tag.id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
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
      const res = await fetch(`/api/admin/blog-tags/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '儲存失敗');
      }
      const data = await res.json();
      // Optimistic update
      setTags((prev) =>
        prev.map((t) => (t.id === editId ? data.tag : t))
      );
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
      const res = await fetch(`/api/admin/blog-tags/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '刪除失敗');
      }
      // Optimistic update
      setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || '刪除失敗');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            名稱
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => handleNewNameChange(e.target.value)}
            placeholder="標籤名稱"
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="tag-slug"
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !newName.trim() || !newSlug.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {adding ? '新增中...' : '新增'}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  名稱
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Slug
                </th>
                <th className="w-[180px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    載入中...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    尚無標籤
                  </td>
                </tr>
              ) : (
                tags.map((tag) =>
                  editId === tag.id ? (
                    <tr key={tag.id} className="bg-blue-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving || !editName.trim() || !editSlug.trim()}
                            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? '儲存中...' : '儲存'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            取消
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {tag.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {tag.slug}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tag)}
                            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => setDeleteTarget(tag)}
                            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除標籤"
        message={`確定要刪除「${deleteTarget?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
