'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Order } from '../../types/order';
import { formatPrice } from '../../store/settings/settings-slice';

interface OrderListProps {
  initialOrders: Order[];
  initialTotal: number;
  perPage: number;
}

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

function OrderList({ initialOrders, initialTotal, perPage }: OrderListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / perPage);

  const fetchPage = async (newPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${newPage}&perPage=${perPage}`);
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
      setPage(newPage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0 && page === 1) {
    return (
      <div>
        <h2 className="text-[20px] font-medium mb-[25px]">訂單記錄</h2>
        <div className="text-center py-[60px] text-gray-400">
          <p className="text-lg mb-2">尚無訂單記錄</p>
          <Link
            href="/products/left-sidebar"
            className="text-sm text-black underline hover:no-underline"
          >
            前往購物
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[20px] font-medium mb-[25px]">訂單記錄</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f4f5f7] text-left">
            <tr>
              <th className="py-3 px-4 font-medium">訂單編號</th>
              <th className="py-3 px-4 font-medium">日期</th>
              <th className="py-3 px-4 font-medium">狀態</th>
              <th className="py-3 px-4 font-medium text-right">金額</th>
              <th className="py-3 px-4 font-medium text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  載入中...
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[#e8e8e8] hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusColor[order.status] || 'bg-gray-100'
                      }`}
                    >
                      {statusLabel[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{formatPrice(Number(order.total))}</td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm text-black underline hover:no-underline"
                    >
                      查看
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-30"
          >
            上一頁
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-30"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderList;
