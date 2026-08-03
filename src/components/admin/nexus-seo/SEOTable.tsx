'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

const TYPE_LABELS: Record<string, string> = { product: '商品', blog: '文章', page: '頁面' };
const TYPE_BADGE: Record<string, string> = { product: 'badge-info', blog: 'badge-secondary', page: 'badge-success' };

interface SEOTableProps {
  initialItems: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
  entityNames: Record<string, string>;
}

function truncate(str: string | null, len: number): string {
  if (!str) return '-';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function SEOTable({ initialItems, initialTotal, initialPage, perPage, entityNames }: SEOTableProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchItems(params: { page?: number; search?: string; entity_type?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const t = params.entity_type ?? typeFilter;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(s && { search: s }), ...(t && { entity_type: t }) });
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
    if (item.entity_type === 'page') return item.page_path || '-';
    return entityNames[item.entity_id] || item.entity_id || '-';
  }

  return (
    <div>
      <PageTitle
        title="SEO 管理"
        actions={
          <Link href="/admin/seo/new" className="btn btn-sm btn-primary">
            新增 SEO
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋 Meta Title..."
            className="input input-sm w-56"
          />
          <button type="submit" className="btn btn-sm btn-outline">
            搜尋
          </button>
        </form>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            fetchItems({ page: 1, entity_type: e.target.value });
          }}
          className="select select-sm"
        >
          <option value="">全部類型</option>
          <option value="product">商品</option>
          <option value="blog">文章</option>
          <option value="page">頁面</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>類型</th>
              <th>目標</th>
              <th>Meta Title</th>
              <th>Meta Description</th>
              <th>noindex</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-base-content/40 py-8 text-center">
                  沒有 SEO 資料
                </td>
              </tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <span className={`badge badge-sm ${TYPE_BADGE[item.entity_type] || 'badge-ghost'}`}>{TYPE_LABELS[item.entity_type] || item.entity_type}</span>
                  </td>
                  <td>{truncate(getTargetName(item), 30)}</td>
                  <td>{truncate(item.meta_title, 40)}</td>
                  <td className="text-base-content/60">{truncate(item.meta_description, 50)}</td>
                  <td>{item.no_index && <span className="badge badge-error badge-sm">noindex</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/seo/${item.id}/edit`} className="link link-primary text-sm">
                        編輯
                      </Link>
                      <button onClick={() => setDeleteTarget(item)} className="link text-error text-sm">
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

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {items.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有 SEO 資料</div>
        ) : (
          items.map((item: any) => (
            <div key={item.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <span className={`badge badge-sm ${TYPE_BADGE[item.entity_type] || 'badge-ghost'}`}>{TYPE_LABELS[item.entity_type] || item.entity_type}</span>
                  {item.no_index && <span className="badge badge-error badge-sm">noindex</span>}
                </div>
                <div className="text-sm font-medium">{truncate(getTargetName(item), 40)}</div>
                <div className="text-sm">{truncate(item.meta_title, 60)}</div>
                <div className="text-base-content/50 text-xs">{truncate(item.meta_description, 80)}</div>
                <div className="card-actions justify-end">
                  <Link href={`/admin/seo/${item.id}/edit`} className="btn btn-xs btn-outline btn-info">
                    編輯
                  </Link>
                  <button onClick={() => setDeleteTarget(item)} className="btn btn-xs btn-outline btn-error">
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchItems({ page: p })} />

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
