'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

interface CategoryTableProps {
  initialCategories: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

type DeleteMode = 'soft' | 'hard';

export function CategoryTable({ initialCategories, initialTotal, initialPage, perPage }: CategoryTableProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('soft');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function fetchCategories(params: { page?: number; search?: string; status?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const st = params.status ?? statusFilter;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(s && { search: s }), ...(st && { status: st }) });
    try {
      const res = await fetch(`/api/admin/categories?${qs}`);
      const data = await res.json();
      setCategories(data.categories);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCategories({ page: 1, search });
  }

  function openDeleteDialog(category: any, mode: DeleteMode) {
    setDeleteTarget(category);
    setDeleteMode(mode);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const url = deleteMode === 'hard' ? `/api/admin/categories/${deleteTarget.id}?hard=true` : `/api/admin/categories/${deleteTarget.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchCategories({});
      } else {
        const data = await res.json();
        setDeleteError(data.error || '刪除失敗');
      }
    } finally {
      setDeleting(false);
    }
  }

  function CategoryActions({ category }: { category: any }) {
    return (
      <div className="flex gap-2">
        <Link href={`/admin/categories/${category.id}/edit`} className="btn btn-xs btn-outline btn-info">
          編輯
        </Link>
        {category.is_active && (
          <button onClick={() => openDeleteDialog(category, 'soft')} className="btn btn-xs btn-outline btn-warning">
            下架
          </button>
        )}
        <button onClick={() => openDeleteDialog(category, 'hard')} className="btn btn-xs btn-outline btn-error">
          刪除
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="分類管理"
        actions={
          <Link href="/admin/categories/new" className="btn btn-sm btn-primary">
            新增分類
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋分類名稱..."
            className="input input-sm w-56"
          />
          <button type="submit" className="btn btn-sm btn-outline">
            搜尋
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchCategories({ page: 1, status: e.target.value });
          }}
          className="select select-sm"
        >
          <option value="">全部狀態</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>名稱</th>
              <th>Slug</th>
              <th>父分類</th>
              <th>商品數</th>
              <th>排序</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-base-content/40 py-8 text-center">
                  沒有找到分類
                </td>
              </tr>
            ) : (
              categories.map((category: any) => (
                <tr key={category.id}>
                  <td>
                    <Link href={`/admin/categories/${category.id}/edit`} className="link link-hover font-medium">
                      {category.name}
                    </Link>
                  </td>
                  <td className="text-base-content/60">{category.slug}</td>
                  <td className="text-base-content/60">{category.parent?.name || '-'}</td>
                  <td className="text-base-content/60">{category.product_count}</td>
                  <td className="text-base-content/60">{category.sort_order}</td>
                  <td>
                    <span className={`badge badge-sm ${category.is_active ? 'badge-success' : 'badge-ghost'}`}>{category.is_active ? '上架' : '已下架'}</span>
                  </td>
                  <td>
                    <CategoryActions category={category} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {categories.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有找到分類</div>
        ) : (
          categories.map((category: any) => (
            <div key={category.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/admin/categories/${category.id}/edit`} className="link link-hover font-medium">
                    {category.name}
                  </Link>
                  <span className={`badge badge-sm ${category.is_active ? 'badge-success' : 'badge-ghost'}`}>{category.is_active ? '上架' : '已下架'}</span>
                </div>
                <div className="text-base-content/50 text-xs">
                  Slug: {category.slug} · 父分類: {category.parent?.name || '-'}
                </div>
                <div className="text-base-content/50 text-xs">
                  商品數 {category.product_count} · 排序 {category.sort_order}
                </div>
                <div className="card-actions justify-end">
                  <CategoryActions category={category} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchCategories({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteMode === 'hard' ? '永久刪除分類' : '下架分類'}
        message={
          deleteError
            ? deleteError
            : deleteMode === 'hard'
              ? `確定要永久刪除「${deleteTarget?.name}」嗎？此操作無法復原！`
              : `確定要下架「${deleteTarget?.name}」嗎？此操作會將分類設為不可見，但不會永久刪除。`
        }
        confirmLabel={deleteMode === 'hard' ? '永久刪除' : '確認下架'}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
