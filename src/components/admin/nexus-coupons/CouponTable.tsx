'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

interface CouponTableProps {
  initialCoupons: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const discountTypeLabel: Record<string, string> = {
  percentage: '百分比折扣',
  fixed_amount: '固定金額',
  free_shipping: '免運費',
};

function formatDiscountValue(type: string, value: number) {
  if (type === 'percentage') return `${value}%`;
  if (type === 'fixed_amount') return `$${Number(value).toLocaleString()}`;
  return '-';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function CouponTable({ initialCoupons, initialTotal, initialPage, perPage }: CouponTableProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchCoupons(params: { page?: number; search?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(s && { search: s }) });
    try {
      const res = await fetch(`/api/admin/coupons?${qs}`);
      const data = await res.json();
      setCoupons(data.coupons || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCoupons({ page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此優惠券嗎？')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCoupons({ page });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <PageTitle
        title="優惠券管理"
        actions={
          <Link href="/admin/coupons/new" className="btn btn-sm btn-primary">
            新增優惠券
          </Link>
        }
      />

      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="搜尋折扣碼、描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm w-[280px]"
          />
          <button type="submit" className="btn btn-sm btn-outline">
            搜尋
          </button>
        </form>
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>折扣碼</th>
              <th>類型</th>
              <th className="text-right">折扣值</th>
              <th className="text-center">使用次數</th>
              <th>有效期間</th>
              <th className="text-center">狀態</th>
              <th className="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-base-content/40 py-8 text-center">
                  尚無優惠券
                </td>
              </tr>
            ) : (
              coupons.map((coupon: any) => (
                <tr key={coupon.id}>
                  <td className="font-mono font-medium">
                    {coupon.code}
                    {coupon.description && <div className="text-base-content/40 font-sans text-xs font-normal">{coupon.description}</div>}
                  </td>
                  <td>{discountTypeLabel[coupon.discount_type] || coupon.discount_type}</td>
                  <td className="text-right">{formatDiscountValue(coupon.discount_type, coupon.discount_value)}</td>
                  <td className="text-center">
                    {coupon.used_count}
                    {coupon.usage_limit !== null && ` / ${coupon.usage_limit}`}
                  </td>
                  <td className="text-base-content/50">
                    {formatDate(coupon.starts_at)} ~ {formatDate(coupon.expires_at)}
                  </td>
                  <td className="text-center">
                    <span className={`badge badge-sm ${coupon.is_active ? 'badge-success' : 'badge-ghost'}`}>{coupon.is_active ? '啟用' : '停用'}</span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/coupons/${coupon.id}/edit`} className="link link-primary text-sm">
                        編輯
                      </Link>
                      <button onClick={() => handleDelete(coupon.id)} disabled={deleting === coupon.id} className="link text-error text-sm">
                        {deleting === coupon.id ? '刪除中...' : '刪除'}
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
        {coupons.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">尚無優惠券</div>
        ) : (
          coupons.map((coupon: any) => (
            <div key={coupon.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-medium">{coupon.code}</div>
                    {coupon.description && <div className="text-base-content/40 text-xs">{coupon.description}</div>}
                  </div>
                  <span className={`badge badge-sm ${coupon.is_active ? 'badge-success' : 'badge-ghost'}`}>{coupon.is_active ? '啟用' : '停用'}</span>
                </div>
                <div className="text-sm">
                  {discountTypeLabel[coupon.discount_type] || coupon.discount_type} · {formatDiscountValue(coupon.discount_type, coupon.discount_value)}
                </div>
                <div className="text-base-content/50 text-xs">
                  使用 {coupon.used_count}
                  {coupon.usage_limit !== null && ` / ${coupon.usage_limit}`} · {formatDate(coupon.starts_at)} ~ {formatDate(coupon.expires_at)}
                </div>
                <div className="card-actions justify-end">
                  <Link href={`/admin/coupons/${coupon.id}/edit`} className="btn btn-xs btn-outline btn-info">
                    編輯
                  </Link>
                  <button onClick={() => handleDelete(coupon.id)} disabled={deleting === coupon.id} className="btn btn-xs btn-outline btn-error">
                    {deleting === coupon.id ? '刪除中...' : '刪除'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchCoupons({ page: p })} />
    </div>
  );
}
