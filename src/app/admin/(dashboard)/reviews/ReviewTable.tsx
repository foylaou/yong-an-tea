'use client';

import { useState } from 'react';
import Pagination from '@/components/admin/common/Pagination';
import type { Review } from '@/types';

interface ReviewTableProps {
  initialReviews: Review[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const statusLabel: Record<string, string> = {
  pending: '待審核',
  approved: '已核准',
  rejected: '已拒絕',
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ReviewTable({
  initialReviews,
  initialTotal,
  initialPage,
  perPage,
}: ReviewTableProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchReviews(params: {
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
      const res = await fetch(`/api/admin/reviews?${qs}`);
      const data = await res.json();
      setReviews(data.reviews || []);
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
    fetchReviews({ page: 1 });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    fetchReviews({ page: 1, status: newStatus });
  };

  const handlePageChange = (newPage: number) => {
    fetchReviews({ page: newPage });
  };

  const handleAction = async (
    id: string,
    action: 'approved' | 'rejected' | 'delete'
  ) => {
    if (action === 'delete') {
      if (!confirm('確定要刪除此評價嗎？此操作無法復原。')) return;
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReviews({ page });
      }
    } else {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        fetchReviews({ page });
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 p-4">
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? '全部' : statusLabel[s]}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="ml-auto flex gap-2">
          <input
            type="text"
            placeholder="搜尋評價內容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            搜尋
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">商品</th>
              <th className="px-4 py-3 font-medium text-gray-500">評價者</th>
              <th className="px-4 py-3 font-medium text-gray-500">評分</th>
              <th className="px-4 py-3 font-medium text-gray-500">內容</th>
              <th className="px-4 py-3 font-medium text-gray-500">狀態</th>
              <th className="px-4 py-3 font-medium text-gray-500">日期</th>
              <th className="px-4 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  沒有找到評價
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-[160px] truncate" title={review.product_title}>
                    {review.product_title}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {review.customer_name}
                    {review.is_verified_purchase && (
                      <span className="ml-1 text-xs text-green-600" title="已驗證購買">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-4 py-3 max-w-[250px]">
                    {review.title && (
                      <span className="font-medium">{review.title}: </span>
                    )}
                    <span className="text-gray-600 line-clamp-2">{review.content}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColor[review.status] || ''
                      }`}
                    >
                      {statusLabel[review.status] || review.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => handleAction(review.id, 'approved')}
                          className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                        >
                          核准
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => handleAction(review.id, 'rejected')}
                          className="rounded px-2 py-1 text-xs text-orange-600 hover:bg-orange-50"
                        >
                          拒絕
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(review.id, 'delete')}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
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
        onPageChange={handlePageChange}
      />
    </div>
  );
}
