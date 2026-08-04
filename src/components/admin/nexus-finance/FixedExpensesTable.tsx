'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import type { FixedExpense, ExpenseCategory } from '@/types/finance';
import { FinanceSubNav } from './FinanceSubNav';

interface FixedExpensesTableProps {
  initialExpenses: FixedExpense[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const categories: ExpenseCategory[] = ['房租', '人事', '其他'];

function monthInputValue(month: string): string {
  return month.slice(0, 7);
}

function toMonthColumn(monthInput: string): string {
  return `${monthInput}-01`;
}

export function FixedExpensesTable({ initialExpenses, initialTotal, initialPage, perPage }: FixedExpensesTableProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | null>(null);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMonth, setFormMonth] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('其他');
  const [formNote, setFormNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FixedExpense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchExpenses(params: { page?: number; category?: string }) {
    setLoading(true);
    const p = params.page ?? page;
    const c = params.category ?? categoryFilter;
    const qs = new URLSearchParams({ page: String(p), perPage: String(perPage), ...(c && { category: c }) });
    try {
      const res = await fetch(`/api/admin/fixed-expenses?${qs}`);
      const data = await res.json();
      setExpenses(data.expenses);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormName('');
    setFormAmount('');
    setFormMonth(new Date().toISOString().slice(0, 7));
    setFormCategory('其他');
    setFormNote('');
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(expense: FixedExpense) {
    setEditing(expense);
    setFormName(expense.name);
    setFormAmount(String(expense.amount));
    setFormMonth(monthInputValue(expense.month));
    setFormCategory(expense.category);
    setFormNote(expense.note || '');
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const url = editing ? `/api/admin/fixed-expenses/${editing.id}` : '/api/admin/fixed-expenses';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          amount: Number(formAmount),
          month: toMonthColumn(formMonth),
          category: formCategory,
          note: formNote || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchExpenses({});
      } else {
        const data = await res.json();
        setFormError(data.error || '儲存失敗');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/fixed-expenses/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchExpenses({});
      } else {
        const data = await res.json();
        setDeleteError(data.error || '刪除失敗');
      }
    } finally {
      setDeleting(false);
    }
  }

  const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <FinanceSubNav />
      <PageTitle
        title="固定支出"
        actions={
          <button onClick={openCreate} className="btn btn-sm btn-primary">
            新增支出
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            fetchExpenses({ page: 1, category: e.target.value });
          }}
          className="select select-sm"
        >
          <option value="">全部分類</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-base-content/60 text-sm">本頁小計：${monthTotal.toLocaleString()}</span>
      </div>

      <div className={`overflow-x-auto ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>月份</th>
              <th>名稱</th>
              <th>分類</th>
              <th className="text-right">金額</th>
              <th>備註</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-base-content/40 py-8 text-center">
                  尚無支出記錄
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{monthInputValue(expense.month)}</td>
                  <td>{expense.name}</td>
                  <td>
                    <span className="badge badge-sm badge-ghost">{expense.category}</span>
                  </td>
                  <td className="text-right">${expense.amount.toLocaleString()}</td>
                  <td className="text-base-content/60">{expense.note || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(expense)} className="btn btn-xs btn-outline btn-info">
                        編輯
                      </button>
                      <button onClick={() => setDeleteTarget(expense)} className="btn btn-xs btn-outline btn-error">
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

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchExpenses({ page: p })} />

      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-semibold">{editing ? '編輯支出' : '新增支出'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">名稱 *</legend>
                <input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例：店面租金" className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">月份 *</legend>
                <input required type="month" value={formMonth} onChange={(e) => setFormMonth(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">金額 *</legend>
                <input required type="number" min="0" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">分類</legend>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)} className="select w-full">
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
        title="刪除支出"
        message={deleteError || `確定要刪除「${deleteTarget?.name}」嗎？此操作無法復原。`}
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
