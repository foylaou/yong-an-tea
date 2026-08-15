import { useEffect, useState, useCallback } from 'react';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { liffStyles as s } from '../../lib/liff-admin-styles';

interface OrderRow {
    id: string;
    order_number: string;
    customer_name: string;
    status: string;
    payment_method: string;
    total: number;
    created_at: string;
}

interface OrderItem {
    id: string;
    product_title: string;
    variant_label: string | null;
    quantity: number;
}

type Status = 'init' | 'loading' | 'ready' | 'error';

const STATUS_LABEL: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    processing: '備貨中',
};

// [background, text] per status — distinct colors so orders in different
// states are actually distinguishable at a glance, not just by their label.
const STATUS_BADGE_COLOR: Record<string, [string, string]> = {
    pending: ['#fff3cd', '#8a6d00'],
    paid: ['#e6f0ff', '#1a56c2'],
    processing: ['#e8f7ee', '#0a7d2c'],
};

// COD is collected on delivery, not upfront — its "needs prep/shipping"
// state is 待付款 (pending), not 已付款 like bank_transfer/line_pay. A plain
// status=paid,processing filter silently drops every COD order sitting in
// pending, which is exactly the order that actually needs action.
function needsAction(
    order: Pick<OrderRow, 'status' | 'payment_method'>
): boolean {
    if (order.payment_method === 'cod') {
        return order.status === 'pending' || order.status === 'processing';
    }
    return order.status === 'paid' || order.status === 'processing';
}

function nextStatusFor(
    order: Pick<OrderRow, 'status'>
): 'processing' | 'shipped' {
    return order.status === 'processing' ? 'shipped' : 'processing';
}

