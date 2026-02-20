'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableProps {
  initialOrders: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const paymentMethodLabel: Record<string, string> = {
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
};

export default function OrderTable({
  initialOrders,
  initialTotal,
  initialPage,
  perPage,
}: OrderTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchOrders(params: {
    page?: number;
    search?: string;
    status?: string;
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const st = params.status ?? statusFilter;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
      ...(st && { status: st }),
    });

    try {
      const res = await fetch(`/api/admin/orders?${qs}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders({ page: 1 });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    fetchOrders({ page: 1, status: newStatus });
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders({ page: newPage });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="搜尋訂單編號、客戶姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none w-[280px]"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            搜尋
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        >
          <option value="">所有狀態</option>
          <option value="pending">待付款</option>
          <option value="paid">已付款</option>
          <option value="processing">處理中</option>
          <option value="shipped">已出貨</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="refunded">已退款</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                訂單編號
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                客戶
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                狀態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                付款方式
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                金額
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                時間
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  載入中...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  尚無訂單
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{order.order_number}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {order.customer_name}
                      {order.company_tax_id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded" title={`${order.company_name} (${order.company_tax_id})`}>
                          公司
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{order.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {paymentMethodLabel[order.payment_method] || order.payment_method}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    ${Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
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
      <div className="mt-4">
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
