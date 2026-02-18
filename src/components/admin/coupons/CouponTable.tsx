'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';

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

export default function CouponTable({
  initialCoupons,
  initialTotal,
  initialPage,
  perPage,
}: CouponTableProps) {
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

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
    });

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

  const handlePageChange = (newPage: number) => {
    fetchCoupons({ page: newPage });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此優惠券嗎？')) return;
    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCoupons({ page });
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="搜尋折扣碼、描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none w-[280px]"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            搜尋
          </button>
        </form>

        <Link
          href="/admin/coupons/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          新增優惠券
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                折扣碼
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                類型
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                折扣值
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                使用次數
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                有效期間
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                狀態
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  載入中...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  尚無優惠券
                </td>
              </tr>
            ) : (
              coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium">
                    {coupon.code}
                    {coupon.description && (
                      <div className="text-xs text-gray-400 font-sans font-normal">
                        {coupon.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {discountTypeLabel[coupon.discount_type] || coupon.discount_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatDiscountValue(coupon.discount_type, coupon.discount_value)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {coupon.used_count}
                    {coupon.usage_limit !== null && ` / ${coupon.usage_limit}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(coupon.starts_at)} ~ {formatDate(coupon.expires_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {coupon.is_active ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        編輯
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        disabled={deleting === coupon.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
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

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
