'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Customer } from '@/types/customer';
import { decodeCustomerQr } from '@/components/admin/nexus-customers/CustomerQrModal';
import { QrScannerModal } from './QrScannerModal';

interface CustomerPickerProps {
  onSelect: (customer: Customer | null) => void;
  onClose: () => void;
}

export function CustomerPicker({ onSelect, onClose }: CustomerPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(q)}&perPage=10`);
      const data = await res.json();
      setResults(data.customers || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(phone), 300);
    return () => clearTimeout(timer);
  }, [phone, search]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleScanDecoded(text: string) {
    setShowScanner(false);
    const customerId = decodeCustomerQr(text);
    if (!customerId) {
      setError('無法辨識這組條碼');
      return;
    }
    const res = await fetch(`/api/admin/customers/${customerId}`);
    if (res.ok) {
      const data = await res.json();
      onSelect(data.customer);
    } else {
      setError('找不到此會員條碼對應的客戶');
    }
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: quickName.trim(), phone: quickPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '新增失敗');
        return;
      }
      onSelect(data.customer);
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="modal">
      <div className="modal-box max-w-md">
        <h3 className="text-lg font-semibold">選擇客戶</h3>

        {error && <div className="alert alert-error mt-3 text-sm">{error}</div>}

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="輸入姓名或電話快速查找..."
            className="input w-full"
            autoFocus
          />
          <button type="button" onClick={() => setShowScanner(true)} className="btn btn-outline">
            <span className="iconify lucide--scan-line size-5" />
            掃碼
          </button>
        </div>

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {loading && <p className="text-base-content/40 py-4 text-center text-sm">搜尋中...</p>}
          {!loading &&
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c)}
                className="hover:bg-base-200 flex w-full items-center justify-between rounded-md px-3 py-2 text-left"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-base-content/50 text-sm">{c.phone}</span>
              </button>
            ))}
          {!loading && phone.trim() && results.length === 0 && (
            <p className="text-base-content/40 py-4 text-center text-sm">查無此客戶</p>
          )}
        </div>

        <div className="divider" />

        {!showQuickAdd ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setShowQuickAdd(true)} className="btn btn-outline btn-sm">
              + 快速新增客戶
            </button>
            <button type="button" onClick={() => onSelect(null)} className="btn btn-ghost btn-sm">
              不指定客戶（現場散客）
            </button>
          </div>
        ) : (
          <form onSubmit={handleQuickAdd} className="flex flex-wrap items-end gap-2">
            <fieldset className="fieldset flex-1">
              <legend className="fieldset-legend">姓名</legend>
              <input type="text" value={quickName} onChange={(e) => setQuickName(e.target.value)} className="input input-sm w-full" />
            </fieldset>
            <fieldset className="fieldset flex-1">
              <legend className="fieldset-legend">電話</legend>
              <input type="text" value={quickPhone} onChange={(e) => setQuickPhone(e.target.value)} className="input input-sm w-full" />
            </fieldset>
            <button type="submit" disabled={saving} className="btn btn-sm btn-primary">
              {saving ? '新增中...' : '新增並選用'}
            </button>
          </form>
        )}

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn btn-outline">
            取消
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>

      {showScanner && <QrScannerModal onDecoded={handleScanDecoded} onClose={() => setShowScanner(false)} />}
    </dialog>
  );
}
