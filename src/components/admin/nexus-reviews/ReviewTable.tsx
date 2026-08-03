'use client';

import { useState } from 'react';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
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

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-warning' : 'text-base-300'}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewActions({ review, onAction }: { review: Review; onAction: (id: string, action: 'approved' | 'rejected' | 'delete') => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {review.status !== 'approved' && (
        <button onClick={() => onAction(review.id, 'approved')} className="btn btn-xs btn-outline btn-success">
          核准
        </button>
      )}
      {review.status !== 'rejected' && (
        <button onClick={() => onAction(review.id, 'rejected')} className="btn btn-xs btn-outline btn-warning">
          拒絕
        </button>
      )}
      <button onClick={() => onAction(review.id, 'delete')} className="btn btn-xs btn-outline btn-error">
        刪除
      </button>
    </div>
  );
}

export function ReviewTable({ initialReviews, initialTotal, initialPage, perPage }: ReviewTableProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchReviews(params: { page?: number; search?: string; status?: string }) {
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

  const handleAction = async (id: string, action: 'approved' | 'rejected' | 'delete') => {
    if (action === 'delete') {
      if (!confirm('確定要刪除此評價嗎？此操作無法復原。')) return;
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReviews({ page });
    } else {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) fetchReviews({ page });
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="join">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`join-item btn btn-sm ${statusFilter === s ? 'btn-active btn-primary' : 'btn-outline'}`}
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
            className="input input-sm w-56"
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
              <th>商品</th>
              <th>評價者</th>
              <th>評分</th>
              <th>內容</th>
              <th>狀態</th>
              <th>日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-base-content/40 py-8 text-center">
                  沒有找到評價
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td className="max-w-[160px] truncate" title={review.product_title}>
                    {review.product_title}
                  </td>
                  <td className="whitespace-nowrap">
                    {review.customer_name}
                    {review.is_verified_purchase && (
                      <span className="text-success ml-1 text-xs" title="已驗證購買">
                        ✓
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">
                    <Stars rating={review.rating} />
                  </td>
                  <td className="max-w-[250px]">
                    {review.title && <span className="font-medium">{review.title}: </span>}
                    <span className="text-base-content/60 line-clamp-2">{review.content}</span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${statusBadgeClass[review.status] || ''}`}>{statusLabel[review.status] || review.status}</span>
                  </td>
                  <td className="text-base-content/50 whitespace-nowrap">{formatDate(review.created_at)}</td>
                  <td>
                    <ReviewActions review={review} onAction={handleAction} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {reviews.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有找到評價</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{review.product_title}</div>
                    <div className="text-base-content/50 text-xs">
                      {review.customer_name}
                      {review.is_verified_purchase && <span className="text-success ml-1">✓ 已驗證購買</span>}
                    </div>
                  </div>
                  <span className={`badge badge-sm ${statusBadgeClass[review.status] || ''}`}>{statusLabel[review.status] || review.status}</span>
                </div>
                <Stars rating={review.rating} />
                <p className="text-sm">
                  {review.title && <span className="font-medium">{review.title}: </span>}
                  <span className="text-base-content/60">{review.content}</span>
                </p>
                <div className="text-base-content/40 text-xs">{formatDate(review.created_at)}</div>
                <div className="card-actions justify-end">
                  <ReviewActions review={review} onAction={handleAction} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchReviews({ page: p })} />
    </div>
  );
}
