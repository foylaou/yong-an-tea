'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

interface SubscriberListProps {
  initialSubscribers: Subscriber[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const statusLabel: Record<string, string> = { active: '訂閱中', unsubscribed: '已退訂' };

export function SubscriberList({ initialSubscribers, initialTotal, initialPage, perPage }: SubscriberListProps) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / perPage);

  const fetchData = useCallback(
    async (p: number, q: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), perPage: String(perPage) });
        if (q) params.set('search', q);
        const res = await fetch(`/api/admin/newsletter/subscribers?${params}`);
        const data = await res.json();
        setSubscribers(data.subscribers);
        setTotal(data.total);
        setPage(p);
      } catch {
        // keep current data
      } finally {
        setLoading(false);
      }
    },
    [perPage],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchData]);

  return (
    <div>
      <PageTitle title="電子報訂閱者" />

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋 Email..."
          className="input input-sm w-full max-w-sm"
        />
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>狀態</th>
              <th>訂閱日期</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.email}</td>
                <td>
                  <span className={`badge badge-sm ${sub.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>{statusLabel[sub.status] || sub.status}</span>
                </td>
                <td className="text-base-content/60">{new Date(sub.created_at).toLocaleDateString('zh-TW')}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="text-base-content/40 py-8 text-center">
                  尚無訂閱者
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {subscribers.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">尚無訂閱者</div>
        ) : (
          subscribers.map((sub) => (
            <div key={sub.id} className="card card-border">
              <div className="card-body flex-row items-center justify-between gap-2 p-4">
                <div>
                  <div className="text-sm">{sub.email}</div>
                  <div className="text-base-content/40 text-xs">{new Date(sub.created_at).toLocaleDateString('zh-TW')}</div>
                </div>
                <span className={`badge badge-sm ${sub.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>{statusLabel[sub.status] || sub.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base-content/60 text-sm">共 {total} 筆</span>
          <div className="join">
            <button onClick={() => fetchData(Math.max(1, page - 1), search)} disabled={page <= 1 || loading} className="join-item btn btn-sm">
              上一頁
            </button>
            <button className="join-item btn btn-sm btn-disabled">
              {page} / {totalPages}
            </button>
            <button onClick={() => fetchData(Math.min(totalPages, page + 1), search)} disabled={page >= totalPages || loading} className="join-item btn btn-sm">
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
