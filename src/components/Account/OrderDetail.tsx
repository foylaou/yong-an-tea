'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { Order, OrderItem } from '../../types/order';
import { formatPrice } from '../../store/settings/settings-slice';

interface OrderDetailProps {
  order: Order & { order_items: OrderItem[] };
}

const CUSTOMER_CANCELLABLE = ['pending', 'paid'];

const statusLabel: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-red-100 text-red-800',
};

const paymentMethodLabel: Record<string, string> = {
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
};

function OrderDetail({ order: initialOrder }: OrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const router = useRouter();

  const canCancel = CUSTOMER_CANCELLABLE.includes(order.status);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError('請填寫取消原因');
      return;
    }
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: cancelReason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder({ ...order, ...data.order, order_items: order.order_items });
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        setCancelError(data.error || '取消失敗');
      }
    } catch {
      setCancelError('網路錯誤');
    } finally {
      setCancelling(false);
    }
  };

  const timeline = [
    { label: '下單時間', time: order.created_at },
    { label: '付款時間', time: order.paid_at },
    { label: '出貨時間', time: order.shipped_at },
    { label: '完成時間', time: order.completed_at },
  ].filter((t) => t.time);

  return (
    <div>
      <div className="flex items-center justify-between mb-[25px]">
        <h2 className="text-[20px] font-medium">訂單詳情</h2>
        <Link
          href="/account/orders"
          className="text-sm text-gray-500 hover:text-black"
        >
          &larr; 返回訂單列表
        </Link>
      </div>

      {/* Order header */}
      <div className="bg-[#f6f6f6] border border-[#e8e8e8] p-5 rounded mb-6">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">訂單編號：</span>
            <span className="font-mono font-medium">{order.order_number}</span>
          </div>
          <div>
            <span className="text-gray-500">狀態：</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                statusColor[order.status] || 'bg-gray-100'
              }`}
            >
              {statusLabel[order.status] || order.status}
            </span>
          </div>
          <div>
            <span className="text-gray-500">付款方式：</span>
            <span>{paymentMethodLabel[order.payment_method] || order.payment_method}</span>
          </div>
          {order.tracking_number && (
            <div>
              <span className="text-gray-500">物流編號：</span>
              <span className="font-mono">{order.tracking_number}</span>
            </div>
          )}
        </div>
        {canCancel && (
          <div className="mt-4 pt-4 border-t border-[#e8e8e8]">
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-md border border-red-300 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              取消訂單
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 text-gray-600">時間軸</h3>
          <div className="flex flex-wrap gap-4">
            {timeline.map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-500">{t.label}：</span>
                <span>{new Date(t.time!).toLocaleString('zh-TW')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping info */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-gray-600">收件資訊</h3>
        <div className="text-sm space-y-1">
          <p>
            {order.customer_name} / {order.customer_phone}
          </p>
          <p>{order.customer_email}</p>
          {order.shipping_address && (
            <p>
              {order.shipping_address.postal_code && `${order.shipping_address.postal_code} `}
              {order.shipping_address.city}
              {order.shipping_address.district}
              {order.shipping_address.address_line1}
              {order.shipping_address.address_line2 && ` ${order.shipping_address.address_line2}`}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-gray-600">商品明細</h3>
        <table className="w-full text-sm">
          <thead className="bg-[#f4f5f7]">
            <tr>
              <th className="py-3 px-4 text-left font-medium">商品</th>
              <th className="py-3 px-4 text-center font-medium">單價</th>
              <th className="py-3 px-4 text-center font-medium">數量</th>
              <th className="py-3 px-4 text-right font-medium">小計</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item) => (
              <tr key={item.id} className="border-b border-[#e8e8e8]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <span>{item.product_title}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">{formatPrice(Number(item.price))}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatPrice(Number(item.subtotal))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-b border-[#cdcdcd]">
              <td colSpan={3} className="py-3 px-4 font-medium text-right">小計</td>
              <td className="py-3 px-4 text-right">{formatPrice(Number(order.subtotal))}</td>
            </tr>
            <tr className="border-b border-[#cdcdcd]">
              <td colSpan={3} className="py-3 px-4 font-medium text-right">運費</td>
              <td className="py-3 px-4 text-right">
                {Number(order.shipping_fee) === 0 ? (
                  <span className="text-green-600">免運費</span>
                ) : (
                  formatPrice(Number(order.shipping_fee))
                )}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="py-3 px-4 font-bold text-right text-lg">合計</td>
              <td className="py-3 px-4 text-right font-bold text-lg">
                {formatPrice(Number(order.total))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.note && (
        <div className="mt-6 p-4 bg-[#f6f6f6] rounded text-sm">
          <span className="text-gray-500">備註：</span>
          {order.note}
        </div>
      )}

      {order.status === 'cancelled' && order.cancel_reason && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-sm">
          <p className="font-medium text-red-700 mb-1">取消原因</p>
          <p className="text-red-600">{order.cancel_reason}</p>
          {order.cancelled_at && (
            <p className="text-xs text-red-400 mt-1">
              取消時間：{new Date(order.cancelled_at).toLocaleString('zh-TW')}
            </p>
          )}
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">取消訂單</h3>
            <p className="text-sm text-gray-500 mb-3">
              請告訴我們取消的原因，以便我們改善服務。
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="請輸入取消原因..."
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
            {cancelError && (
              <p className="text-sm text-red-500 mt-2">{cancelError}</p>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelError('');
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                返回
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? '處理中...' : '確認取消'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
