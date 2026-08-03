'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

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

const statusLabel: Record<string, string> = { draft: '草稿', sent: '已發送' };

export function NewsletterList({ initialNewsletters, initialTotal, initialPage, perPage }: NewsletterListProps) {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / perPage);

  const fetchPage = useCallback(
    async (p: number) => {
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
    },
    [perPage],
  );

  useEffect(() => {
    if (page !== initialPage) {
      fetchPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此草稿？')) return;
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
    if (res.ok) fetchPage(page);
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

  return (
    <div>
      <PageTitle
        title="電子報管理"
        actions={
          <div className="flex gap-3">
            <Link href="/admin/newsletter/subscribers" className="btn btn-sm btn-outline">
              訂閱者列表
            </Link>
            <Link href="/admin/newsletter/new" className="btn btn-sm btn-primary">
              撰寫電子報
            </Link>
          </div>
        }
      />

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="table">
          <thead>
            <tr>
              <th>主旨</th>
              <th>狀態</th>
              <th>發送數</th>
              <th>建立日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((nl) => (
              <tr key={nl.id}>
                <td className="font-medium">{nl.subject}</td>
                <td>
                  <span className={`badge badge-sm ${nl.status === 'sent' ? 'badge-success' : 'badge-ghost'}`}>{statusLabel[nl.status] || nl.status}</span>
                </td>
                <td className="text-base-content/60">{nl.sent_count}</td>
                <td className="text-base-content/60">{new Date(nl.created_at).toLocaleDateString('zh-TW')}</td>
                <td>
                  <div className="flex items-center gap-3">
                    {nl.status === 'draft' && (
                      <>
                        <Link href={`/admin/newsletter/${nl.id}/edit`} className="link link-primary text-sm">
                          編輯
                        </Link>
                        <button onClick={() => handleSend(nl.id)} disabled={loading} className="link text-success text-sm">
                          發送
                        </button>
                        <button onClick={() => handleDelete(nl.id)} className="link text-error text-sm">
                          刪除
                        </button>
                      </>
                    )}
                    {nl.status === 'sent' && <span className="text-base-content/40 text-xs">{nl.sent_at ? new Date(nl.sent_at).toLocaleString('zh-TW') : ''}</span>}
                  </div>
                </td>
              </tr>
            ))}
            {newsletters.length === 0 && (
              <tr>
                <td colSpan={5} className="text-base-content/40 py-8 text-center">
                  尚無電子報
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className="space-y-3 md:hidden">
        {newsletters.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">尚無電子報</div>
        ) : (
          newsletters.map((nl) => (
            <div key={nl.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <span className="font-medium">{nl.subject}</span>
                  <span className={`badge badge-sm ${nl.status === 'sent' ? 'badge-success' : 'badge-ghost'}`}>{statusLabel[nl.status] || nl.status}</span>
                </div>
                <div className="text-base-content/50 text-xs">
                  發送數 {nl.sent_count} · {new Date(nl.created_at).toLocaleDateString('zh-TW')}
                </div>
                {nl.status === 'draft' ? (
                  <div className="card-actions justify-end">
                    <Link href={`/admin/newsletter/${nl.id}/edit`} className="btn btn-xs btn-outline btn-info">
                      編輯
                    </Link>
                    <button onClick={() => handleSend(nl.id)} disabled={loading} className="btn btn-xs btn-outline btn-success">
                      發送
                    </button>
                    <button onClick={() => handleDelete(nl.id)} className="btn btn-xs btn-outline btn-error">
                      刪除
                    </button>
                  </div>
                ) : (
                  <div className="text-base-content/40 text-xs">{nl.sent_at ? new Date(nl.sent_at).toLocaleString('zh-TW') : ''}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base-content/60 text-sm">共 {total} 筆</span>
          <div className="join">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="join-item btn btn-sm">
              上一頁
            </button>
            <button className="join-item btn btn-sm btn-disabled">
              {page} / {totalPages}
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading} className="join-item btn btn-sm">
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
