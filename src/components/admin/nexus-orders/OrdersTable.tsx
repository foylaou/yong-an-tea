'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { OrderStatusBadge, statusLabel } from './OrderStatusBadge';
import type { Order } from '@/types/order';

interface OrdersTableProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const paymentMethodLabel: Record<string, string> = {
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
};

const ALL_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const columnHelper = createColumnHelper<Order>();

export function OrdersTable({ initialOrders, initialTotal, initialPage, perPage }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['pending', 'paid', 'processing', 'shipped']);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Batch selection — kept as plain state (not TanStack's row-selection
  // feature) so the batch-action logic below stays a straight port of the
  // existing (dashboard) OrderTable, which is what actually talks to the
  // T-Cat/status APIs.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState('');
  const [batchFileNo, setBatchFileNo] = useState<string | null>(null);
  const [batchFileNos, setBatchFileNos] = useState<string[]>([]);
  const [batchPickingLoading, setBatchPickingLoading] = useState(false);
  const [batchPickingFileNo, setBatchPickingFileNo] = useState<string | null>(null);
  const [callTcatLoading, setCallTcatLoading] = useState(false);

  async function fetchOrders(params: { page?: number; search?: string; status?: string[] }) {
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
      const next = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status];
      fetchOrders({ page: 1, status: next });
      return next;
    });
  };

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))));
  }, [orders]);

  const selectedOrders = orders.filter((o) => selected.has(o.id));

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
          const order = orders.find((o) => o.id === id);
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
    fetchOrders({});
    setBatchLoading(false);
  };

  const handleBatchTcatShip = async () => {
    const eligible = selectedOrders.filter((o) => !o.tracking_number && ['processing', 'paid'].includes(o.status));
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
        body: JSON.stringify({ orderIds: eligible.map((o) => o.id) }),
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

  const getBatchStatusOptions = () => {
    if (selected.size === 0) return [];
    const statuses = new Set(selectedOrders.map((o) => o.status));
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
  const hasShippableOrders = selectedOrders.some((o) => !o.tracking_number && ['processing', 'paid'].includes(o.status));
  const hasClearableOrders = selectedOrders.some((o) => o.tracking_number && !['shipped', 'completed'].includes(o.status));
  const hasPickableOrders = selectedOrders.some((o) => o.shipping_method !== 'tcat_b2s' && ['processing', 'paid'].includes(o.status));

  const handleBatchPickingList = async () => {
    const eligible = selectedOrders.filter((o) => o.shipping_method !== 'tcat_b2s' && ['processing', 'paid'].includes(o.status));
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
        body: JSON.stringify({ orderIds: eligible.map((o) => o.id) }),
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

  const handleBatchClearTracking = async () => {
    const eligible = selectedOrders.filter((o) => o.tracking_number && !['shipped', 'completed'].includes(o.status));
    if (eligible.length === 0) return;
    if (!confirm(`確定要清除 ${eligible.length} 筆訂單的託運單號嗎？`)) return;

    setBatchLoading(true);
    setBatchMessage('');
    let successCount = 0;
    let failCount = 0;
    for (const order of eligible) {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}/tcat-ship`, { method: 'DELETE' });
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

  const columns = useMemo<ColumnDef<Order, any>[]>(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={orders.length > 0 && selected.size === orders.length}
            onChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selected.has(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
          />
        ),
      }),
      columnHelper.accessor('order_number', { header: '訂單編號' }),
      columnHelper.display({
        id: 'customer',
        header: '客戶',
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1">
              {row.original.customer_name}
              {row.original.company_tax_id && (
                <span
                  className="badge badge-info badge-xs"
                  title={`${row.original.company_name} (${row.original.company_tax_id})`}
                >
                  公司
                </span>
              )}
            </div>
            <div className="text-base-content/50 text-xs">{row.original.customer_email}</div>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: '狀態',
        cell: ({ getValue }) => <OrderStatusBadge status={getValue()} />,
      }),
      columnHelper.accessor('payment_method', {
        header: '付款方式',
        cell: ({ getValue }) => paymentMethodLabel[getValue()] || getValue(),
      }),
      columnHelper.accessor('total', {
        header: '金額',
        cell: ({ getValue }) => `$${Number(getValue()).toLocaleString()}`,
      }),
      columnHelper.accessor('tracking_number', {
        header: '物流單號',
        cell: ({ getValue }) =>
          getValue() ? (
            <a
              href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(getValue()!)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary font-mono text-xs"
            >
              {getValue()}
            </a>
          ) : (
            <span className="text-base-content/30 text-xs">—</span>
          ),
      }),
      columnHelper.accessor('created_at', {
        header: '時間',
        cell: ({ getValue }) => <span className="text-base-content/60">{formatDate(getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <Link href={`/admin/orders/${row.original.id}`} className="link link-primary text-sm">
            查看
          </Link>
        ),
      }),
    ],
    [orders.length, selected, toggleSelect, toggleSelectAll],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

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
            className="input input-sm w-[220px] sm:w-[280px]"
          />
          <button type="submit" className="btn btn-sm btn-primary">
            搜尋
          </button>
        </form>

        <div className="dropdown">
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((v) => !v)}
            className="btn btn-sm btn-outline min-w-[140px] justify-between"
          >
            <span>{statusFilter.length === 0 || statusFilter.length === 7 ? '所有狀態' : `已選 ${statusFilter.length} 種`}</span>
            <span className="iconify lucide--chevron-down size-4" />
          </button>
          {statusDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
              <div className="bg-base-100 rounded-box shadow-base-content/10 absolute z-20 mt-1 w-52 p-1 shadow-lg">
                {[
                  { value: 'pending', label: '待付款' },
                  { value: 'paid', label: '已付款' },
                  { value: 'processing', label: '處理中' },
                  { value: 'shipped', label: '已出貨' },
                  { value: 'completed', label: '已完成' },
                  { value: 'cancelled', label: '已取消' },
                  { value: 'refunded', label: '已退款' },
                ].map((opt) => (
                  <label key={opt.value} className="hover:bg-base-200 flex cursor-pointer items-center gap-2 rounded-box px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={statusFilter.includes(opt.value)}
                      onChange={() => toggleStatusFilter(opt.value)}
                    />
                    <OrderStatusBadge status={opt.value} />
                  </label>
                ))}
                <div className="divider my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(ALL_STATUSES);
                    fetchOrders({ page: 1, status: ALL_STATUSES });
                  }}
                  className="hover:bg-base-200 rounded-box w-full px-3 py-1.5 text-left text-xs text-base-content/60"
                >
                  全選
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter([]);
                    fetchOrders({ page: 1, status: [] });
                  }}
                  className="hover:bg-base-200 rounded-box w-full px-3 py-1.5 text-left text-xs text-base-content/60"
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
        <div className="border-primary/30 bg-primary/5 mb-4 flex flex-wrap items-center gap-3 rounded-box border px-4 py-3">
          <span className="text-primary text-sm font-medium">已選取 {selected.size} 筆</span>

          {batchStatusOptions.map((s) => (
            <button key={s} onClick={() => handleBatchStatus(s)} disabled={batchLoading} className="btn btn-xs btn-outline">
              批量 → {statusLabel[s]}
            </button>
          ))}

          {hasShippableOrders && (
            <button onClick={handleBatchTcatShip} disabled={batchLoading} className="btn btn-xs btn-warning">
              {batchLoading ? '處理中...' : '🚚 批量產生託運單'}
            </button>
          )}

          {hasClearableOrders && (
            <button onClick={handleBatchClearTracking} disabled={batchLoading} className="btn btn-xs btn-outline btn-error">
              批量清除託運單號
            </button>
          )}

          <button
            onClick={() => {
              const ids = [...selected].join(',');
              window.open(`/admin/orders-print?ids=${ids}`, '_blank');
            }}
            className="btn btn-xs btn-outline"
          >
            列印撿貨明細
          </button>

          {hasPickableOrders && (
            <button onClick={handleBatchPickingList} disabled={batchPickingLoading} className="btn btn-xs btn-secondary">
              {batchPickingLoading ? '處理中...' : '📋 批量撿貨明細託運單'}
            </button>
          )}

          {hasShippableOrders && (
            <button onClick={handleCallTcat} disabled={callTcatLoading} className="btn btn-xs btn-success">
              {callTcatLoading ? '呼叫中...' : '📞 呼叫黑貓取件'}
            </button>
          )}

          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-base-content/50 hover:text-base-content">
            取消選取
          </button>
        </div>
      )}

      {/* Batch download bars */}
      {batchFileNos.length > 0 && (
        <div className="border-warning/30 bg-warning/10 mb-4 flex flex-wrap items-center gap-3 rounded-box border px-4 py-3">
          <span className="text-sm">託運單已產生</span>
          {batchFileNos.map((fNo, idx) => (
            <button key={fNo} onClick={() => handleBatchDownload(fNo)} disabled={batchLoading} className="btn btn-xs btn-warning">
              {batchLoading ? '下載中...' : batchFileNos.length === 1 ? '下載託運單 PDF' : `下載 PDF ${idx + 1}`}
            </button>
          ))}
          <button
            onClick={() => {
              setBatchFileNo(null);
              setBatchFileNos([]);
            }}
            className="ml-auto text-xs text-base-content/40 hover:text-base-content"
          >
            ✕
          </button>
        </div>
      )}

      {batchPickingFileNo && (
        <div className="border-secondary/30 bg-secondary/10 mb-4 flex flex-wrap items-center gap-3 rounded-box border px-4 py-3">
          <span className="text-sm">撿貨明細已產生</span>
          <button onClick={handleBatchPickingDownload} disabled={batchPickingLoading} className="btn btn-xs btn-secondary">
            {batchPickingLoading ? '下載中...' : '下載撿貨明細 PDF'}
          </button>
          <button onClick={() => setBatchPickingFileNo(null)} className="ml-auto text-xs text-base-content/40 hover:text-base-content">
            ✕
          </button>
        </div>
      )}

      {batchMessage && (
        <div className="bg-base-200 mb-4 rounded-box px-4 py-3 text-sm whitespace-pre-line">
          {batchMessage}
          <button onClick={() => setBatchMessage('')} className="ml-3 text-xs text-base-content/40 hover:text-base-content">
            ✕
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-base-content/40 py-8 text-center">
                  載入中...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-base-content/40 py-8 text-center">
                  尚無訂單
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={selected.has(row.original.id) ? 'bg-primary/5' : ''}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="text-base-content/40 py-8 text-center">載入中...</div>
        ) : orders.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">尚無訂單</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`card card-border ${selected.has(order.id) ? 'border-primary' : ''}`}>
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selected.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                    />
                    <span className="font-mono text-sm">{order.order_number}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-sm">
                  {order.customer_name}
                  {order.company_tax_id && <span className="badge badge-info badge-xs ml-1">公司</span>}
                  <span className="text-base-content/50 block text-xs">{order.customer_email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/60">{paymentMethodLabel[order.payment_method] || order.payment_method}</span>
                  <span className="font-medium">${Number(order.total).toLocaleString()}</span>
                </div>
                {order.tracking_number && (
                  <a
                    href={`https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(order.tracking_number)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary font-mono text-xs"
                  >
                    {order.tracking_number}
                  </a>
                )}
                <div className="text-base-content/50 text-xs">{formatDate(order.created_at)}</div>
                <div className="card-actions mt-1 justify-end">
                  <Link href={`/admin/orders/${order.id}`} className="btn btn-xs btn-outline">
                    查看
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={(p) => fetchOrders({ page: p })} />
    </div>
  );
}
