import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { decodeCustomerQr } from '../../lib/customer-qr';

interface CustomerInfo {
    id: string;
    name: string;
    line_user_id: string | null;
}

interface CouponOption {
    id: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
    discount_value: number;
    is_active: boolean;
    expires_at: string | null;
}

type Status =
    | 'init'
    | 'ready'
    | 'scanning'
    | 'customer-loaded'
    | 'done'
    | 'error';

const DISCOUNT_LABEL: Record<
    CouponOption['discount_type'],
    (c: CouponOption) => string
> = {
    percentage: (c) => `${c.discount_value}% 折扣`,
    fixed_amount: (c) => `折抵 $${c.discount_value}`,
    free_shipping: () => '免運費',
};

function isCouponUsable(c: CouponOption): boolean {
    if (!c.is_active) return false;
    if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
    return true;
}

/**
 * Reached from the admin-only rich menu button (liff.line.me/{liffId}/liff/admin-coupon).
 * The rich menu link is UI convenience only — every action here goes
 * through an admin-gated API route that re-checks role server-side, so
 * someone finding this URL by other means still can't do anything with it.
 */
export default function AdminCouponPage() {
    const liffId = useSettingsStore((s) => s.line_bot_liff_id);
    const [status, setStatus] = useState<Status>('init');
    const [errorText, setErrorText] = useState('');
    const [customer, setCustomer] = useState<CustomerInfo | null>(null);
    const [coupons, setCoupons] = useState<CouponOption[]>([]);
    const [resultText, setResultText] = useState('');
    const [issuing, setIssuing] = useState(false);

    useEffect(() => {
        if (!liffId) return;
        (async () => {
            try {
                const { default: liff } = await import('@line/liff');
                await liff.init({ liffId });
                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }
                setStatus('ready');
            } catch {
                setErrorText(
                    'LIFF 初始化失敗，請確認是從 LINE 官方帳號的選單開啟。'
                );
                setStatus('error');
            }
        })();
    }, [liffId]);

    async function handleScan() {
        setStatus('scanning');
        setErrorText('');

        const { default: liff } = await import('@line/liff');

        // liff.scanCodeV2 being truthy just means the SDK bundled the method —
        // it exists regardless of whether the current LIFF app/client actually
        // supports invoking it. isApiAvailable() is the real capability check;
        // without it this always passed and the real failure only ever showed
        // up as scanCodeV2() throwing later, indistinguishable from any other
        // failure in the generic catch below.
        if (!liff.isApiAvailable('scanCodeV2')) {
            setErrorText(
                '無法使用掃描功能——請確認 LIFF app 的 Scan QR 權限有打開（LINE Developers Console > 你的 LIFF app），且是在 LINE App 內開啟這個頁面。'
            );
            setStatus('error');
            return;
        }

        let scannedValue: string | null;
        try {
            const result = await liff.scanCodeV2();
            scannedValue = result.value ?? null;
        } catch (err) {
            // Surfaced on-screen (not just console) since this runs inside
            // LINE's in-app browser — there's no devtools to check on a phone.
            setErrorText(
                `掃描器啟動失敗：${err instanceof Error ? err.message : String(err)}`
            );
            setStatus('ready');
            return;
        }

        const customerId = scannedValue ? decodeCustomerQr(scannedValue) : null;
        if (!customerId) {
            setErrorText('不是有效的會員條碼，請重新掃描。');
            setStatus('ready');
            return;
        }

        try {
            const [customerRes, couponsRes] = await Promise.all([
                fetch(`/api/admin/customers/${customerId}`),
                fetch('/api/admin/coupons?perPage=100'),
            ]);

            if (customerRes.status === 403 || couponsRes.status === 403) {
                setErrorText('您沒有管理員權限，無法使用此功能。');
                setStatus('error');
                return;
            }
            if (!customerRes.ok) {
                setErrorText('找不到這位會員。');
                setStatus('ready');
                return;
            }
            if (!couponsRes.ok) {
                setErrorText('讀取優惠券清單失敗。');
                setStatus('ready');
                return;
            }

            const { customer: foundCustomer } = await customerRes.json();
            const { coupons: allCoupons } = await couponsRes.json();

            setCustomer(foundCustomer);
            setCoupons((allCoupons as CouponOption[]).filter(isCouponUsable));
            setStatus('customer-loaded');
        } catch (err) {
            setErrorText(
                `讀取會員/優惠券資料失敗：${err instanceof Error ? err.message : String(err)}`
            );
            setStatus('ready');
        }
    }

    async function handleIssue(couponId: string) {
        if (!customer) return;
        setIssuing(true);
        setErrorText('');
        try {
            const res = await fetch('/api/admin/coupons/issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: customer.id, couponId }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorText(data.error || '發送失敗');
                return;
            }
            setResultText(`已發送給 ${data.customerName}`);
            setStatus('done');
        } catch {
            setErrorText('發送失敗，請重試。');
        } finally {
            setIssuing(false);
        }
    }

    function reset() {
        setCustomer(null);
        setCoupons([]);
        setResultText('');
        setErrorText('');
        setStatus('ready');
    }

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    maxWidth: 480,
                    width: '100%',
                    margin: '0 auto',
                    padding: '24px 16px',
                    fontFamily: 'sans-serif',
                    boxSizing: 'border-box',
                }}
            >
                <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                    發放優惠券
                </h1>

                {status === 'init' && <p>初始化中...</p>}

                {(status === 'ready' || status === 'scanning') && (
                    <button
                        type="button"
                        onClick={handleScan}
                        disabled={status === 'scanning'}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: 16,
                            borderRadius: 8,
                            background: '#06C755',
                            color: '#fff',
                            border: 'none',
                        }}
                    >
                        {status === 'scanning' ? '掃描中...' : '掃描會員條碼'}
                    </button>
                )}

                {status === 'customer-loaded' && customer && (
                    <div>
                        <p style={{ marginBottom: 12 }}>
                            會員：<strong>{customer.name}</strong>
                            {!customer.line_user_id && (
                                <span style={{ color: '#c00' }}>
                                    （尚未綁定 LINE，無法發送）
                                </span>
                            )}
                        </p>
                        {coupons.length === 0 ? (
                            <p>目前沒有可發放的優惠券。</p>
                        ) : (
                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                }}
                            >
                                {coupons.map((c) => (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleIssue(c.id)}
                                            disabled={
                                                !customer.line_user_id ||
                                                issuing
                                            }
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: 12,
                                                borderRadius: 8,
                                                border: '1px solid #ddd',
                                                background: '#fff',
                                            }}
                                        >
                                            <div style={{ fontWeight: 600 }}>
                                                {c.code}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#666',
                                                }}
                                            >
                                                {c.description} ·{' '}
                                                {DISCOUNT_LABEL[
                                                    c.discount_type
                                                ](c)}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                marginTop: 16,
                                background: 'none',
                                border: 'none',
                                color: '#666',
                            }}
                        >
                            取消，重新掃描
                        </button>
                    </div>
                )}

                {status === 'done' && (
                    <div>
                        <p style={{ marginBottom: 16 }}>✅ {resultText}</p>
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                background: '#06C755',
                                color: '#fff',
                                border: 'none',
                            }}
                        >
                            繼續發放
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <p style={{ color: '#c00' }}>{errorText}</p>
                )}
                {errorText && status !== 'error' && (
                    <p style={{ color: '#c00', marginTop: 12 }}>{errorText}</p>
                )}
            </div>
        </div>
    );
}
