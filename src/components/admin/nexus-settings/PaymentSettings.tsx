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
  } catch {
    /* ignore */
  }
  return [];
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return <input type="checkbox" className="toggle toggle-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} />;
}

export default function PaymentSettings({ initialData, linePayData, shippingData }: PaymentSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Toggle states ---
  const [linepayEnabled, setLinepayEnabled] = useState((initialData.payment_linepay_enabled as string) !== 'false');
  const [atmEnabled, setAtmEnabled] = useState((initialData.payment_atm_enabled as string) === 'true');
  const [creditCardEnabled, setCreditCardEnabled] = useState((initialData.payment_credit_card_enabled as string) === 'true');
  const [codEnabled, setCodEnabled] = useState((initialData.payment_cod_enabled as string) !== 'false');

  // --- Expanded sections ---
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  // --- LINE Pay fields ---
  const [lpChannelId, setLpChannelId] = useState((linePayData.linepay_channel_id as string) || '');
  const [lpChannelSecret, setLpChannelSecret] = useState((linePayData.linepay_channel_secret as string) || '');
  const [lpSandbox, setLpSandbox] = useState((linePayData.linepay_sandbox as string) !== 'false');

  // --- ATM fields ---
  const [atmBankName, setAtmBankName] = useState((initialData.payment_atm_bank_name as string) || '');
  const [atmBankCode, setAtmBankCode] = useState((initialData.payment_atm_bank_code as string) || '');
  const [atmAccountNumber, setAtmAccountNumber] = useState((initialData.payment_atm_account_number as string) || '');
  const [atmAccountHolder, setAtmAccountHolder] = useState((initialData.payment_atm_account_holder as string) || '');
  const [atmNote, setAtmNote] = useState((initialData.payment_atm_note as string) || '');

  // --- Credit Card fields ---
  const [ccProvider, setCcProvider] = useState((initialData.payment_credit_card_provider as string) || '');
  const [ccMerchantId, setCcMerchantId] = useState((initialData.payment_credit_card_merchant_id as string) || '');
  const [ccHashKey, setCcHashKey] = useState((initialData.payment_credit_card_hash_key as string) || '');
  const [ccHashIv, setCcHashIv] = useState((initialData.payment_credit_card_hash_iv as string) || '');
  const [ccSandbox, setCcSandbox] = useState((initialData.payment_credit_card_sandbox as string) !== 'false');

  // --- COD fee tiers ---
  const [codTiers, setCodTiers] = useState<CodFeeTier[]>(parseTiers(shippingData.cod_fee_tiers));

  const addTier = () => {
    const lastMax = codTiers.length > 0 ? codTiers[codTiers.length - 1].max : 0;
    setCodTiers([...codTiers, { max: lastMax + 5000, fee: 0 }]);
  };
  const removeTier = (idx: number) => setCodTiers(codTiers.filter((_, i) => i !== idx));
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
      const sortedTiers = [...codTiers].filter((t) => t.max > 0).sort((a, b) => a.max - b.max);

      const shippingRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'shipping',
          settings: {
            shipping_fee: Number(shippingData.shipping_fee ?? 100),
            free_shipping_threshold: Number(shippingData.free_shipping_threshold ?? 1500),
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

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">付款方式設定</h2>
        <p className="text-base-content/60 mt-1 text-sm">管理各種付款方式的開關與詳細設定，關閉的付款方式將不會在結帳頁面顯示</p>
      </div>

      {/* ============ LINE Pay ============ */}
      <div className="card card-border bg-base-100 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="iconify lucide--credit-card text-success size-6" />
            </div>
            <div>
              <h3 className="font-semibold">LINE Pay</h3>
              <p className="text-base-content/50 text-xs">使用 LINE Pay 線上付款</p>
            </div>
          </div>
          <Toggle checked={linepayEnabled} onChange={setLinepayEnabled} />
        </div>

        <div className="border-base-200 border-t">
          <button type="button" onClick={() => toggleSection('linepay')} className="hover:bg-base-200 flex w-full items-center justify-between px-5 py-3 text-sm">
            <span>詳細設定</span>
            <span className={`iconify lucide--chevron-down size-4 transition-transform ${expandedSection === 'linepay' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'linepay' && (
            <div className="border-base-200 space-y-4 border-t px-5 pt-4 pb-5">
              <p className="text-base-content/50 text-xs">
                請至{' '}
                <a href="https://pay.line.me/login" target="_blank" rel="noopener noreferrer" className="link link-primary">
                  LINE Pay 商家後台
                </a>{' '}
                取得 Channel ID 和 Channel Secret Key。
              </p>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Channel ID</legend>
                <input type="text" value={lpChannelId} onChange={(e) => setLpChannelId(e.target.value)} placeholder="1234567890" className="input input-sm w-full font-mono" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Channel Secret Key</legend>
                <input
                  type="password"
                  value={lpChannelSecret}
                  onChange={(e) => setLpChannelSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="input input-sm w-full font-mono"
                />
              </fieldset>
              <div className="border-base-300 flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Sandbox 測試模式</p>
                  <p className="text-base-content/50 mt-0.5 text-xs">開啟時使用 LINE Pay Sandbox 環境</p>
                </div>
                <Toggle checked={lpSandbox} onChange={setLpSandbox} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ ATM ============ */}
      <div className="card card-border bg-base-100 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-info/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="iconify lucide--landmark text-info size-6" />
            </div>
            <div>
              <h3 className="font-semibold">ATM 轉帳付款</h3>
              <p className="text-base-content/50 text-xs">提供銀行帳號讓客戶轉帳</p>
            </div>
          </div>
          <Toggle checked={atmEnabled} onChange={setAtmEnabled} />
        </div>

        <div className="border-base-200 border-t">
          <button type="button" onClick={() => toggleSection('atm')} className="hover:bg-base-200 flex w-full items-center justify-between px-5 py-3 text-sm">
            <span>詳細設定</span>
            <span className={`iconify lucide--chevron-down size-4 transition-transform ${expandedSection === 'atm' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'atm' && (
            <div className="border-base-200 space-y-4 border-t px-5 pt-4 pb-5">
              <p className="text-base-content/50 text-xs">設定銀行帳戶資訊，客戶下單後可依此資訊進行匯款</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">銀行名稱</legend>
                  <input type="text" value={atmBankName} onChange={(e) => setAtmBankName(e.target.value)} placeholder="例：中國信託商業銀行" className="input input-sm w-full" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">銀行代碼</legend>
                  <input type="text" value={atmBankCode} onChange={(e) => setAtmBankCode(e.target.value)} placeholder="例：822" className="input input-sm w-full" />
                </fieldset>
              </div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">帳號</legend>
                <input
                  type="text"
                  value={atmAccountNumber}
                  onChange={(e) => setAtmAccountNumber(e.target.value)}
                  placeholder="請輸入銀行帳號"
                  className="input input-sm w-full font-mono"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">戶名</legend>
                <input type="text" value={atmAccountHolder} onChange={(e) => setAtmAccountHolder(e.target.value)} placeholder="請輸入帳戶戶名" className="input input-sm w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">備註說明</legend>
                <textarea
                  rows={2}
                  value={atmNote}
                  onChange={(e) => setAtmNote(e.target.value)}
                  placeholder="例：匯款後請通知客服確認，將於確認後安排出貨"
                  className="textarea textarea-sm w-full"
                />
              </fieldset>
            </div>
          )}
        </div>
      </div>

      {/* ============ Credit Card ============ */}
      <div className="card card-border bg-base-100 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="iconify lucide--credit-card text-secondary size-6" />
            </div>
            <div>
              <h3 className="font-semibold">信用卡付款</h3>
              <p className="text-base-content/50 text-xs">透過第三方金流服務商收取信用卡款項</p>
            </div>
          </div>
          <Toggle checked={creditCardEnabled} onChange={setCreditCardEnabled} />
        </div>

        <div className="border-base-200 border-t">
          <button type="button" onClick={() => toggleSection('credit_card')} className="hover:bg-base-200 flex w-full items-center justify-between px-5 py-3 text-sm">
            <span>詳細設定</span>
            <span className={`iconify lucide--chevron-down size-4 transition-transform ${expandedSection === 'credit_card' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'credit_card' && (
            <div className="border-base-200 space-y-4 border-t px-5 pt-4 pb-5">
              <p className="text-base-content/50 text-xs">設定第三方金流服務商（如綠界 ECPay、藍新 NewebPay）的串接資訊</p>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">串接服務商</legend>
                <select value={ccProvider} onChange={(e) => setCcProvider(e.target.value)} className="select select-sm w-full">
                  <option value="">請選擇服務商</option>
                  <option value="ecpay">綠界 ECPay</option>
                  <option value="newebpay">藍新 NewebPay</option>
                  <option value="tappay">TapPay</option>
                </select>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">特約商店代號（Merchant ID）</legend>
                <input
                  type="text"
                  value={ccMerchantId}
                  onChange={(e) => setCcMerchantId(e.target.value)}
                  placeholder="請輸入特約商店代號"
                  className="input input-sm w-full font-mono"
                />
              </fieldset>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Hash Key</legend>
                  <input
                    type="password"
                    value={ccHashKey}
                    onChange={(e) => setCcHashKey(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="input input-sm w-full font-mono"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Hash IV</legend>
                  <input
                    type="password"
                    value={ccHashIv}
                    onChange={(e) => setCcHashIv(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="input input-sm w-full font-mono"
                  />
                </fieldset>
              </div>
              <div className="border-base-300 flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Sandbox 測試模式</p>
                  <p className="text-base-content/50 mt-0.5 text-xs">開啟時使用測試環境，正式上線前請關閉</p>
                </div>
                <Toggle checked={ccSandbox} onChange={setCcSandbox} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ COD ============ */}
      <div className="card card-border bg-base-100 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="iconify lucide--truck text-warning size-6" />
            </div>
            <div>
              <h3 className="font-semibold">貨到付款</h3>
              <p className="text-base-content/50 text-xs">收到商品時付款給物流人員</p>
            </div>
          </div>
          <Toggle checked={codEnabled} onChange={setCodEnabled} />
        </div>

        <div className="border-base-200 border-t">
          <button type="button" onClick={() => toggleSection('cod')} className="hover:bg-base-200 flex w-full items-center justify-between px-5 py-3 text-sm">
            <span>詳細設定</span>
            <span className={`iconify lucide--chevron-down size-4 transition-transform ${expandedSection === 'cod' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'cod' && (
            <div className="border-base-200 space-y-4 border-t px-5 pt-4 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">代收手續費級距</h4>
                  <p className="text-base-content/50 mt-0.5 text-xs">依訂單金額（含運費）級距收取代收手續費，僅在客戶選擇貨到付款時收取</p>
                </div>
                <button type="button" onClick={addTier} className="btn btn-sm btn-outline">
                  + 新增級距
                </button>
              </div>

              {codTiers.length === 0 ? (
                <p className="text-base-content/40 text-sm">尚未設定級距（貨到付款將不收取代收費）</p>
              ) : (
                <div className="space-y-2">
                  <div className="text-base-content/50 grid grid-cols-[1fr_1fr_auto] gap-3 text-xs font-medium">
                    <span>金額上限（元）</span>
                    <span>手續費（元/筆）</span>
                    <span className="w-8" />
                  </div>
                  {codTiers.map((tier, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-base-content/40 text-xs whitespace-nowrap">{idx === 0 ? '0' : codTiers[idx - 1].max.toLocaleString()} ~</span>
                        <input type="number" min="1" value={tier.max} onChange={(e) => updateTier(idx, 'max', Number(e.target.value))} className="input input-sm w-full" />
                      </div>
                      <input type="number" min="0" value={tier.fee} onChange={(e) => updateTier(idx, 'fee', Number(e.target.value))} className="input input-sm w-full" />
                      <button type="button" onClick={() => removeTier(idx)} className="btn btn-sm btn-ghost btn-square text-error" title="刪除">
                        <span className="iconify lucide--x size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============ Messages & Save ============ */}
      {serverError && <div className="alert alert-error text-sm">{serverError}</div>}
      {success && <div className="alert alert-success text-sm">設定已成功儲存</div>}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={submitting} className="btn btn-primary">
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </div>
  );
}
