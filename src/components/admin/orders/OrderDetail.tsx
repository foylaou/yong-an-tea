'use client';

import { useState } from 'react';
import Link from 'next/link';
import OrderStatusBadge, { statusLabel } from './OrderStatusBadge';

interface AdminOrderDetailProps {
  order: any;
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

export default function AdminOrderDetail({ order: initialOrder }: AdminOrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [message, setMessage] = useState('');
  const [tcatLoading, setTcatLoading] = useState(false);
  const [tcatFileNo, setTcatFileNo] = useState<string | null>(null);
  const [tcatDownloading, setTcatDownloading] = useState(false);
  // Tracking
  const [trackingQueryLoading, setTrackingQueryLoading] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<any>(null);
  // Reverse logistics
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseTakeDate, setReverseTakeDate] = useState('');
  const [reverseStatus, setReverseStatus] = useState<any>(null);
  // Call T-Cat (呼叫取件)
  const [callLoading, setCallLoading] = useState(false);
  // Picking list (撿貨明細)
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
      const res = await fetch(`/api/admin/orders/${order.id}/tcat-ship`, {
        method: 'DELETE',
      });
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

  // --- Tracking handler ---
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

  // --- Reverse logistics handlers ---
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
      const res = await fetch(`/api/admin/orders/${order.id}/reverse`, {
        method: 'DELETE',
      });
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

  // --- Call T-Cat handler ---
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

