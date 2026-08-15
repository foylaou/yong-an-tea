'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Customer } from '@/types/customer';
import { decodeCustomerQr } from '@/lib/customer-qr';
import { QrScannerModal } from './QrScannerModal';

interface CustomerPickerProps {
  onSelect: (customer: Customer | null) => void;
  onClose: () => void;
}

interface LinkedMember {
  profile_id: string;
  full_name: string;
  phone: string | null;
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

  // Staff-assisted email-OTP member verification (POS fallback when a
  // walk-in claims to already be a website member but isn't in `customers`)
  const [showVerify, setShowVerify] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'email' | 'code'>('email');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [linkedMember, setLinkedMember] = useState<LinkedMember | null>(null);

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
        body: JSON.stringify({
          name: quickName.trim(),
          phone: quickPhone.trim(),
          profile_id: linkedMember?.profile_id ?? undefined,
        }),
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

  async function handleRequestVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const res = await fetch('/api/admin/pos/verify-member/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || '驗證碼寄送失敗');
        return;
      }
      setVerifyStep('code');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleConfirmVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const res = await fetch('/api/admin/pos/verify-member/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail.trim(), code: verifyCode.trim(), phone: quickPhone.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || '驗證失敗');
        return;
      }
      setLinkedMember(data.member);
      setQuickName(data.member.full_name || quickName);
      setQuickPhone(data.member.phone || quickPhone);
      setShowVerify(false);
      setShowQuickAdd(true);
    } finally {
      setVerifyLoading(false);
    }
  }

  function resetVerify() {
    setShowVerify(false);
    setVerifyStep('email');
    setVerifyEmail('');
    setVerifyCode('');
    setVerifyError('');
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
            <div className="py-4 text-center">
              <p className="text-base-content/40 text-sm">查無此客戶</p>
              <button
                type="button"
                onClick={() => {
                  setShowVerify(true);
                  setVerifyEmail('');
                }}
                className="btn btn-ghost btn-xs mt-1"
              >
                這位是網站會員嗎？用 Email 核對
              </button>
            </div>
          )}
        </div>

        {showVerify && (
          <div className="border-base-300 bg-base-200/50 mt-2 space-y-2 rounded-md border p-3">
            {verifyStep === 'email' ? (
              <form onSubmit={handleRequestVerifyCode} className="space-y-2">
                <p className="text-base-content/60 text-xs">輸入客人的會員 Email，寄送驗證碼確認身分</p>
                <input
                  type="email"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="input input-sm w-full"
                  required
                />
                {verifyError && <p className="text-error text-xs">{verifyError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={verifyLoading || !verifyEmail.trim()} className="btn btn-sm btn-primary">
                    {verifyLoading ? '寄送中...' : '發送驗證碼'}
                  </button>
                  <button type="button" onClick={resetVerify} className="btn btn-sm btn-ghost">
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmVerifyCode} className="space-y-2">
                <p className="text-base-content/60 text-xs">驗證碼已寄到 {verifyEmail}，請輸入 6 位數驗證碼</p>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="6 位數驗證碼"
                  maxLength={6}
                  className="input input-sm w-full"
                  required
                />
                {verifyError && <p className="text-error text-xs">{verifyError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={verifyLoading || verifyCode.length !== 6} className="btn btn-sm btn-primary">
                    {verifyLoading ? '驗證中...' : '確認'}
                  </button>
                  <button type="button" onClick={resetVerify} className="btn btn-sm btn-ghost">
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="divider" />

        {linkedMember && (
          <div className="alert alert-success mb-2 text-sm">
            已核對為會員「{linkedMember.full_name}」，新增後會自動連結線上購買紀錄
          </div>
        )}

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
