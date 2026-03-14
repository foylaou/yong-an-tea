'use client';

import { useState } from 'react';

interface CodFeeTier {
  max: number;
  fee: number;
}

interface PaymentSettingsProps {
  initialData: Record<string, unknown>;
  linePayData: Record<string, unknown>;
  shippingData: Record<string, unknown>;
}

function parseTiers(raw: unknown): CodFeeTier[] {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [];
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? 'bg-black' : 'bg-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function PaymentSettings({
  initialData,
  linePayData,
  shippingData,
}: PaymentSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Toggle states ---
  const [linepayEnabled, setLinepayEnabled] = useState(
    (initialData.payment_linepay_enabled as string) !== 'false'
  );
  const [atmEnabled, setAtmEnabled] = useState(
    (initialData.payment_atm_enabled as string) === 'true'
  );
  const [creditCardEnabled, setCreditCardEnabled] = useState(
    (initialData.payment_credit_card_enabled as string) === 'true'
  );
  const [codEnabled, setCodEnabled] = useState(
    (initialData.payment_cod_enabled as string) !== 'false'
  );

  // --- Expanded sections ---
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section);

  // --- LINE Pay fields ---
  const [lpChannelId, setLpChannelId] = useState(
    (linePayData.linepay_channel_id as string) || ''
  );
  const [lpChannelSecret, setLpChannelSecret] = useState(
    (linePayData.linepay_channel_secret as string) || ''
  );
  const [lpSandbox, setLpSandbox] = useState(
    (linePayData.linepay_sandbox as string) !== 'false'
  );

  // --- ATM fields ---
  const [atmBankName, setAtmBankName] = useState(
    (initialData.payment_atm_bank_name as string) || ''
  );
  const [atmBankCode, setAtmBankCode] = useState(
    (initialData.payment_atm_bank_code as string) || ''
  );
  const [atmAccountNumber, setAtmAccountNumber] = useState(
    (initialData.payment_atm_account_number as string) || ''
  );
  const [atmAccountHolder, setAtmAccountHolder] = useState(
    (initialData.payment_atm_account_holder as string) || ''
  );
  const [atmNote, setAtmNote] = useState(
    (initialData.payment_atm_note as string) || ''
  );

  // --- Credit Card fields ---
  const [ccProvider, setCcProvider] = useState(
    (initialData.payment_credit_card_provider as string) || ''
  );
  const [ccMerchantId, setCcMerchantId] = useState(
    (initialData.payment_credit_card_merchant_id as string) || ''
  );
  const [ccHashKey, setCcHashKey] = useState(
    (initialData.payment_credit_card_hash_key as string) || ''
  );
  const [ccHashIv, setCcHashIv] = useState(
    (initialData.payment_credit_card_hash_iv as string) || ''
  );
  const [ccSandbox, setCcSandbox] = useState(
    (initialData.payment_credit_card_sandbox as string) !== 'false'
  );

  // --- COD fee tiers ---
  const [codTiers, setCodTiers] = useState<CodFeeTier[]>(
    parseTiers(shippingData.cod_fee_tiers)
  );

  const addTier = () => {
    const lastMax = codTiers.length > 0 ? codTiers[codTiers.length - 1].max : 0;
    setCodTiers([...codTiers, { max: lastMax + 5000, fee: 0 }]);
  };
  const removeTier = (idx: number) =>
    setCodTiers(codTiers.filter((_, i) => i !== idx));
  const updateTier = (idx: number, field: keyof CodFeeTier, val: number) => {
    setCodTiers(codTiers.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  };

  // --- Save handler ---
  async function handleSave() {
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      // 1. Save payment group (toggles + ATM + credit card)
      const paymentRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'payment',
          settings: {
            payment_linepay_enabled: linepayEnabled ? 'true' : 'false',
            payment_atm_enabled: atmEnabled ? 'true' : 'false',
            payment_credit_card_enabled: creditCardEnabled ? 'true' : 'false',
            payment_cod_enabled: codEnabled ? 'true' : 'false',
            payment_atm_bank_name: atmBankName,
            payment_atm_bank_code: atmBankCode,
            payment_atm_account_number: atmAccountNumber,
            payment_atm_account_holder: atmAccountHolder,
            payment_atm_note: atmNote,
            payment_credit_card_provider: ccProvider,
            payment_credit_card_merchant_id: ccMerchantId,
            payment_credit_card_hash_key: ccHashKey,
            payment_credit_card_hash_iv: ccHashIv,
            payment_credit_card_sandbox: ccSandbox ? 'true' : 'false',
          },
        }),
      });
      if (!paymentRes.ok) {
        const r = await paymentRes.json();
        setServerError(r.error || '儲存付款設定失敗');
        return;
      }

      // 2. Save LINE Pay credentials to linepay group
      const linePayRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'linepay',
          settings: {
            linepay_channel_id: lpChannelId,
            linepay_channel_secret: lpChannelSecret,
            linepay_sandbox: lpSandbox ? 'true' : 'false',
          },
        }),
      });
      if (!linePayRes.ok) {
        const r = await linePayRes.json();
        setServerError(r.error || '儲存 LINE Pay 設定失敗');
        return;
      }

      // 3. Save COD fee tiers to shipping group (preserve existing shipping fields)
      const sortedTiers = [...codTiers]
        .filter((t) => t.max > 0)
        .sort((a, b) => a.max - b.max);

      const shippingRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'shipping',
          settings: {
            shipping_fee: Number(shippingData.shipping_fee ?? 100),
            free_shipping_threshold: Number(
              shippingData.free_shipping_threshold ?? 1500
            ),
            shipping_note: String(shippingData.shipping_note ?? ''),
            cod_fee_tiers: JSON.stringify(sortedTiers),
          },
        }),
      });
      if (!shippingRes.ok) {
        const r = await shippingRes.json();
        setServerError(r.error || '儲存貨到付款手續費設定失敗');
        return;
      }

      setCodTiers(sortedTiers);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setServerError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black';

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-900">付款方式設定</h2>
        <p className="mt-1 text-sm text-gray-500">
          管理各種付款方式的開關與詳細設定，關閉的付款方式將不會在結帳頁面顯示
        </p>
      </div>

      {/* ============ LINE Pay ============ */}
      <section className="rounded-lg bg-white shadow overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">LINE Pay</h3>
              <p className="text-xs text-gray-500">使用 LINE Pay 線上付款</p>
            </div>
          </div>
          <Toggle checked={linepayEnabled} onChange={setLinepayEnabled} />
        </div>

        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => toggleSection('linepay')}
            className="flex w-full items-center justify-between px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span>詳細設定</span>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSection === 'linepay' ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'linepay' && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
              <p className="text-xs text-gray-500">
                請至{' '}
                <a
                  href="https://pay.line.me/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  LINE Pay 商家後台
                </a>{' '}
                取得 Channel ID 和 Channel Secret Key。
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Channel ID
                </label>
                <input
                  type="text"
                  value={lpChannelId}
                  onChange={(e) => setLpChannelId(e.target.value)}
                  placeholder="1234567890"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Channel Secret Key
                </label>
                <input
                  type="password"
                  value={lpChannelSecret}
                  onChange={(e) => setLpChannelSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sandbox 測試模式
                  </label>
                  <p className="mt-0.5 text-xs text-gray-400">
                    開啟時使用 LINE Pay Sandbox 環境
                  </p>
                </div>
                <Toggle checked={lpSandbox} onChange={setLpSandbox} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ ATM ============ */}
      <section className="rounded-lg bg-white shadow overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">ATM 轉帳付款</h3>
              <p className="text-xs text-gray-500">提供銀行帳號讓客戶轉帳</p>
            </div>
          </div>
          <Toggle checked={atmEnabled} onChange={setAtmEnabled} />
        </div>

        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => toggleSection('atm')}
            className="flex w-full items-center justify-between px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span>詳細設定</span>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSection === 'atm' ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'atm' && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
              <p className="text-xs text-gray-500">
                設定銀行帳戶資訊，客戶下單後可依此資訊進行匯款
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    銀行名稱
                  </label>
                  <input
                    type="text"
                    value={atmBankName}
                    onChange={(e) => setAtmBankName(e.target.value)}
                    placeholder="例：中國信託商業銀行"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    銀行代碼
                  </label>
                  <input
                    type="text"
                    value={atmBankCode}
                    onChange={(e) => setAtmBankCode(e.target.value)}
                    placeholder="例：822"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  帳號
                </label>
                <input
                  type="text"
                  value={atmAccountNumber}
                  onChange={(e) => setAtmAccountNumber(e.target.value)}
                  placeholder="請輸入銀行帳號"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  戶名
                </label>
                <input
                  type="text"
                  value={atmAccountHolder}
                  onChange={(e) => setAtmAccountHolder(e.target.value)}
                  placeholder="請輸入帳戶戶名"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  備註說明
                </label>
                <textarea
                  rows={2}
                  value={atmNote}
                  onChange={(e) => setAtmNote(e.target.value)}
                  placeholder="例：匯款後請通知客服確認，將於確認後安排出貨"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ Credit Card ============ */}
      <section className="rounded-lg bg-white shadow overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">信用卡付款</h3>
              <p className="text-xs text-gray-500">透過第三方金流服務商收取信用卡款項</p>
            </div>
          </div>
          <Toggle checked={creditCardEnabled} onChange={setCreditCardEnabled} />
        </div>

        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => toggleSection('credit_card')}
            className="flex w-full items-center justify-between px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span>詳細設定</span>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSection === 'credit_card' ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'credit_card' && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
              <p className="text-xs text-gray-500">
                設定第三方金流服務商（如綠界 ECPay、藍新 NewebPay）的串接資訊
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  串接服務商
                </label>
                <select
                  value={ccProvider}
                  onChange={(e) => setCcProvider(e.target.value)}
                  className={inputClass}
                >
                  <option value="">請選擇服務商</option>
                  <option value="ecpay">綠界 ECPay</option>
                  <option value="newebpay">藍新 NewebPay</option>
                  <option value="tappay">TapPay</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  特約商店代號（Merchant ID）
                </label>
                <input
                  type="text"
                  value={ccMerchantId}
                  onChange={(e) => setCcMerchantId(e.target.value)}
                  placeholder="請輸入特約商店代號"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Hash Key
                  </label>
                  <input
                    type="password"
                    value={ccHashKey}
                    onChange={(e) => setCcHashKey(e.target.value)}
                    placeholder="••••••••••••••••"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Hash IV
                  </label>
                  <input
                    type="password"
                    value={ccHashIv}
                    onChange={(e) => setCcHashIv(e.target.value)}
                    placeholder="••••••••••••••••"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sandbox 測試模式
                  </label>
                  <p className="mt-0.5 text-xs text-gray-400">
                    開啟時使用測試環境，正式上線前請關閉
                  </p>
                </div>
                <Toggle checked={ccSandbox} onChange={setCcSandbox} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ COD ============ */}
      <section className="rounded-lg bg-white shadow overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">貨到付款</h3>
              <p className="text-xs text-gray-500">收到商品時付款給物流人員</p>
            </div>
          </div>
          <Toggle checked={codEnabled} onChange={setCodEnabled} />
        </div>

        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => toggleSection('cod')}
            className="flex w-full items-center justify-between px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span>詳細設定</span>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSection === 'cod' ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'cod' && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">代收手續費級距</h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    依訂單金額（含運費）級距收取代收手續費，僅在客戶選擇貨到付款時收取
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTier}
                  className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                >
                  + 新增級距
                </button>
              </div>

              {codTiers.length === 0 ? (
                <p className="text-sm text-gray-400">
                  尚未設定級距（貨到付款將不收取代收費）
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs font-medium text-gray-500">
                    <span>金額上限（元）</span>
                    <span>手續費（元/筆）</span>
                    <span className="w-8" />
                  </div>
                  {codTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_1fr_auto] items-center gap-3"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {idx === 0
                            ? '0'
                            : codTiers[idx - 1].max.toLocaleString()}{' '}
                          ~
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={tier.max}
                          onChange={(e) =>
                            updateTier(idx, 'max', Number(e.target.value))
                          }
                          className={inputClass}
                        />
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={tier.fee}
                        onChange={(e) =>
                          updateTier(idx, 'fee', Number(e.target.value))
                        }
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeTier(idx)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        title="刪除"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============ Messages & Save ============ */}
      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          設定已成功儲存
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </div>
  );
}
