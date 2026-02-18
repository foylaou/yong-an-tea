'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Newsletter {
  id: string;
  subject: string;
  status: string;
  sent_count: number;
  sent_at: string | null;
  created_at: string;
}

interface NewsletterListProps {
  initialNewsletters: Newsletter[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

export default function NewsletterList({
  initialNewsletters,
  initialTotal,
  initialPage,
  perPage,
}: NewsletterListProps) {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / perPage);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/newsletter?page=${p}&perPage=${perPage}`);
      const data = await res.json();
      setNewsletters(data.newsletters);
      setTotal(data.total);
      setPage(p);
    } catch {
      // keep current data
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    if (page !== initialPage) {
      fetchPage(page);
    }
  }, [page, initialPage, fetchPage]);

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此草稿？')) return;
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchPage(page);
    }
  }

  async function handleSend(id: string) {
    if (!confirm('確定要發送此電子報給所有訂閱者？此操作無法撤銷。')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`發送完成！成功 ${data.sentCount}/${data.totalSubscribers} 封`);
        fetchPage(page);
      } else {
        alert(data.error || '發送失敗');
      }
    } catch {
      alert('發送失敗');
    } finally {
      setLoading(false);
    }
  }

  const statusLabel: Record<string, string> = {
    draft: '草稿',
    sent: '已發送',
  };

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">主旨</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">狀態</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">發送數</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">建立日期</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((nl) => (
              <tr key={nl.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{nl.subject}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      nl.status === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {statusLabel[nl.status] || nl.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{nl.sent_count}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(nl.created_at).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {nl.status === 'draft' && (
                      <>
                        <Link
                          href={`/admin/newsletter/${nl.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          編輯
                        </Link>
                        <button
                          onClick={() => handleSend(nl.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          發送
                        </button>
                        <button
                          onClick={() => handleDelete(nl.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          刪除
                        </button>
                      </>
                    )}
                    {nl.status === 'sent' && (
                      <span className="text-gray-400 text-xs">
                        {nl.sent_at ? new Date(nl.sent_at).toLocaleString('zh-TW') : ''}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {newsletters.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  尚無電子報
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              上一頁
            </button>
            <span className="flex items-center text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
