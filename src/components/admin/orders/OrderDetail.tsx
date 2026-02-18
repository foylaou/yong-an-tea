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

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

export default function AdminOrderDetail({ order: initialOrder }: AdminOrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [message, setMessage] = useState('');

  const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];

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

  const address = order.shipping_address || {};

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          訂單 {order.order_number}
        </h1>
        <Link
          href="/admin/orders"
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          &larr; 返回訂單列表
        </Link>
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
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
              )}
            </div>
            {order.note && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <span className="text-gray-500">備註：</span>
                {order.note}
              </div>
            )}
          </div>

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

          {/* Shipping address */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">寄送地址</h2>
            <p className="text-sm">
              {address.postal_code && `${address.postal_code} `}
              {address.city}
              {address.district}
              {address.address_line1}
              {address.address_line2 && ` ${address.address_line2}`}
            </p>
          </div>

          {/* Status update */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">更新狀態</h2>

            {/* Tracking number input for shipping */}
            {(order.status === 'processing' || order.status === 'paid') && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">物流追蹤編號</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="輸入追蹤編號"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
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
                className={`mt-3 text-sm ${
                  message === '狀態已更新' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
