import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { liffStyles as s } from '../../lib/liff-admin-styles';

interface CouponOption {
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
    discount_value: number;
    min_order_amount: number;
    expires_at: string | null;
}

type Status = 'init' | 'loading' | 'ready' | 'error';

const DISCOUNT_LABEL: Record<
    CouponOption['discount_type'],
    (c: CouponOption) => string
> = {
    percentage: (c) => `${c.discount_value}% 折扣`,
    fixed_amount: (c) => `折抵 $${c.discount_value}`,
    free_shipping: () => '免運費',
};

/**
 * Reached from the (customer-facing) rich menu — lists every coupon this
 * member can still use (same pool as the LINE bot's "優惠" keyword reply,
 * minus anything they've already redeemed up to its per_user_limit) and
 * shows a QR code of the raw coupon code for staff to scan in POS.
 *
 * There's no separate "mark as used" step: the moment a POS checkout
 * records the redemption (coupon_usages), this same list — re-fetched on
 * next open — naturally drops that coupon, since it's filtered by the exact
 * same per_user_limit check validateCoupon() applies at checkout. The "優惠"
 * LINE keyword itself is untouched — it still lists every active coupon to
 * anyone who asks, member or not.
 */
export default function MyCouponsPage() {
    const liffId = useSettingsStore((s) => s.line_bot_liff_id);
    const [status, setStatus] = useState<Status>('init');
    const [errorText, setErrorText] = useState('');
    const [coupons, setCoupons] = useState<CouponOption[]>([]);
    const [selected, setSelected] = useState<CouponOption | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

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

                setStatus('loading');
                const res = await fetch('/api/account/my-coupons');
                const data = await res.json();
                if (!res.ok) {
                    setErrorText(data.error || '無法載入優惠券');
                    setStatus('error');
                    return;
                }
                setCoupons(data.coupons || []);
                setStatus('ready');
            } catch {
                setErrorText('載入失敗，請確認是從 LINE 官方帳號的選單開啟。');
                setStatus('error');
            }
        })();
    }, [liffId]);

    async function showQr(coupon: CouponOption) {
        setSelected(coupon);
        // Plain coupon code, no namespacing — POS's coupon scanner just
        // reads the QR as-is and treats it as the code text (unlike the
        // customer member QR, which needs the yat-customer: prefix).
        const dataUrl = await QRCode.toDataURL(coupon.code, {
            width: 320,
            margin: 2,
        });
        setQrDataUrl(dataUrl);
    }

    function backToList() {
        setSelected(null);
        setQrDataUrl(null);
    }

    if (selected) {
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
                        maxWidth: 400,
                        width: '100%',
                        margin: '0 auto',
                        padding: '24px 16px',
                        textAlign: 'center',
                        fontFamily: 'sans-serif',
                        boxSizing: 'border-box',
                    }}
                >
                    <h1
                        style={{
                            fontSize: 20,
                            fontWeight: 600,
                            marginBottom: 4,
                        }}
                    >
                        {selected.code}
                    </h1>
                    <p style={{ color: '#666', marginBottom: 16 }}>
                        {selected.description}
                    </p>
                    {qrDataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={qrDataUrl}
                            alt="優惠券 QR code"
                            style={{
                                width: '100%',
                                maxWidth: 320,
                                borderRadius: 8,
                                border: '1px solid #eee',
                            }}
                        />
                    )}
                    <p style={{ marginTop: 16, fontSize: 13, color: '#666' }}>
                        結帳時請出示這個畫面給店員掃描
                    </p>
                    <button
                        type="button"
                        onClick={backToList}
                        style={{
                            marginTop: 20,
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            fontSize: 14,
                        }}
                    >
                        ← 返回優惠券列表
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                <h1 style={s.h1}>我的優惠券</h1>

                {(status === 'init' || status === 'loading') && (
                    <p>載入中...</p>
                )}
                {status === 'error' && <p style={s.errorText}>{errorText}</p>}

                {status === 'ready' &&
                    (coupons.length === 0 ? (
                        <p style={{ color: '#666' }}>
                            目前沒有可使用的優惠券。
                        </p>
                    ) : (
                        coupons.map((c) => (
                            <div key={c.code} style={s.card}>
                                <div style={{ fontWeight: 600 }}>{c.code}</div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: '#666',
                                        marginTop: 2,
                                    }}
                                >
                                    {c.description}
                                </div>
                                <div style={{ fontSize: 13, marginTop: 4 }}>
                                    {DISCOUNT_LABEL[c.discount_type](c)}
                                    {c.min_order_amount > 0 &&
                                        ` · 滿 $${c.min_order_amount.toLocaleString()} 可用`}
                                </div>
                                {c.expires_at && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#999',
                                            marginTop: 2,
                                        }}
                                    >
                                        使用期限：
                                        {new Date(
                                            c.expires_at
                                        ).toLocaleDateString('zh-TW')}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => showQr(c)}
                                    style={{
                                        ...s.primaryButton,
                                        width: '100%',
                                        marginTop: 10,
                                    }}
                                >
                                    顯示 QR code
                                </button>
                            </div>
                        ))
                    ))}
            </div>
        </div>
    );
}
