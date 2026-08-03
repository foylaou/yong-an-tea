'use client';

import { useState } from 'react';

interface PhoneBindSectionProps {
  initialPhone: string | null;
}

const inputField =
  'border border-[#e8e8e8] focus-visible:outline-0 py-[10px] px-[20px] w-full h-[50px]';

function PhoneBindSection({ initialPhone }: PhoneBindSectionProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [step, setStep] = useState<'idle' | 'code'>('idle');
  const [inputPhone, setInputPhone] = useState('');
  const [code, setCode] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setRequesting(true);
    try {
      const res = await fetch('/api/account/phone/request-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '驗證碼寄送失敗');
        return;
      }
      setStep('code');
    } catch {
      setError('網路錯誤');
    } finally {
      setRequesting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const res = await fetch('/api/account/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, phone: inputPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '驗證失敗');
        return;
      }
      setPhone(data.phone);
      setStep('idle');
      setCode('');
    } catch {
      setError('網路錯誤');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mt-[40px] max-w-[500px]">
      <h2 className="text-[20px] font-medium mb-[10px]">電話號碼</h2>

      {phone ? (
        <p className="text-sm text-gray-600">
          已綁定：<span className="font-medium">{phone}</span>
        </p>
      ) : step === 'idle' ? (
        <form onSubmit={handleRequestCode}>
          <p className="text-xs text-gray-400 mb-[10px]">尚未綁定電話，綁定後店面購買可以更快找到您的資料</p>
          <div className="mb-[15px]">
            <input
              type="tel"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              placeholder="請輸入手機號碼"
              className={inputField}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs mb-[10px]">{error}</p>}
          <button
            type="submit"
            disabled={requesting || !inputPhone.trim()}
            className="bg-[#222] text-white px-8 h-[42px] transition-all hover:bg-black disabled:opacity-50"
          >
            {requesting ? '寄送中...' : '取得驗證碼'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <p className="text-xs text-gray-400 mb-[10px]">
            驗證碼已寄到您的信箱，請於 10 分鐘內輸入（綁定電話：{inputPhone}）
          </p>
          <div className="mb-[15px]">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6 位數驗證碼"
              maxLength={6}
              className={inputField}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs mb-[10px]">{error}</p>}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="bg-[#222] text-white px-8 h-[42px] transition-all hover:bg-black disabled:opacity-50"
            >
              {verifying ? '驗證中...' : '確認綁定'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('idle');
                setCode('');
                setError('');
              }}
              className="text-sm text-gray-500 underline"
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PhoneBindSection;
