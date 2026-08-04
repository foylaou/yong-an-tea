'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import type { CustomerDirectoryRow } from '@/types/customer-directory';
import { CustomerQrModal } from './CustomerQrModal';

interface CustomerTableProps {
  initialRows: CustomerDirectoryRow[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const categoryLabel: Record<string, string> = {
  regular: '常客',
  wholesale: '批發商',
};

function discountLabel(row: CustomerDirectoryRow): string | null {
  if (!row.discount_type || row.discount_value <= 0) return null;
  return row.discount_type === 'percentage' ? `${row.discount_value}% 折扣` : `折抵 $${row.discount_value}`;
}

export function CustomerTable({ initialRows, initialTotal, initialPage, perPage }: CustomerTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDirectoryRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [qrTarget, setQrTarget] = useState<CustomerDirectoryRow | null>(null);

  const [creatingRecordFor, setCreatingRecordFor] = useState<string | null>(null);

  const [passwordRowId, setPasswordRowId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  async function fetchRows(params: { page?: number; search?: string; category?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const c = params.category ?? categoryFilter;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(s && { search: s }), ...(c && { category: c }) });
    try {
      const res = await fetch(`/api/admin/customers/directory?${qs}`);
      const data = await res.json();
      setRows(data.rows);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchRows({ page: 1, search });
  }

  async function handleDelete() {
    if (!deleteTarget?.customer_id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/customers/${deleteTarget.customer_id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchRows({});
      } else {
        const data = await res.json();
        setDeleteError(data.error || '刪除失敗');
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreateRecord(row: CustomerDirectoryRow) {
    setCreatingRecordFor(row.id);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: row.name || row.email || '未命名會員', email: row.email, profile_id: row.profile_id }),
      });
      if (res.ok) {
        fetchRows({});
      }
    } finally {
      setCreatingRecordFor(null);
    }
  }

  async function handlePasswordReset(row: CustomerDirectoryRow) {
    if (!row.profile_id) return;
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('密碼至少 6 個字元');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${row.profile_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setPasswordMsg('密碼已更新');
        setNewPassword('');
        setTimeout(() => {
          setPasswordRowId(null);
          setPasswordMsg(null);
        }, 1500);
      } else {
        const data = await res.json();
        setPasswordMsg(data.error || '更新失敗');
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  function PasswordResetRow({ row }: { row: CustomerDirectoryRow }) {
    if (passwordRowId !== row.id) return null;
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新密碼（至少6字元）"
          className="input input-xs w-40"
        />
        <button onClick={() => handlePasswordReset(row)} disabled={passwordSaving} className="btn btn-xs btn-warning">
          {passwordSaving ? '...' : '確認'}
        </button>
        <button
          onClick={() => {
            setPasswordRowId(null);
            setPasswordMsg(null);
          }}
          className="text-base-content/50 hover:text-base-content text-xs"
        >
          取消
        </button>
        {passwordMsg && <span className="text-success text-xs">{passwordMsg}</span>}
      </div>
    );
  }

  function RowActions({ row }: { row: CustomerDirectoryRow }) {
    return (
      <div className="flex flex-wrap gap-2">
        {row.customer_id ? (
          <>
            <button onClick={() => setQrTarget(row)} className="btn btn-xs btn-outline">
              QR
            </button>
            <Link href={`/admin/customers/${row.customer_id}/edit`} className="btn btn-xs btn-outline btn-info">
              編輯
            </Link>
            <button onClick={() => setDeleteTarget(row)} className="btn btn-xs btn-outline btn-error">
              刪除
            </button>
          </>
        ) : (
          <button onClick={() => handleCreateRecord(row)} disabled={creatingRecordFor === row.id} className="btn btn-xs btn-outline btn-success">
            {creatingRecordFor === row.id ? '建立中...' : '建立客戶檔案'}
          </button>
        )}
        {row.has_login && (
          <button
            onClick={() => {
              setPasswordRowId(row.id);
              setNewPassword('');
              setPasswordMsg(null);
            }}
            className="btn btn-xs btn-outline btn-warning"
          >
            重設密碼
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="客戶管理"
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
            placeholder="搜尋姓名、電話或 Email..."
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
            fetchRows({ page: 1, category: e.target.value });
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
              <th>聯絡方式</th>
              <th>分類</th>
              <th>身分</th>
              <th>熟客折扣</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-base-content/40 py-8 text-center">
                  沒有找到客戶
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.customer_id ? (
                      <Link href={`/admin/customers/${row.customer_id}/edit`} className="link link-hover font-medium">
                        {row.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{row.name || '-'}</span>
                    )}
                  </td>
                  <td className="text-base-content/60">{row.phone || row.email || '-'}</td>
                  <td>
                    <span className={`badge badge-sm ${row.category === 'wholesale' ? 'badge-secondary' : 'badge-ghost'}`}>
                      {categoryLabel[row.category]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${row.has_login ? 'badge-success' : 'badge-ghost'}`}>
                      {row.has_login ? '已連結會員' : '訪客'}
                    </span>
                  </td>
                  <td className="text-base-content/60">{discountLabel(row) || '-'}</td>
                  <td>
                    <RowActions row={row} />
                    <PasswordResetRow row={row} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {rows.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有找到客戶</div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  {row.customer_id ? (
                    <Link href={`/admin/customers/${row.customer_id}/edit`} className="link link-hover font-medium">
                      {row.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{row.name || '-'}</span>
                  )}
                  <span className={`badge badge-sm ${row.category === 'wholesale' ? 'badge-secondary' : 'badge-ghost'}`}>
                    {categoryLabel[row.category]}
                  </span>
                </div>
                <div className="text-base-content/50 text-xs">
                  {row.phone || row.email || '未留聯絡方式'} ·{' '}
                  <span className={row.has_login ? 'text-success' : ''}>{row.has_login ? '已連結會員' : '訪客'}</span>
                  {discountLabel(row) && ` · ${discountLabel(row)}`}
                </div>
                <div className="card-actions justify-end">
                  <RowActions row={row} />
                </div>
                <PasswordResetRow row={row} />
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchRows({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除客戶"
        message={deleteError || `確定要刪除「${deleteTarget?.name}」的客戶紀錄嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        loading={deleting}
      />

      {qrTarget?.customer_id && (
        <CustomerQrModal customer={{ id: qrTarget.customer_id, name: qrTarget.name }} onClose={() => setQrTarget(null)} />
      )}
    </div>
  );
}
