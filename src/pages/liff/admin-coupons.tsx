import { useEffect, useState, useCallback } from 'react';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { liffStyles as s } from '../../lib/liff-admin-styles';

interface Coupon {
    id: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
    discount_value: number;
    min_order_amount: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    per_user_limit: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    is_welcome_coupon: boolean;
}

type Status = 'init' | 'loading' | 'ready' | 'error';
type View = 'list' | 'form';

function blankForm() {
    return {
        id: null as string | null,
        code: '',
        description: '',
        discount_type: 'percentage' as Coupon['discount_type'],
        discount_value: 0,
        min_order_amount: 0,
        max_discount: '' as number | '',
        usage_limit: '' as number | '',
        per_user_limit: 1,
        starts_at: '',
        expires_at: '',
        is_active: true,
        is_welcome_coupon: false,
    };
}

export default function AdminCouponsPage() {
    const liffId = useSettingsStore((s) => s.line_bot_liff_id);
    const [status, setStatus] = useState<Status>('init');
    const [errorText, setErrorText] = useState('');
    const [view, setView] = useState<View>('list');
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [form, setForm] = useState(blankForm());
    const [saving, setSaving] = useState(false);
    const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
    const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

    const loadCoupons = useCallback(async () => {
        setStatus('loading');
        setErrorText('');
        try {
            const res = await fetch('/api/admin/coupons?perPage=100');
            const data = await res.json();
            if (res.status === 403) {
                setErrorText('您沒有管理員權限。');
                setStatus('error');
                return;
            }
            if (!res.ok) {
                setErrorText(data.error || '讀取優惠券失敗');
                setStatus('error');
                return;
            }
            setCoupons(data.coupons || []);
            setStatus('ready');
        } catch (err) {
            setErrorText(
                `讀取優惠券失敗：${err instanceof Error ? err.message : String(err)}`
            );
            setStatus('error');
        }
    }, []);

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
                await loadCoupons();
            } catch {
                setErrorText(
                    'LIFF 初始化失敗，請確認是從 LINE 官方帳號的選單開啟。'
                );
                setStatus('error');
            }
        })();
    }, [liffId, loadCoupons]);

    function startNew() {
        setForm(blankForm());
        setErrorText('');
        setView('form');
    }

    function startEdit(c: Coupon) {
        setForm({
            id: c.id,
            code: c.code,
            description: c.description,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            min_order_amount: c.min_order_amount,
            max_discount: c.max_discount ?? '',
            usage_limit: c.usage_limit ?? '',
            per_user_limit: c.per_user_limit,
            starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
            expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
            is_active: c.is_active,
            is_welcome_coupon: c.is_welcome_coupon,
        });
        setErrorText('');
        setView('form');
    }

    async function handleSave() {
        setSaving(true);
        setErrorText('');
        try {
            const payload = {
                code: form.code,
                description: form.description,
                discount_type: form.discount_type,
                discount_value: Number(form.discount_value),
                min_order_amount: Number(form.min_order_amount),
                max_discount:
                    form.max_discount === '' ? null : Number(form.max_discount),
                usage_limit:
                    form.usage_limit === '' ? null : Number(form.usage_limit),
                per_user_limit: Number(form.per_user_limit),
                starts_at: form.starts_at
                    ? new Date(form.starts_at).toISOString()
                    : null,
                expires_at: form.expires_at
                    ? new Date(form.expires_at).toISOString()
                    : null,
                is_active: form.is_active,
                is_welcome_coupon: form.is_welcome_coupon,
                product_ids: null,
                category_ids: null,
            };

            const res = await fetch(
                form.id
                    ? `/api/admin/coupons/${form.id}`
                    : '/api/admin/coupons',
                {
                    method: form.id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setErrorText(data.error || '儲存失敗');
                return;
            }
            await loadCoupons();
            setView('list');
        } catch (err) {
            setErrorText(
                `儲存失敗：${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('確定要刪除這張優惠券嗎？')) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorText(data.error || '刪除失敗');
                return;
            }
            await loadCoupons();
        } catch (err) {
            setErrorText(
                `刪除失敗：${err instanceof Error ? err.message : String(err)}`
            );
        }
    }

    async function handleBroadcast(id: string) {
        setBroadcastingId(id);
        setBroadcastResult(null);
        try {
            const res = await fetch(`/api/admin/coupons/${id}/broadcast`, {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) {
                setBroadcastResult(data.error || '推播失敗');
                return;
            }
            setBroadcastResult(
                `已推播給 ${data.sent}/${data.total} 位 LINE 會員`
            );
        } catch (err) {
            setBroadcastResult(
                `推播失敗：${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setBroadcastingId(null);
        }
    }

    function discountText(c: Coupon): string {
        if (c.discount_type === 'percentage')
            return `${c.discount_value}% 折扣`;
        if (c.discount_type === 'fixed_amount')
            return `折抵 $${c.discount_value}`;
        return '免運費';
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                <h1 style={s.h1}>優惠券管理</h1>

                {(status === 'init' || status === 'loading') && (
                    <p>載入中...</p>
                )}
                {status === 'error' && <p style={s.errorText}>{errorText}</p>}

                {status === 'ready' && view === 'list' && (
                    <>
                        <button
                            type="button"
                            onClick={startNew}
                            style={{
                                ...s.primaryButton,
                                width: '100%',
                                marginBottom: 12,
                            }}
                        >
                            + 新增優惠券
                        </button>

                        {coupons.length === 0 ? (
                            <p style={{ color: '#666' }}>還沒有任何優惠券。</p>
                        ) : (
                            coupons.map((c) => (
                                <div key={c.id} style={s.card}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {c.code}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#666',
                                                }}
                                            >
                                                {c.description}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#666',
                                                }}
                                            >
                                                {discountText(c)}
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: 4,
                                                    display: 'flex',
                                                    gap: 4,
                                                }}
                                            >
                                                <span
                                                    style={s.badge(
                                                        c.is_active
                                                            ? '#e8f7ee'
                                                            : '#f2f2f2',
                                                        c.is_active
                                                            ? '#0a7d2c'
                                                            : '#888'
                                                    )}
                                                >
                                                    {c.is_active
                                                        ? '啟用中'
                                                        : '已停用'}
                                                </span>
                                                {c.is_welcome_coupon && (
                                                    <span
                                                        style={s.badge(
                                                            '#fdeedc',
                                                            '#a6560a'
                                                        )}
                                                    >
                                                        入會禮
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 8,
                                            marginTop: 10,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => startEdit(c)}
                                            style={{
                                                ...s.outlineButton,
                                                flex: 1,
                                            }}
                                        >
                                            編輯
                                        </button>
                                        <button
                                            type="button"
                                            disabled={broadcastingId === c.id}
                                            onClick={() =>
                                                handleBroadcast(c.id)
                                            }
                                            style={{
                                                ...s.outlineButton,
                                                flex: 1,
                                            }}
                                        >
                                            {broadcastingId === c.id
                                                ? '推播中...'
                                                : '推播'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(c.id)}
                                            style={s.dangerButton}
                                        >
                                            刪除
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}

                        {broadcastResult && (
                            <p style={s.successText}>{broadcastResult}</p>
                        )}
                        {errorText && <p style={s.errorText}>{errorText}</p>}
                    </>
                )}

                {view === 'form' && (
                    <div>
                        <label style={s.label}>折扣碼</label>
                        <input
                            style={s.input}
                            value={form.code}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    code: e.target.value.toUpperCase(),
                                }))
                            }
                            placeholder="SUMMER2026"
                        />

                        <label style={s.label}>描述</label>
                        <input
                            style={s.input}
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                        />

                        <label style={s.label}>折扣類型</label>
                        <select
                            style={s.input}
                            value={form.discount_type}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    discount_type: e.target
                                        .value as Coupon['discount_type'],
                                }))
                            }
                        >
                            <option value="percentage">百分比折扣</option>
                            <option value="fixed_amount">固定金額</option>
                            <option value="free_shipping">免運費</option>
                        </select>

                        {form.discount_type !== 'free_shipping' && (
                            <>
                                <label style={s.label}>
                                    {form.discount_type === 'percentage'
                                        ? '折扣百分比 (%)'
                                        : '折扣金額 (元)'}
                                </label>
                                <input
                                    style={s.input}
                                    type="number"
                                    value={form.discount_value}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            discount_value: Number(
                                                e.target.value
                                            ),
                                        }))
                                    }
                                />
                            </>
                        )}

                        <label style={s.label}>最低訂單金額</label>
                        <input
                            style={s.input}
                            type="number"
                            value={form.min_order_amount}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    min_order_amount: Number(e.target.value),
                                }))
                            }
                        />

                        {form.discount_type === 'percentage' && (
                            <>
                                <label style={s.label}>
                                    折扣上限金額（留空不限制）
                                </label>
                                <input
                                    style={s.input}
                                    type="number"
                                    value={form.max_discount}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            max_discount:
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                        }))
                                    }
                                />
                            </>
                        )}

                        <label style={s.label}>
                            總使用次數上限（留空不限制）
                        </label>
                        <input
                            style={s.input}
                            type="number"
                            value={form.usage_limit}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    usage_limit:
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                }))
                            }
                        />

                        <label style={s.label}>每人使用次數上限</label>
                        <input
                            style={s.input}
                            type="number"
                            value={form.per_user_limit}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    per_user_limit: Number(e.target.value),
                                }))
                            }
                        />

                        <label style={s.label}>開始時間（留空立即生效）</label>
                        <input
                            style={s.input}
                            type="datetime-local"
                            value={form.starts_at}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    starts_at: e.target.value,
                                }))
                            }
                        />

                        <label style={s.label}>結束時間（留空永不過期）</label>
                        <input
                            style={s.input}
                            type="datetime-local"
                            value={form.expires_at}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    expires_at: e.target.value,
                                }))
                            }
                        />

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 14,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        is_active: e.target.checked,
                                    }))
                                }
                            />
                            <span style={{ fontSize: 14 }}>啟用此優惠券</span>
                        </label>

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 8,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={form.is_welcome_coupon}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        is_welcome_coupon: e.target.checked,
                                    }))
                                }
                            />
                            <span style={{ fontSize: 14 }}>
                                設為新會員入會禮（之後新綁定 LINE
                                的會員自動收到）
                            </span>
                        </label>

                        <p
                            style={{
                                fontSize: 12,
                                color: '#999',
                                marginTop: 8,
                            }}
                        >
                            手機版暫不支援限定特定商品/分類，需要的話請到電腦版後台設定。
                        </p>

                        {errorText && <p style={s.errorText}>{errorText}</p>}

                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button
                                type="button"
                                disabled={saving || !form.code}
                                onClick={handleSave}
                                style={{ ...s.primaryButton, flex: 1 }}
                            >
                                {saving ? '儲存中...' : '儲存'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                style={{ ...s.outlineButton, flex: 1 }}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
