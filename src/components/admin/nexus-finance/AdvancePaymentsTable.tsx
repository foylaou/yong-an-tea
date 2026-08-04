'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import type { AdvancePayment, AdvancePaymentStatus } from '@/types/finance';
import { FinanceSubNav } from './FinanceSubNav';

interface AdvancePaymentsTableProps {
  initialAdvances: AdvancePayment[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
  initialOutstandingTotal: number;
}

const statusLabel: Record<AdvancePaymentStatus, string> = {
  outstanding: '未收回',
  returned: '已收回',
};

export function AdvancePaymentsTable({ initialAdvances, initialTotal, initialPage, perPage, initialOutstandingTotal }: AdvancePaymentsTableProps) {
  const [advances, setAdvances] = useState(initialAdvances);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [outstandingTotal, setOutstandingTotal] = useState(initialOutstandingTotal);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdvancePayment | null>(null);
  const [formPayee, setFormPayee] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNote, setFormNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdvancePayment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchAdvances(params: { page?: number; status?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.status ?? statusFilter;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(s && { status: s }) });
    try {
      const res = await fetch(`/api/admin/advance-payments?${qs}`);
      const data = await res.json();
      setAdvances(data.advances);
      setTotal(data.total);
      setPage(data.page);
      setOutstandingTotal(data.outstandingTotal);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormPayee('');
    setFormAmount('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNote('');
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(advance: AdvancePayment) {
    setEditing(advance);
    setFormPayee(advance.payee);
    setFormAmount(String(advance.amount));
    setFormDate(advance.advance_date);
    setFormNote(advance.note || '');
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const url = editing ? `/api/admin/advance-payments/${editing.id}` : '/api/admin/advance-payments';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payee: formPayee,
          amount: Number(formAmount),
          advance_date: formDate,
          status: editing?.status || 'outstanding',
          returned_date: editing?.returned_date || null,
          note: formNote || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchAdvances({});
      } else {
        const data = await res.json();
        setFormError(data.error || '儲存失敗');
      }
    } finally {
      setSaving(false);
    }
  }

  async function markReturned(advance: AdvancePayment) {
    await fetch(`/api/admin/advance-payments/${advance.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payee: advance.payee,
        amount: advance.amount,
        advance_date: advance.advance_date,
        status: 'returned',
        returned_date: new Date().toISOString().slice(0, 10),
        note: advance.note,
      }),
    });
    fetchAdvances({});
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/advance-payments/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchAdvances({});
      } else {
        const data = await res.json();
        setDeleteError(data.error || '刪除失敗');
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <FinanceSubNav />
      <PageTitle
        title="代墊款"
        actions={
          <button onClick={openCreate} className="btn btn-sm btn-primary">
            新增代墊款
          </button>
        }
      />

      <div className="card card-border bg-base-100 mb-4">
        <div className="card-body p-5">
          <p className="text-base-content/60 text-sm font-medium">未收回總額</p>
          <p className="text-error mt-1 text-2xl font-semibold">${outstandingTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchAdvances({ page: 1, status: e.target.value });
          }}
          className="select select-sm"
        >
          <option value="">全部狀態</option>
          <option value="outstanding">未收回</option>
          <option value="returned">已收回</option>
        </select>
      </div>

      <div className={`overflow-x-auto ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>代墊對象</th>
              <th className="text-right">金額</th>
              <th>代墊日期</th>
              <th>狀態</th>
              <th>收回日期</th>
              <th>備註</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {advances.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-base-content/40 py-8 text-center">
                  尚無代墊款記錄
                </td>
              </tr>
            ) : (
              advances.map((advance) => (
                <tr key={advance.id}>
                  <td>{advance.payee}</td>
                  <td className="text-right">${advance.amount.toLocaleString()}</td>
                  <td>{advance.advance_date}</td>
                  <td>
                    <span className={`badge badge-sm ${advance.status === 'outstanding' ? 'badge-warning' : 'badge-success'}`}>
                      {statusLabel[advance.status]}
                    </span>
                  </td>
                  <td>{advance.returned_date || '-'}</td>
                  <td className="text-base-content/60">{advance.note || '-'}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {advance.status === 'outstanding' && (
                        <button onClick={() => markReturned(advance)} className="btn btn-xs btn-outline btn-success">
                          標記已收回
                        </button>
                      )}
                      <button onClick={() => openEdit(advance)} className="btn btn-xs btn-outline btn-info">
                        編輯
                      </button>
                      <button onClick={() => setDeleteTarget(advance)} className="btn btn-xs btn-outline btn-error">
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

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchAdvances({ page: p })} />

      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-semibold">{editing ? '編輯代墊款' : '新增代墊款'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">代墊對象 *</legend>
                <input required value={formPayee} onChange={(e) => setFormPayee(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">金額 *</legend>
                <input required type="number" min="0" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">代墊日期 *</legend>
                <input required type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">備註</legend>
                <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} rows={2} className="textarea w-full" />
              </fieldset>
              {formError && <p className="text-error text-sm">{formError}</p>}
              <div className="modal-action">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                  取消
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除代墊款"
        message={deleteError || `確定要刪除「${deleteTarget?.payee}」的代墊款記錄嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
