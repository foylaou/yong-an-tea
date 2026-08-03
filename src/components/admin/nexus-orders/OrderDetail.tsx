'use client';

import { useState } from 'react';
import Link from 'next/link';
import CachedImage from '@/components/CachedImage';
import { OrderStatusBadge, statusLabel } from './OrderStatusBadge';
import type { Order } from '@/types/order';

interface OrderDetailProps {
  order: Order;
}

const paymentMethodLabel: Record<string, string> = {
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
};

const STATUS_TRANSITIONS: Record<string, Record<string, string[]>> = {
  line_pay: {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled', 'refunded'],
    processing: ['shipped', 'cancelled'],
    shipped: ['completed'],
    completed: ['refunded'],
    cancelled: [],
    refunded: [],
  },
  bank_transfer: {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled', 'refunded'],
    processing: ['shipped', 'cancelled'],
    shipped: ['completed'],
    completed: ['refunded'],
    cancelled: [],
    refunded: [],
  },
  cod: {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['completed'],
    completed: ['refunded'],
    cancelled: [],
    refunded: [],
  },
};

export function OrderDetail({ order: initialOrder }: OrderDetailProps) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [message, setMessage] = useState('');
  const [tcatLoading, setTcatLoading] = useState(false);
  const [tcatFileNo, setTcatFileNo] = useState<string | null>(null);
  const [tcatDownloading, setTcatDownloading] = useState(false);
  const [trackingQueryLoading, setTrackingQueryLoading] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<any>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseTakeDate, setReverseTakeDate] = useState('');
  const [reverseStatus, setReverseStatus] = useState<any>(null);
  const [callLoading, setCallLoading] = useState(false);
  const [pickingLoading, setPickingLoading] = useState(false);
  const [pickingFileNo, setPickingFileNo] = useState<string | null>(null);
  const [pickingDownloading, setPickingDownloading] = useState(false);

  const transitions = STATUS_TRANSITIONS[order.payment_method] || STATUS_TRANSITIONS.bank_transfer;
  const allowedTransitions = transitions[order.status] || [];

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`確定要將狀態更新為「${statusLabel[newStatus] || newStatus}」嗎？`)) return;
    setUpdating(true);
    setMessage('');
    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === 'shipped' && trackingNumber) {
        body.tracking_number = trackingNumber;
      }
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder({ ...order, ...data.order, order_items: order.order_items, payments: order.payments });
        setMessage('狀態已更新');
      } else {
        setMessage(data.error || '更新失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setUpdating(false);
    }
  };

  const handleTcatShip = async () => {
    setTcatLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tcat-ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackingNumber(data.obtNumber);
        setTcatFileNo(data.fileNo);
        setOrder({ ...order, tracking_number: data.obtNumber });
        setMessage(`託運單已產生，單號：${data.obtNumber}`);
      } else {
        setMessage(data.error || '產生託運單失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setTcatLoading(false);
    }
  };

  const handleTcatClear = async () => {
    if (!confirm('確定要清除託運單號嗎？清除後可重新產生新的託運單。')) return;
    setUpdating(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tcat-ship`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setTrackingNumber('');
        setTcatFileNo(null);
        setOrder({ ...order, tracking_number: null });
        setMessage('託運單號已清除');
      } else {
        setMessage(data.error || '清除失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setUpdating(false);
    }
  };

  const handleTcatDownload = async () => {
    if (!tcatFileNo) return;
    setTcatDownloading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tcat-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNo: tcatFileNo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '下載失敗' }));
        setMessage(err.error || '下載失敗');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tcat-${tcatFileNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage('下載失敗');
    } finally {
      setTcatDownloading(false);
    }
  };

  const handleTrackingQuery = async () => {
    setTrackingQueryLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackingHistory(data.tracking);
      } else {
        setMessage(data.error || '查詢貨態失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setTrackingQueryLoading(false);
    }
  };

  const handleReverseAdd = async () => {
    if (!reverseTakeDate) {
      setMessage('請選擇取件日期');
      return;
    }
    const takeDate = reverseTakeDate.replace(/-/g, '');
    if (!confirm('確定要建立退貨取件預約嗎？黑貓將於指定日期到客戶地址取件。')) return;
    setReverseLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takeDate }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder({ ...order, reverse_obt_number: data.obtNumber });
        setMessage(`逆物流預約成功，單號：${data.obtNumber}`);
      } else {
        setMessage(data.error || '建立逆物流失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setReverseLoading(false);
    }
  };

  const handleReverseQuery = async () => {
    setReverseLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/reverse`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReverseStatus(data.order);
      } else {
        setMessage(data.error || '查詢失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setReverseLoading(false);
    }
  };

  const handleReverseDelete = async () => {
    if (!confirm('確定要刪除逆物流預約嗎？此操作僅在尚未送出集貨時有效。')) return;
    setReverseLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/reverse`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setOrder({ ...order, reverse_obt_number: null });
        setReverseStatus(null);
        setMessage('逆物流預約已刪除');
      } else {
        setMessage(data.error || '刪除失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setReverseLoading(false);
    }
  };

  const handleCallTcat = async () => {
    if (!confirm('確定要呼叫黑貓取件嗎？司機將前往寄件地址收取包裹。')) return;
    setCallLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/tcat-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ normalQuantity: 1 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('已成功呼叫黑貓取件，司機將前往收取包裹');
      } else {
        setMessage(data.error || '呼叫黑貓取件失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setCallLoading(false);
    }
  };

  const handlePickingList = async () => {
    setPickingLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tcat-picking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPickingFileNo(data.fileNo);
        if (data.obtNumber && !order.tracking_number) {
          setTrackingNumber(data.obtNumber);
          setOrder({ ...order, tracking_number: data.obtNumber });
        }
        setMessage('撿貨明細託運單已產生');
      } else {
        setMessage(data.error || '產生撿貨明細失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setPickingLoading(false);
    }
  };

  const handlePickingDownload = async () => {
    if (!pickingFileNo) return;
    setPickingDownloading(true);
    try {
      const res = await fetch('/api/admin/orders/batch-tcat-picking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNo: pickingFileNo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '下載失敗' }));
        setMessage(err.error || '下載失敗');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tcat-picking-${pickingFileNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage('下載失敗');
    } finally {
      setPickingDownloading(false);
    }
  };

  const address = order.shipping_address || {};

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-medium">訂單 {order.order_number}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.open(`/admin/orders-print?ids=${order.id}`, '_blank')}
            className="btn btn-sm btn-outline"
          >
            列印撿貨明細
          </button>
          <Link href="/admin/orders" className="text-base-content/60 hover:text-base-content text-sm">
            ← 返回訂單列表
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 space-y-6 lg:col-span-8">
          {/* Order info */}
          <div className="card card-border bg-base-100">
            <div className="card-body">
              <h2 className="card-title">訂單資訊</h2>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-base-content/50">狀態：</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div>
                  <span className="text-base-content/50">付款方式：</span>
                  <span>{paymentMethodLabel[order.payment_method] || order.payment_method}</span>
                </div>
                <div>
                  <span className="text-base-content/50">付款狀態：</span>
                  <span>{order.payment_status}</span>
                </div>
                <div>
                  <span className="text-base-content/50">下單時間：</span>
                  <span>{new Date(order.created_at).toLocaleString('zh-TW')}</span>
                </div>
                {order.paid_at && (
                  <div>
                    <span className="text-base-content/50">付款時間：</span>
                    <span>{new Date(order.paid_at).toLocaleString('zh-TW')}</span>
                  </div>
                )}
                {order.shipped_at && (
                  <div>
                    <span className="text-base-content/50">出貨時間：</span>
                    <span>{new Date(order.shipped_at).toLocaleString('zh-TW')}</span>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <span className="text-base-content/50">物流編號：</span>
                    <a
                      href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(order.tracking_number)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary font-mono"
                    >
                      {order.tracking_number}
                    </a>
                  </div>
                )}
              </div>
              {order.note && (
                <div className="bg-base-200 mt-4 rounded-box p-3 text-sm">
                  <span className="text-base-content/50">備註：</span>
                  {order.note}
                </div>
              )}
              {order.status === 'cancelled' && order.cancel_reason && (
                <div className="border-error/30 bg-error/10 mt-4 rounded-box border p-3 text-sm">
                  <p className="text-error mb-1 font-medium">取消原因</p>
                  <p className="text-error/80">{order.cancel_reason}</p>
                  {order.cancelled_at && (
                    <p className="text-error/60 mt-1 text-xs">
                      取消時間：{new Date(order.cancelled_at).toLocaleString('zh-TW')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">貨態查詢</h2>
                  <button
                    onClick={handleTrackingQuery}
                    disabled={trackingQueryLoading}
                    className="btn btn-sm btn-ghost text-primary"
                  >
                    {trackingQueryLoading ? '查詢中...' : '查詢最新貨態'}
                  </button>
                </div>

                {trackingHistory ? (
                  <div className="mt-2">
                    <div className="bg-base-200 mb-3 flex items-center gap-3 rounded-box p-3 text-sm">
                      <span className="font-medium">{trackingHistory.currentStatus}</span>
                      {trackingHistory.latestStation && (
                        <span className="text-base-content/50">({trackingHistory.latestStation})</span>
                      )}
                      {trackingHistory.latestTime && (
                        <span className="text-base-content/40 ml-auto text-xs">{trackingHistory.latestTime}</span>
                      )}
                    </div>
                    {trackingHistory.history?.length > 0 && (
                      <div className="space-y-2 text-sm">
                        {trackingHistory.history.map((event: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-1.5 flex flex-col items-center">
                              <span className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-success' : 'bg-base-300'}`} />
                              {idx < trackingHistory.history.length - 1 && <span className="bg-base-200 mt-0.5 h-5 w-px" />}
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-2">
                              <span className={idx === 0 ? 'font-medium' : 'text-base-content/50'}>
                                {event.statusName}
                                {event.station && <span className="text-base-content/40 ml-1">({event.station})</span>}
                              </span>
                              <span className="text-base-content/40 text-xs whitespace-nowrap">{event.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-base-content/40 text-sm">點擊「查詢最新貨態」獲取即時物流狀態</p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card card-border bg-base-100">
            <div className="card-body">
              <h2 className="card-title">商品明細</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th className="text-center">單價</th>
                      <th className="text-center">數量</th>
                      <th className="text-right">小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const items = order.order_items || [];
                      const groups = new Map<string, any[]>();
                      for (const item of items) {
                        const key = item.product_id || item.id;
                        if (!groups.has(key)) groups.set(key, []);
                        groups.get(key)!.push(item);
                      }
                      return [...groups.values()].flatMap((group) => {
                        const isVariantGroup = group.length > 1 || group[0].variant_label;
                        if (!isVariantGroup) {
                          const item = group[0];
                          return (
                            <tr key={item.id}>
                              <td>
                                <div className="flex items-center gap-2">
                                  {item.product_image && (
                                    <CachedImage
                                      src={item.product_image}
                                      alt={item.product_title}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded object-cover"
                                    />
                                  )}
                                  <span>{item.product_title}</span>
                                </div>
                              </td>
                              <td className="text-center">${Number(item.price).toLocaleString()}</td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-right">${Number(item.subtotal).toLocaleString()}</td>
                            </tr>
                          );
                        }
                        const first = group[0];
                        const groupTotal = group.reduce((sum: number, i: any) => sum + Number(i.subtotal), 0);
                        return group.map((item: any, idx: number) => (
                          <tr key={item.id}>
                            {idx === 0 && (
                              <td rowSpan={group.length} className="align-top">
                                <div className="flex items-start gap-2">
                                  {first.product_image && (
                                    <CachedImage
                                      src={first.product_image}
                                      alt={first.product_title}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 shrink-0 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <span className="font-medium">{first.product_title}</span>
                                    <div className="text-base-content/40 mt-0.5 text-xs">小計 ${groupTotal.toLocaleString()}</div>
                                  </div>
                                </div>
                              </td>
                            )}
                            <td className="text-center">
                              {item.variant_label && <div className="text-base-content/50 text-xs">{item.variant_label}</div>}
                              ${Number(item.price).toLocaleString()}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">${Number(item.subtotal).toLocaleString()}</td>
                          </tr>
                        ));
                      });
                    })()}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right font-medium">
                        小計
                      </td>
                      <td className="text-right">${Number(order.subtotal).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-right font-medium">
                        運費
                      </td>
                      <td className="text-right">
                        {Number(order.shipping_fee) === 0 ? '免運費' : `$${Number(order.shipping_fee).toLocaleString()}`}
                      </td>
                    </tr>
                    {Number(order.cod_fee) > 0 && (
                      <tr>
                        <td colSpan={3} className="text-right font-medium">
                          代收手續費
                        </td>
                        <td className="text-right">${Number(order.cod_fee).toLocaleString()}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="text-right text-lg font-bold">
                        合計
                      </td>
                      <td className="text-right text-lg font-bold">${Number(order.total).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Payments */}
          {order.payments?.length > 0 && (
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <h2 className="card-title">付款紀錄</h2>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>方式</th>
                        <th>狀態</th>
                        <th>交易 ID</th>
                        <th className="text-right">金額</th>
                        <th>時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.payments.map((payment: any) => (
                        <tr key={payment.id}>
                          <td>{paymentMethodLabel[payment.method] || payment.method}</td>
                          <td>{payment.status}</td>
                          <td className="font-mono text-xs">{payment.transaction_id || '-'}</td>
                          <td className="text-right">${Number(payment.amount).toLocaleString()}</td>
                          <td className="text-base-content/50">
                            {payment.paid_at ? new Date(payment.paid_at).toLocaleString('zh-TW') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-12 space-y-6 lg:col-span-4">
          {/* Customer info */}
          <div className="card card-border bg-base-100">
            <div className="card-body">
              <h2 className="card-title">客戶資訊</h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-base-content/50">{order.customer_email}</p>
                <p className="text-base-content/50">{order.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Company invoice */}
          {order.company_name && order.company_tax_id && (
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <h2 className="card-title">公司發票</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-base-content/50">公司抬頭：</span>
                    <span className="font-medium">{order.company_name}</span>
                  </p>
                  <p>
                    <span className="text-base-content/50">統一編號：</span>
                    <span className="font-mono font-medium">{order.company_tax_id}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shipping address / Store info */}
          <div className="card card-border bg-base-100">
            <div className="card-body">
              <h2 className="card-title">{order.shipping_method === 'tcat_b2s' ? '取貨門市' : '寄送地址'}</h2>
              {order.shipping_method === 'tcat_b2s' ? (
                <div className="space-y-1 text-sm">
                  <p className="text-base-content/40 mb-2 text-xs">7-11 超商取貨</p>
                  {order.store_name && <p className="font-medium">{order.store_name}</p>}
                  {order.store_id && <p className="text-base-content/50">門市代號：{order.store_id}</p>}
                  {order.store_address && <p className="text-base-content/50">{order.store_address}</p>}
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-base-content/40 mb-2 text-xs">黑貓宅配</p>
                  <p>
                    {address.postal_code && `${address.postal_code} `}
                    {address.city}
                    {address.district}
                    {address.address_line1}
                    {address.address_line2 && ` ${address.address_line2}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status update */}
          <div className="card card-border bg-base-100">
            <div className="card-body">
              <h2 className="card-title">更新狀態</h2>

              {(order.status === 'processing' || order.status === 'paid') && (
                <div className="space-y-3">
                  {!order.tracking_number ? (
                    <button type="button" onClick={handleTcatShip} disabled={tcatLoading} className="btn btn-sm btn-warning w-full">
                      {tcatLoading ? '產生中...' : '🚚 產生黑貓託運單'}
                    </button>
                  ) : (
                    <button type="button" onClick={handleTcatClear} disabled={updating} className="btn btn-sm btn-outline btn-error w-full">
                      清除託運單號（重新產生）
                    </button>
                  )}

                  {tcatFileNo && (
                    <button type="button" onClick={handleTcatDownload} disabled={tcatDownloading} className="btn btn-sm btn-outline btn-warning w-full">
                      {tcatDownloading ? '下載中...' : '📄 下載託運單 PDF'}
                    </button>
                  )}

                  {order.shipping_method !== 'tcat_b2s' && (
                    <button type="button" onClick={handlePickingList} disabled={pickingLoading} className="btn btn-sm btn-outline btn-secondary w-full">
                      {pickingLoading ? '產生中...' : '📋 產生撿貨明細託運單'}
                    </button>
                  )}

                  {pickingFileNo && (
                    <button type="button" onClick={handlePickingDownload} disabled={pickingDownloading} className="btn btn-sm btn-outline btn-secondary w-full">
                      {pickingDownloading ? '下載中...' : '📄 下載撿貨明細 PDF'}
                    </button>
                  )}

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">物流追蹤編號</legend>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="產生託運單後自動填入，或手動輸入"
                      className="input input-sm w-full"
                    />
                  </fieldset>
                </div>
              )}

              {allowedTransitions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {allowedTransitions.map((newStatus) => (
                    <button key={newStatus} onClick={() => handleStatusUpdate(newStatus)} disabled={updating} className="btn btn-sm btn-outline">
                      {statusLabel[newStatus] || newStatus}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-base-content/40 mt-3 text-sm">此狀態無法更新</p>
              )}

              {message && (
                <p className={`mt-3 text-sm whitespace-pre-line ${message.includes('成功') || message === '狀態已更新' ? 'text-success' : 'text-error'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Call T-Cat */}
          {order.tracking_number && ['processing', 'paid'].includes(order.status) && (
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <h2 className="card-title">呼叫黑貓取件</h2>
                <p className="text-base-content/50 text-sm">預約黑貓司機到寄件地址收取包裹。</p>
                <button type="button" onClick={handleCallTcat} disabled={callLoading} className="btn btn-sm btn-success w-full">
                  {callLoading ? '呼叫中...' : '📞 呼叫黑貓取件'}
                </button>
              </div>
            </div>
          )}

          {/* Reverse logistics */}
          {['shipped', 'completed', 'refunded'].includes(order.status) && (
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <h2 className="card-title">退貨取件（逆物流）</h2>

                {order.reverse_obt_number ? (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-base-content/50">逆物流單號：</span>
                      <a
                        href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(order.reverse_obt_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary font-mono"
                      >
                        {order.reverse_obt_number}
                      </a>
                    </div>

                    {reverseStatus && (
                      <div className="bg-base-200 space-y-1 rounded-box p-3 text-sm">
                        <p>
                          <span className="text-base-content/50">狀態：</span>
                          <span className={reverseStatus.Status === '01' ? 'text-warning' : 'text-success'}>
                            {reverseStatus.Status === '01' ? '未送出集貨（可修改/刪除）' : '已送出集貨'}
                          </span>
                        </p>
                        <p>
                          <span className="text-base-content/50">取件日：</span>
                          {reverseStatus.TakeDate}
                        </p>
                        <p>
                          <span className="text-base-content/50">寄件人：</span>
                          {reverseStatus.SenderName} {reverseStatus.SenderMobile}
                        </p>
                        <p>
                          <span className="text-base-content/50">寄件地址：</span>
                          {reverseStatus.SenderAddress}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button type="button" onClick={handleReverseQuery} disabled={reverseLoading} className="btn btn-sm btn-outline flex-1">
                        {reverseLoading ? '查詢中...' : '查詢狀態'}
                      </button>
                      <button type="button" onClick={handleReverseDelete} disabled={reverseLoading} className="btn btn-sm btn-outline btn-error flex-1">
                        刪除預約
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-base-content/50 text-sm">建立退貨取件預約，黑貓將到客戶地址取件並寄回店家。</p>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">取件日期（D+1 ~ D+7）</legend>
                      <input
                        type="date"
                        value={reverseTakeDate}
                        onChange={(e) => setReverseTakeDate(e.target.value)}
                        min={(() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d.toISOString().split('T')[0];
                        })()}
                        max={(() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          return d.toISOString().split('T')[0];
                        })()}
                        className="input input-sm w-full"
                      />
                    </fieldset>
                    <button
                      type="button"
                      onClick={handleReverseAdd}
                      disabled={reverseLoading || !reverseTakeDate}
                      className="btn btn-sm btn-secondary w-full"
                    >
                      {reverseLoading ? '處理中...' : '建立退貨取件預約'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
