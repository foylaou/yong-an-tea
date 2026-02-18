'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

const TYPE_LABELS: Record<string, string> = {
  product: '商品',
  blog: '文章',
  page: '頁面',
};

const TYPE_COLORS: Record<string, string> = {
  product: 'bg-blue-100 text-blue-800',
  blog: 'bg-purple-100 text-purple-800',
  page: 'bg-green-100 text-green-800',
};

interface SEOTableProps {
  initialItems: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
  entityNames: Record<string, string>;
}

export default function SEOTable({
  initialItems,
  initialTotal,
  initialPage,
  perPage,
  entityNames,
}: SEOTableProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchItems(params: {
    page?: number;
    search?: string;
    entity_type?: string;
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const t = params.entity_type ?? typeFilter;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
      ...(t && { entity_type: t }),
    });

    try {
      const res = await fetch(`/api/admin/seo?${qs}`);
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchItems({ page: 1, search });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/seo/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item: any) => item.id !== deleteTarget.id));
        setTotal((prev) => prev - 1);
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function getTargetName(item: any): string {
    if (item.entity_type === 'page') {
      return item.page_path || '-';
    }
    return entityNames[item.entity_id] || item.entity_id || '-';
  }

  function truncate(str: string | null, len: number): string {
    if (!str) return '-';
    return str.length > len ? str.slice(0, len) + '...' : str;
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
            placeholder="搜尋 Meta Title..."
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
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            fetchItems({ page: 1, entity_type: e.target.value });
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全部類型</option>
          <option value="product">商品</option>
          <option value="blog">文章</option>
          <option value="page">頁面</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  類型
                </th>
                <th className="w-[160px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  目標
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Meta Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Meta Description
                </th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  noindex
                </th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    載入中...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    沒有 SEO 資料
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${TYPE_COLORS[item.entity_type] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {TYPE_LABELS[item.entity_type] || item.entity_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {truncate(getTargetName(item), 30)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {truncate(item.meta_title, 40)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {truncate(item.meta_description, 50)}
                    </td>
                    <td className="px-4 py-3">
                      {item.no_index && (
                        <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          noindex
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/seo/${item.id}/edit`}
                          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                        >
                          編輯
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(item)}
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
            fetchItems({ page: p });
          }}
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除 SEO 資料"
        message={`確定要刪除「${deleteTarget?.meta_title || '此項目'}」的 SEO 設定嗎？此操作無法復原！`}
        confirmLabel="永久刪除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
