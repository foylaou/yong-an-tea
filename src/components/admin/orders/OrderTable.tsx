'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import OrderStatusBadge, { statusLabel } from './OrderStatusBadge';

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
  const [statusFilter, setStatusFilter] = useState<string[]>(['pending', 'paid', 'processing', 'shipped']);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Batch selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState('');
  const [batchFileNo, setBatchFileNo] = useState<string | null>(null);
  const [batchFileNos, setBatchFileNos] = useState<string[]>([]);

  async function fetchOrders(params: {
    page?: number;
    search?: string;
    status?: string[];
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const st = params.status ?? statusFilter;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
    });
    if (st.length > 0 && st.length < 7) {
      qs.set('status', st.join(','));
    }

    try {
      const res = await fetch(`/api/admin/orders?${qs}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPage(p);
      setSelected(new Set());
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

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) => {
      const next = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];
      fetchOrders({ page: 1, status: next });
      return next;
    });
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

  // --- Batch selection ---
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o: any) => o.id)));
    }
  }, [orders, selected.size]);

  const selectedOrders = orders.filter((o: any) => selected.has(o.id));

  // --- Batch status update ---
  const handleBatchStatus = async (newStatus: string) => {
    const ids = [...selected];
    const label = statusLabel[newStatus] || newStatus;
    if (!confirm(`確定要將 ${ids.length} 筆訂單更新為「${label}」嗎？`)) return;

    setBatchLoading(true);
    setBatchMessage('');

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
          const data = await res.json();
          const order = orders.find((o: any) => o.id === id);
          errors.push(`${order?.order_number}: ${data.error}`);
        }
      } catch {
        failCount++;
      }
    }

    let msg = `批量更新完成：${successCount} 筆成功`;
    if (failCount > 0) msg += `，${failCount} 筆失敗`;
    if (errors.length > 0) msg += `\n${errors.slice(0, 3).join('\n')}`;
    setBatchMessage(msg);

    // Refresh list
    fetchOrders({});
    setBatchLoading(false);
  };

  // --- Batch T-Cat ship (single API call for all orders) ---
  const handleBatchTcatShip = async () => {
    const eligible = selectedOrders.filter(
      (o: any) => !o.tracking_number && ['processing', 'paid'].includes(o.status),
    );
    if (eligible.length === 0) {
      setBatchMessage('所選訂單中沒有可產生託運單的訂單（需為處理中/已付款且無託運單號）');
      return;
    }
    if (!confirm(`將為 ${eligible.length} 筆訂單批量產生黑貓託運單，確定嗎？`)) return;

    setBatchLoading(true);
    setBatchMessage('');

    try {
      const res = await fetch('/api/admin/orders/batch-tcat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: eligible.map((o: any) => o.id) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBatchFileNo(data.fileNo);
        setBatchFileNos(data.fileNos || []);
        let msg = `批量產生託運單完成：${data.count} 筆成功，可立即下載 PDF`;
        if (data.warnings?.length) msg += `\n${data.warnings.join('\n')}`;
        setBatchMessage(msg);
        fetchOrders({});
      } else {
        setBatchMessage(data.error || '批量產生託運單失敗');
      }
    } catch {
      setBatchMessage('網路錯誤');
    } finally {
      setBatchLoading(false);
    }
  };

  // --- Batch download PDF ---
  const handleBatchDownload = async (fileNo?: string) => {
    const fNo = fileNo || batchFileNo;
    if (!fNo) return;
    setBatchLoading(true);
    try {
      const res = await fetch('/api/admin/orders/batch-tcat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNo: fNo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '下載失敗' }));
        setBatchMessage(err.error || '下載失敗');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tcat-batch-${fNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setBatchMessage('下載失敗');
    } finally {
      setBatchLoading(false);
    }
  };

  // Available batch status transitions based on selected orders
  const getBatchStatusOptions = () => {
    if (selected.size === 0) return [];
    const statuses = new Set(selectedOrders.map((o: any) => o.status));
    // Only show transitions that all selected orders can do
    if (statuses.size === 1) {
      const status = [...statuses][0];
      const map: Record<string, string[]> = {
        pending: ['paid', 'processing', 'cancelled'],
        paid: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['completed'],
      };
      return map[status] || [];
    }
    return [];
  };

  const batchStatusOptions = getBatchStatusOptions();
  const hasShippableOrders = selectedOrders.some(
    (o: any) => !o.tracking_number && ['processing', 'paid'].includes(o.status),
  );
  const hasClearableOrders = selectedOrders.some(
    (o: any) => o.tracking_number && !['shipped', 'completed'].includes(o.status),
  );
  const hasPickableOrders = selectedOrders.some(
    (o: any) => o.shipping_method !== 'tcat_b2s' && ['processing', 'paid'].includes(o.status),
  );

  // --- Batch picking list ---
  const [batchPickingLoading, setBatchPickingLoading] = useState(false);
  const [batchPickingFileNo, setBatchPickingFileNo] = useState<string | null>(null);

  const handleBatchPickingList = async () => {
    const eligible = selectedOrders.filter(
      (o: any) => o.shipping_method !== 'tcat_b2s' && ['processing', 'paid'].includes(o.status),
    );
    if (eligible.length === 0) {
      setBatchMessage('所選訂單中沒有可產生撿貨明細的宅配訂單');
      return;
    }
    if (!confirm(`將為 ${eligible.length} 筆宅配訂單批量產生撿貨明細託運單，確定嗎？`)) return;

    setBatchPickingLoading(true);
    setBatchMessage('');

    try {
      const res = await fetch('/api/admin/orders/batch-tcat-picking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: eligible.map((o: any) => o.id) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBatchPickingFileNo(data.fileNo);
        let msg = `批量撿貨明細完成：${data.count} 筆成功`;
        if (data.warnings?.length) msg += `\n${data.warnings.join('\n')}`;
        setBatchMessage(msg);
        fetchOrders({});
      } else {
        setBatchMessage(data.error || '批量產生撿貨明細失敗');
      }
    } catch {
      setBatchMessage('網路錯誤');
    } finally {
      setBatchPickingLoading(false);
    }
  };

  const handleBatchPickingDownload = async () => {
    if (!batchPickingFileNo) return;
    setBatchPickingLoading(true);
    try {
      const res = await fetch('/api/admin/orders/batch-tcat-picking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNo: batchPickingFileNo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '下載失敗' }));
        setBatchMessage(err.error || '下載失敗');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tcat-picking-batch-${batchPickingFileNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setBatchMessage('下載失敗');
    } finally {
      setBatchPickingLoading(false);
    }
  };

  // --- Call T-Cat (batch) ---
  const [callTcatLoading, setCallTcatLoading] = useState(false);

  const handleCallTcat = async () => {
    if (!confirm('確定要呼叫黑貓取件嗎？司機將前往寄件地址收取包裹。')) return;
    setCallTcatLoading(true);
    setBatchMessage('');
    try {
      const res = await fetch('/api/admin/tcat-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ normalQuantity: selected.size }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBatchMessage(`已成功呼叫黑貓取件（${selected.size} 件包裹）`);
      } else {
        setBatchMessage(data.error || '呼叫黑貓取件失敗');
      }
    } catch {
      setBatchMessage('網路錯誤');
    } finally {
      setCallTcatLoading(false);
    }
  };

  // --- Batch clear tracking numbers ---
  const handleBatchClearTracking = async () => {
    const eligible = selectedOrders.filter(
      (o: any) => o.tracking_number && !['shipped', 'completed'].includes(o.status),
    );
    if (eligible.length === 0) return;
    if (!confirm(`確定要清除 ${eligible.length} 筆訂單的託運單號嗎？`)) return;

    setBatchLoading(true);
    setBatchMessage('');
    let successCount = 0;
    let failCount = 0;

    for (const order of eligible) {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}/tcat-ship`, {
          method: 'DELETE',
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    let msg = `批量清除完成：${successCount} 筆成功`;
    if (failCount > 0) msg += `，${failCount} 筆失敗`;
    setBatchMessage(msg);
    fetchOrders({});
    setBatchLoading(false);
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((v) => !v)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none flex items-center gap-2 min-w-[140px]"
          >
            <span>
              {statusFilter.length === 0 || statusFilter.length === 7
                ? '所有狀態'
                : `已選 ${statusFilter.length} 種`}
            </span>
            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {statusDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
              <div className="absolute z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg py-1">
                {([
                  { value: 'pending', label: '待付款' },
                  { value: 'paid', label: '已付款' },
                  { value: 'processing', label: '處理中' },
                  { value: 'shipped', label: '已出貨' },
                  { value: 'completed', label: '已完成' },
                  { value: 'cancelled', label: '已取消' },
                  { value: 'refunded', label: '已退款' },
                ]).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(opt.value)}
                      onChange={() => toggleStatusFilter(opt.value)}
                      className="rounded border-gray-300"
                    />
                    <OrderStatusBadge status={opt.value} />
                  </label>
                ))}
                <hr className="my-1 border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    const all = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'];
                    setStatusFilter(all);
                    fetchOrders({ page: 1, status: all });
                  }}
                  className="w-full px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 text-left"
                >
                  全選
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter([]);
                    fetchOrders({ page: 1, status: [] });
                  }}
                  className="w-full px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 text-left"
                >
                  清除全部
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Batch actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-800">
            已選取 {selected.size} 筆
          </span>
          <span className="text-gray-300">|</span>

          {batchStatusOptions.length > 0 && (
            <>
              {batchStatusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleBatchStatus(s)}
                  disabled={batchLoading}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                >
                  批量 → {statusLabel[s]}
                </button>
              ))}
            </>
          )}

          {hasShippableOrders && (
            <button
              onClick={handleBatchTcatShip}
              disabled={batchLoading}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {batchLoading ? '處理中...' : '🚚 批量產生託運單'}
            </button>
          )}

          {hasClearableOrders && (
            <button
              onClick={handleBatchClearTracking}
              disabled={batchLoading}
              className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              批量清除託運單號
            </button>
          )}

          <button
            onClick={() => {
              const ids = [...selected].join(',');
              window.open(`/admin/orders-print?ids=${ids}`, '_blank');
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            列印撿貨明細
          </button>

          {hasPickableOrders && (
            <button
              onClick={handleBatchPickingList}
              disabled={batchPickingLoading}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {batchPickingLoading ? '處理中...' : '📋 批量撿貨明細託運單'}
            </button>
          )}

          {hasShippableOrders && (
            <button
              onClick={handleCallTcat}
              disabled={callTcatLoading}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
              {callTcatLoading ? '呼叫中...' : '📞 呼叫黑貓取件'}
            </button>
          )}

          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700"
          >
            取消選取
          </button>
        </div>
      )}

      {/* Batch download bar */}
      {batchFileNos.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-sm text-amber-800">託運單已產生</span>
          {batchFileNos.map((fNo, idx) => (
            <button
              key={fNo}
              onClick={() => handleBatchDownload(fNo)}
              disabled={batchLoading}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {batchLoading ? '下載中...' : batchFileNos.length === 1 ? '下載託運單 PDF' : `下載 PDF ${idx + 1}`}
            </button>
          ))}
          <button
            onClick={() => { setBatchFileNo(null); setBatchFileNos([]); }}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Batch picking download bar */}
      {batchPickingFileNo && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
          <span className="text-sm text-indigo-800">撿貨明細已產生</span>
          <button
            onClick={handleBatchPickingDownload}
            disabled={batchPickingLoading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {batchPickingLoading ? '下載中...' : '下載撿貨明細 PDF'}
          </button>
          <button
            onClick={() => setBatchPickingFileNo(null)}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Batch message */}
      {batchMessage && (
        <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm whitespace-pre-line">
          {batchMessage}
          <button
            onClick={() => setBatchMessage('')}
            className="ml-3 text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selected.size === orders.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
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
                物流單號
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
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  載入中...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  尚無訂單
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr
                  key={order.id}
                  className={`hover:bg-gray-50 ${selected.has(order.id) ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
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
                  <td className="px-4 py-3 text-sm">
                    {order.tracking_number ? (
                      <a
                        href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(order.tracking_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {order.tracking_number}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
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
