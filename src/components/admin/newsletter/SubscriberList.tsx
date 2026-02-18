'use client';

import { useState, useEffect, useCallback } from 'react';

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

export default function SubscriberList({
  initialSubscribers,
  initialTotal,
  initialPage,
  perPage,
}: SubscriberListProps) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / perPage);

  const fetchData = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        perPage: String(perPage),
      });
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
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchData]);

  const statusLabel: Record<string, string> = {
    active: '訂閱中',
    unsubscribed: '已退訂',
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋 Email..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">狀態</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">訂閱日期</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {statusLabel[sub.status] || sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(sub.created_at).toLocaleDateString('zh-TW')}
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    尚無訂閱者
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-500">共 {total} 筆</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData(Math.max(1, page - 1), search)}
                disabled={page <= 1 || loading}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                上一頁
              </button>
              <span className="flex items-center text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => fetchData(Math.min(totalPages, page + 1), search)}
                disabled={page >= totalPages || loading}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