  // --- Picking list handler ---
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
        setMessage(`撿貨明細託運單已產生`);
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          訂單 {order.order_number}
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.open(`/admin/orders-print?ids=${order.id}`, '_blank')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            列印撿貨明細
          </button>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            &larr; 返回訂單列表
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Order info */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">訂單資訊</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">狀態：</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <span className="text-gray-500">付款方式：</span>
                <span>{paymentMethodLabel[order.payment_method] || order.payment_method}</span>
              </div>
              <div>
                <span className="text-gray-500">付款狀態：</span>
                <span>{order.payment_status}</span>
              </div>
              <div>
                <span className="text-gray-500">下單時間：</span>
                <span>{new Date(order.created_at).toLocaleString('zh-TW')}</span>
              </div>
              {order.paid_at && (
                <div>
                  <span className="text-gray-500">付款時間：</span>
                  <span>{new Date(order.paid_at).toLocaleString('zh-TW')}</span>
                </div>
              )}
              {order.shipped_at && (
                <div>
                  <span className="text-gray-500">出貨時間：</span>
                  <span>{new Date(order.shipped_at).toLocaleString('zh-TW')}</span>
                </div>
              )}
              {order.tracking_number && (
                <div>
                  <span className="text-gray-500">物流編號：</span>
                  <a
                    href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(order.tracking_number)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:underline"
                  >
                    {order.tracking_number}
                  </a>
                </div>
              )}
            </div>
            {order.note && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <span className="text-gray-500">備註：</span>
                {order.note}
              </div>
            )}
            {order.status === 'cancelled' && order.cancel_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="font-medium text-red-700 mb-1">取消原因</p>
                <p className="text-red-600">{order.cancel_reason}</p>
                {order.cancelled_at && (
                  <p className="text-xs text-red-400 mt-1">
                    取消時間：{new Date(order.cancelled_at).toLocaleString('zh-TW')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">貨態查詢</h2>
                <button
                  onClick={handleTrackingQuery}
                  disabled={trackingQueryLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {trackingQueryLoading ? '查詢中...' : '查詢最新貨態'}
                </button>
              </div>

              {trackingHistory ? (
                <div>
                  <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded text-sm">
                    <span className="font-medium">{trackingHistory.currentStatus}</span>
                    {trackingHistory.latestStation && (
                      <span className="text-gray-500">({trackingHistory.latestStation})</span>
                    )}
                    {trackingHistory.latestTime && (
                      <span className="text-gray-400 ml-auto text-xs">{trackingHistory.latestTime}</span>
                    )}
                  </div>
                  {trackingHistory.history?.length > 0 && (
                    <div className="space-y-2 text-sm">
                      {trackingHistory.history.map((event: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex flex-col items-center mt-1.5">
                            <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            {idx < trackingHistory.history.length - 1 && (
                              <span className="w-px h-5 bg-gray-200 mt-0.5" />
                            )}
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <span className={idx === 0 ? 'font-medium' : 'text-gray-500'}>
                              {event.statusName}
                              {event.station && <span className="text-gray-400 ml-1">({event.station})</span>}
                            </span>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{event.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">點擊「查詢最新貨態」獲取即時物流狀態</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">商品明細</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">商品</th>
                  <th className="px-3 py-2 text-center font-medium">單價</th>
                  <th className="px-3 py-2 text-center font-medium">數量</th>
                  <th className="px-3 py-2 text-right font-medium">小計</th>
                </tr>
              </thead>
              <tbody>
                {(order.order_items || []).map((item: any) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span>{item.product_title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">${Number(item.price).toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">${Number(item.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-medium">小計</td>
                  <td className="px-3 py-2 text-right">${Number(order.subtotal).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-medium">運費</td>
                  <td className="px-3 py-2 text-right">
                    {Number(order.shipping_fee) === 0 ? '免運費' : `$${Number(order.shipping_fee).toLocaleString()}`}
                  </td>
                </tr>
                {Number(order.cod_fee) > 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-medium">代收手續費</td>
                    <td className="px-3 py-2 text-right">${Number(order.cod_fee).toLocaleString()}</td>
                  </tr>
                )}
                <tr className="border-t border-gray-300">
                  <td colSpan={3} className="px-3 py-2 text-right font-bold text-lg">合計</td>
                  <td className="px-3 py-2 text-right font-bold text-lg">${Number(order.total).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payments */}
          {order.payments?.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-medium mb-4">付款紀錄</h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">方式</th>
                    <th className="px-3 py-2 text-left font-medium">狀態</th>
                    <th className="px-3 py-2 text-left font-medium">交易 ID</th>
                    <th className="px-3 py-2 text-right font-medium">金額</th>
                    <th className="px-3 py-2 text-left font-medium">時間</th>
                  </tr>
                </thead>
                <tbody>
                  {order.payments.map((payment: any) => (
                    <tr key={payment.id} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        {paymentMethodLabel[payment.method] || payment.method}
                      </td>
                      <td className="px-3 py-2">{payment.status}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {payment.transaction_id || '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        ${Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleString('zh-TW')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Customer info */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">客戶資訊</h2>
            <div className="text-sm space-y-2">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-gray-500">{order.customer_email}</p>
              <p className="text-gray-500">{order.customer_phone}</p>
            </div>
          </div>

          {/* Company invoice */}
          {order.company_name && order.company_tax_id && (
            <div className="rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-medium mb-4">公司發票</h2>
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-gray-500">公司抬頭：</span>
                  <span className="font-medium">{order.company_name}</span>
                </p>
                <p>
                  <span className="text-gray-500">統一編號：</span>
                  <span className="font-mono font-medium">{order.company_tax_id}</span>
                </p>
              </div>
            </div>
          )}

          {/* Shipping address / Store info */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">
              {order.shipping_method === 'tcat_b2s' ? '取貨門市' : '寄送地址'}
            </h2>
            {order.shipping_method === 'tcat_b2s' ? (
              <div className="text-sm space-y-1">
                <p className="text-xs text-gray-400 mb-2">7-11 超商取貨</p>
                {order.store_name && (
                  <p className="font-medium">{order.store_name}</p>
                )}
                {order.store_id && (
                  <p className="text-gray-500">門市代號：{order.store_id}</p>
                )}
                {order.store_address && (
                  <p className="text-gray-500">{order.store_address}</p>
                )}
              </div>
            ) : (
              <div className="text-sm">
                <p className="text-xs text-gray-400 mb-2">黑貓宅配</p>
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

          {/* Status update */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">更新狀態</h2>

            {/* T-Cat shipping / tracking number */}
            {(order.status === 'processing' || order.status === 'paid') && (
              <div className="mb-4 space-y-3">
                {!order.tracking_number ? (
                  <button
                    type="button"
                    onClick={handleTcatShip}
                    disabled={tcatLoading}
                    className="w-full rounded-md bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {tcatLoading ? '產生中...' : '🚚 產生黑貓託運單'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTcatClear}
                    disabled={updating}
                    className="w-full rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    清除託運單號（重新產生）
                  </button>
                )}

                {tcatFileNo && (
                  <button
                    type="button"
                    onClick={handleTcatDownload}
                    disabled={tcatDownloading}
                    className="w-full rounded-md border border-amber-600 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                  >
                    {tcatDownloading ? '下載中...' : '📄 下載託運單 PDF'}
                  </button>
                )}

                {/* Picking list (撿貨明細) — only for 宅配 */}
                {order.shipping_method !== 'tcat_b2s' && (
                  <button
                    type="button"
                    onClick={handlePickingList}
                    disabled={pickingLoading}
                    className="w-full rounded-md border border-indigo-600 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {pickingLoading ? '產生中...' : '📋 產生撿貨明細託運單'}
                  </button>
                )}

                {pickingFileNo && (
                  <button
                    type="button"
                    onClick={handlePickingDownload}
                    disabled={pickingDownloading}
                    className="w-full rounded-md border border-indigo-400 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {pickingDownloading ? '下載中...' : '📄 下載撿貨明細 PDF'}
                  </button>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">物流追蹤編號</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="產生託運單後自動填入，或手動輸入"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            {allowedTransitions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allowedTransitions.map((newStatus) => (
                  <button
                    key={newStatus}
                    onClick={() => handleStatusUpdate(newStatus)}
                    disabled={updating}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {statusLabel[newStatus] || newStatus}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">此狀態無法更新</p>
            )}

            {message && (
              <p
                className={`mt-3 text-sm whitespace-pre-line ${
                  message.includes('成功') || message === '狀態已更新' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}
          </div>

          {/* Call T-Cat (呼叫取件) */}
          {order.tracking_number && ['processing', 'paid'].includes(order.status) && (
            <div className="rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-medium mb-4">呼叫黑貓取件</h2>
              <p className="text-sm text-gray-500 mb-3">
                預約黑貓司機到寄件地址收取包裹。
              </p>
              <button
                type="button"
                onClick={handleCallTcat}
                disabled={callLoading}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {callLoading ? '呼叫中...' : '📞 呼叫黑貓取件'}
              </button>
            </div>
          )}

          {/* Reverse logistics (退貨取件) */}
          {['shipped', 'completed', 'refunded'].includes(order.status) && (
            <div className="rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-medium mb-4">退貨取件（逆物流）</h2>

              {order.reverse_obt_number ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-500">逆物流單號：</span>
                    <a
                      href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(order.reverse_obt_number)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 hover:underline"
                    >
                      {order.reverse_obt_number}
                    </a>
                  </div>

                  {reverseStatus && (
                    <div className="text-sm bg-gray-50 rounded p-3 space-y-1">
                      <p>
                        <span className="text-gray-500">狀態：</span>
                        <span className={reverseStatus.Status === '01' ? 'text-amber-600' : 'text-green-600'}>
                          {reverseStatus.Status === '01' ? '未送出集貨（可修改/刪除）' : '已送出集貨'}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">取件日：</span>
                        {reverseStatus.TakeDate}
                      </p>
                      <p>
                        <span className="text-gray-500">寄件人：</span>
                        {reverseStatus.SenderName} {reverseStatus.SenderMobile}
                      </p>
                      <p>
                        <span className="text-gray-500">寄件地址：</span>
                        {reverseStatus.SenderAddress}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReverseQuery}
                      disabled={reverseLoading}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {reverseLoading ? '查詢中...' : '查詢狀態'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReverseDelete}
                      disabled={reverseLoading}
                      className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      刪除預約
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    建立退貨取件預約，黑貓將到客戶地址取件並寄回店家。
                  </p>
                  <div>
                    <label className="block text-sm font-medium mb-1">取件日期（D+1 ~ D+7）</label>
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleReverseAdd}
                    disabled={reverseLoading || !reverseTakeDate}
                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {reverseLoading ? '處理中...' : '建立退貨取件預約'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