function isToday(iso: string): boolean {
    const d = new Date(iso);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

/**
 * Deliberately narrow scope (per conversation): a fast "do I have online
 * orders today that need prep/shipping" glance + the two most common status
 * bumps, not a full orders admin. Full search/filter/detail still lives in
 * the desktop admin panel.
 */
export default function AdminOrdersPage() {
    const liffId = useSettingsStore((s) => s.line_bot_liff_id);
    const [status, setStatus] = useState<Status>('init');
    const [errorText, setErrorText] = useState('');
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [itemsById, setItemsById] = useState<Record<string, OrderItem[]>>({});
    const [loadingItemsId, setLoadingItemsId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setStatus('loading');
        setErrorText('');
        try {
            // Fetch the superset (pending covers COD's pre-fulfillment state
            // too) and apply the real "needs action" rule client-side —
            // see needsAction()'s comment for why a plain status filter
            // isn't enough on its own.
            const res = await fetch(
                '/api/admin/orders?status=pending,paid,processing&perPage=50'
            );
            const data = await res.json();
            if (res.status === 403) {
                setErrorText('您沒有管理員權限。');
                setStatus('error');
                return;
            }
            if (!res.ok) {
                setErrorText(data.error || '讀取訂單失敗');
                setStatus('error');
                return;
            }
            setOrders((data.orders || []).filter(needsAction));
            setStatus('ready');
        } catch (err) {
            setErrorText(
                `讀取訂單失敗：${err instanceof Error ? err.message : String(err)}`
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
                await loadOrders();
            } catch {
                setErrorText(
                    'LIFF 初始化失敗，請確認是從 LINE 官方帳號的選單開啟。'
                );
                setStatus('error');
            }
        })();
    }, [liffId, loadOrders]);

    async function toggleExpand(order: OrderRow) {
        if (expandedId === order.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(order.id);
        if (itemsById[order.id]) return; // already fetched once, no need to reload every tap

        setLoadingItemsId(order.id);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`);
            const data = await res.json();
            if (res.ok) {
                setItemsById((prev) => ({
                    ...prev,
                    [order.id]: data.order?.order_items ?? [],
                }));
            } else {
                setErrorText(data.error || '讀取商品明細失敗');
            }
        } catch (err) {
            setErrorText(
                `讀取商品明細失敗：${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setLoadingItemsId(null);
        }
    }

    async function advanceStatus(order: OrderRow) {
        const nextStatus = nextStatusFor(order);
        setUpdatingId(order.id);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorText(data.error || '更新失敗');
                return;
            }
            // Shipped orders drop out of this list entirely — they no longer need prep/shipping.
            setOrders((prev) =>
                nextStatus === 'shipped'
                    ? prev.filter((o) => o.id !== order.id)
                    : prev.map((o) =>
                          o.id === order.id ? { ...o, status: nextStatus } : o
                      )
            );
        } catch (err) {
            setErrorText(
                `更新失敗：${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setUpdatingId(null);
        }
    }

    const todayCount = orders.filter((o) => isToday(o.created_at)).length;

    return (
        <div style={s.page}>
            <div style={s.container}>
                <h1 style={s.h1}>今日訂單</h1>

                {(status === 'init' || status === 'loading') && (
                    <p>載入中...</p>
                )}
                {status === 'error' && <p style={s.errorText}>{errorText}</p>}

                {status === 'ready' && (
                    <>
                        <p
                            style={{
                                fontSize: 13,
                                color: '#666',
                                marginBottom: 12,
                            }}
                        >
                            待處理 {orders.length} 筆（今天新進 {todayCount}{' '}
                            筆）
                        </p>

                        {orders.length === 0 ? (
                            <p style={{ color: '#666' }}>
                                目前沒有需要備貨/出貨的訂單。
                            </p>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} style={s.card}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {order.order_number}{' '}
                                                {isToday(order.created_at) && (
                                                    <span
                                                        style={s.badge(
                                                            '#fff3cd',
                                                            '#8a6d00'
                                                        )}
                                                    >
                                                        今天
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#666',
                                                    marginTop: 2,
                                                }}
                                            >
                                                {order.customer_name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#666',
                                                }}
                                            >
                                                ${order.total}
                                            </div>
                                        </div>
                                        <span
                                            style={s.badge(
                                                STATUS_BADGE_COLOR[
                                                    order.status
                                                ]?.[0] ?? '#f2f2f2',
                                                STATUS_BADGE_COLOR[
                                                    order.status
                                                ]?.[1] ?? '#666'
                                            )}
                                        >
                                            {STATUS_LABEL[order.status] ||
                                                order.status}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(order)}
                                        style={{
                                            ...s.outlineButton,
                                            width: '100%',
                                            marginTop: 10,
                                        }}
                                    >
                                        {expandedId === order.id
                                            ? '收合商品明細'
                                            : loadingItemsId === order.id
                                              ? '載入中...'
                                              : '查看商品明細'}
                                    </button>

                                    {expandedId === order.id && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                paddingTop: 8,
                                                borderTop: '1px dashed #ddd',
                                            }}
                                        >
                                            {(itemsById[order.id] ?? []).map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            fontSize: 13,
                                                            padding: '3px 0',
                                                        }}
                                                    >
                                                        <span>
                                                            {item.product_title}
                                                            {item.variant_label
                                                                ? `（${item.variant_label}）`
                                                                : ''}
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: '#666',
                                                            }}
                                                        >
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={updatingId === order.id}
                                        onClick={() => advanceStatus(order)}
                                        style={{
                                            ...s.primaryButton,
                                            width: '100%',
                                            marginTop: 8,
                                        }}
                                    >
                                        {updatingId === order.id
                                            ? '處理中...'
                                            : nextStatusFor(order) ===
                                                'processing'
                                              ? '開始備貨'
                                              : '標記已出貨'}
                                    </button>
                                </div>
                            ))
                        )}

                        {errorText && <p style={s.errorText}>{errorText}</p>}

                        <button
                            type="button"
                            onClick={loadOrders}
                            style={{
                                ...s.outlineButton,
                                width: '100%',
                                marginTop: 8,
                            }}
                        >
                            重新整理
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
