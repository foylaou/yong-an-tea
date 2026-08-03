'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import type { Customer } from '@/types/customer';
import { CustomerQrModal } from './CustomerQrModal';

interface CustomerTableProps {
  initialCustomers: Customer[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const categoryLabel: Record<string, string> = {
  regular: '常客',
  wholesale: '批發商',
};

export function CustomerTable({ initialCustomers, initialTotal, initialPage, perPage }: CustomerTableProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [qrTarget, setQrTarget] = useState<Customer | null>(null);

  async function fetchCustomers(params: { page?: number; search?: string; category?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const c = params.category ?? categoryFilter;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(s && { search: s }), ...(c && { category: c }) });
    try {
      const res = await fetch(`/api/admin/customers?${qs}`);
      const data = await res.json();
      setCustomers(data.customers);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCustomers({ page: 1, search });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/customers/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchCustomers({});
      } else {
        const data = await res.json();
        setDeleteError(data.error || '刪除失敗');
      }
    } finally {
      setDeleting(false);
    }
  }

  function CustomerActions({ customer }: { customer: Customer }) {
    return (
      <div className="flex gap-2">
        <button onClick={() => setQrTarget(customer)} className="btn btn-xs btn-outline">
          QR
        </button>
        <Link href={`/admin/customers/${customer.id}/edit`} className="btn btn-xs btn-outline btn-info">
          編輯
        </Link>
        <button onClick={() => setDeleteTarget(customer)} className="btn btn-xs btn-outline btn-error">
          刪除
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="客戶資料"
        actions={
          <Link href="/admin/customers/new" className="btn btn-sm btn-primary">
            新增客戶
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋姓名或電話..."
            className="input input-sm w-56"
          />
          <button type="submit" className="btn btn-sm btn-outline">
            搜尋
          </button>
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            fetchCustomers({ page: 1, category: e.target.value });
          }}
          className="select select-sm"
        >
          <option value="">全部分類</option>
          <option value="regular">常客</option>
          <option value="wholesale">批發商</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>電話</th>
              <th>分類</th>
              <th>常買茶種</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-base-content/40 py-8 text-center">
                  沒有找到客戶
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link href={`/admin/customers/${customer.id}/edit`} className="link link-hover font-medium">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="text-base-content/60">{customer.phone || '-'}</td>
                  <td>
                    <span className={`badge badge-sm ${customer.category === 'wholesale' ? 'badge-secondary' : 'badge-ghost'}`}>
                      {categoryLabel[customer.category]}
                    </span>
                  </td>
                  <td className="text-base-content/60">{customer.tea_preference || '-'}</td>
                  <td>
                    <CustomerActions customer={customer} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {customers.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有找到客戶</div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/admin/customers/${customer.id}/edit`} className="link link-hover font-medium">
                    {customer.name}
                  </Link>
                  <span className={`badge badge-sm ${customer.category === 'wholesale' ? 'badge-secondary' : 'badge-ghost'}`}>
                    {categoryLabel[customer.category]}
                  </span>
                </div>
                <div className="text-base-content/50 text-xs">
                  {customer.phone || '未留電話'} · {customer.tea_preference || '未留喜好'}
                </div>
                <div className="card-actions justify-end">
                  <CustomerActions customer={customer} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchCustomers({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除客戶"
        message={deleteError || `確定要刪除「${deleteTarget?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        loading={deleting}
      />

      {qrTarget && <CustomerQrModal customer={qrTarget} onClose={() => setQrTarget(null)} />}
    </div>
  );
}
