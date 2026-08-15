import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { encodeCustomerQr } from '../../lib/customer-qr';

type Status = 'init' | 'loading' | 'ready' | 'error';

/**
 * Reached from the (customer-facing) rich menu — shows the member's own QR
 * code for staff to scan at the counter. Same encoding POS's CustomerPicker
 * already decodes, so nothing changes on the scanning side.
 */
export default function MyQrPage() {
    const liffId = useSettingsStore((s) => s.line_bot_liff_id);
    const [status, setStatus] = useState<Status>('init');
    const [errorText, setErrorText] = useState('');
    const [customerName, setCustomerName] = useState('');
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
                const res = await fetch('/api/account/member-qr');
                const data = await res.json();
                if (!res.ok) {
                    setErrorText(data.error || '無法載入會員資料');
                    setStatus('error');
                    return;
                }

                setCustomerName(data.name);
                const dataUrl = await QRCode.toDataURL(
                    encodeCustomerQr(data.id),
                    { width: 320, margin: 2 }
                );
                setQrDataUrl(dataUrl);
                setStatus('ready');
            } catch {
                setErrorText('載入失敗，請確認是從 LINE 官方帳號的選單開啟。');
                setStatus('error');
            }
        })();
    }, [liffId]);

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
                <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                    我的會員條碼
                </h1>

                {(status === 'init' || status === 'loading') && (
                    <p>載入中...</p>
                )}

                {status === 'ready' && (
                    <div>
                        <p style={{ marginBottom: 12 }}>{customerName}</p>
                        {qrDataUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={qrDataUrl}
                                alt="會員 QR code"
                                style={{
                                    width: '100%',
                                    maxWidth: 320,
                                    borderRadius: 8,
                                    border: '1px solid #eee',
                                }}
                            />
                        )}
                        <p
                            style={{
                                marginTop: 16,
                                fontSize: 13,
                                color: '#666',
                            }}
                        >
                            結帳時請出示這個畫面給店員掃描
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <p style={{ color: '#c00' }}>{errorText}</p>
                )}
            </div>
        </div>
    );
}
