'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

interface CategoryTableProps {
  initialCategories: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

type DeleteMode = 'soft' | 'hard';

export default function CategoryTable({
  initialCategories,
  initialTotal,
  initialPage,
  perPage,
}: CategoryTableProps) {
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

  async function fetchCategories(params: {
    page?: number;
    search?: string;
    status?: string;
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const st = params.status ?? statusFilter;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
      ...(st && { status: st }),
    });

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
      const url = deleteMode === 'hard'
        ? `/api/admin/categories/${deleteTarget.id}?hard=true`
        : `/api/admin/categories/${deleteTarget.id}`;
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

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋分類名稱..."
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            搜尋
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchCategories({ page: 1, status: e.target.value });
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全部狀態</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">名稱</th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">父分類</th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">商品數</th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">排序</th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">狀態</th>
                <th className="w-[160px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    載入中...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    沒有找到分類
                  </td>
                </tr>
              ) : (
                categories.map((category: any) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category.parent?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.product_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.sort_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.is_active ? '上架' : '已下架'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                        >
                          編輯
                        </Link>
                        {category.is_active && (
                          <button
                            onClick={() => openDeleteDialog(category, 'soft')}
                            className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100"
                          >
                            下架
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteDialog(category, 'hard')}
                          className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={(p) => {
            setPage(p);
            fetchCategories({ page: p });
          }}
        />
      </div>

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
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        loading={deleting}
      />
    </div>
  );
}
