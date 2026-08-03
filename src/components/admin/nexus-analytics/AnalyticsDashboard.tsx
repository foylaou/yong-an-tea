'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import type { SalesAnalytics } from '@/types';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDateRange(preset: string): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case '7d':
      start.setDate(end.getDate() - 6);
      break;
    case '30d':
      start.setDate(end.getDate() - 29);
      break;
    case '90d':
      start.setDate(end.getDate() - 89);
      break;
    default:
      start.setDate(end.getDate() - 29);
  }
  return { start: formatDate(start), end: formatDate(end) };
}

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipped: '出貨中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function KPICards({ data }: { data: SalesAnalytics }) {
  const cards = [
    { label: '總營收', value: `NT$ ${Math.round(data.total_revenue).toLocaleString()}`, color: 'text-primary' },
    { label: '訂單數', value: data.total_orders.toLocaleString(), color: 'text-success' },
    { label: '平均客單價', value: `NT$ ${Math.round(data.avg_order_value).toLocaleString()}`, color: 'text-warning' },
    { label: '新客戶數', value: data.new_customers.toLocaleString(), color: 'text-secondary' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="card card-border bg-base-100">
          <div className="card-body p-5">
            <p className="text-base-content/60 text-sm font-medium">{card.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ data }: { data: SalesAnalytics['daily_revenue'] }) {
  const chartData = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-5">
        <h3 className="card-title text-base">每日營收趨勢</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [`NT$ ${value.toLocaleString()}`, '營收']}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopProductsTable({ data }: { data: SalesAnalytics['top_products'] }) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-5">
        <h3 className="card-title text-base">熱銷商品 TOP 10</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>商品</th>
                <th className="text-right">銷量</th>
                <th className="text-right">營收</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-base-content/40 py-4 text-center">
                    尚無資料
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.name}>
                    <td className="text-base-content/40">{idx + 1}</td>
                    <td className="max-w-[200px] truncate">{item.name}</td>
                    <td className="text-right">{item.qty}</td>
                    <td className="text-right">NT$ {Math.round(item.revenue).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderStatusChart({ data }: { data: SalesAnalytics['order_status_dist'] }) {
  const chartData = data.map((d) => ({
    name: ORDER_STATUS_LABEL[d.status] || d.status,
    value: d.count,
  }));

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-5">
        <h3 className="card-title text-base">訂單狀態分佈</h3>
        {chartData.length === 0 ? (
          <p className="text-base-content/40 py-8 text-center">尚無資料</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                fontSize={12}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function PaymentMethodChart({ data }: { data: SalesAnalytics['payment_method_dist'] }) {
  const chartData = data.map((d) => ({
    name: PAYMENT_METHOD_LABEL[d.payment_method] || d.payment_method,
    count: d.count,
  }));

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-5">
        <h3 className="card-title text-base">付款方式分佈</h3>
        {chartData.length === 0 ? (
          <p className="text-base-content/40 py-8 text-center">尚無資料</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function CustomerStatsCard({ data }: { data: SalesAnalytics }) {
  const total = data.new_customers + data.returning_customers;

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-5">
        <h3 className="card-title text-base">客戶統計</h3>
        <div className="flex gap-6">
          <div className="flex-1 text-center">
            <p className="text-primary text-3xl font-bold">{data.new_customers}</p>
            <p className="text-base-content/60 mt-1 text-sm">新客戶</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-success text-3xl font-bold">{data.returning_customers}</p>
            <p className="text-base-content/60 mt-1 text-sm">回頭客</p>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="bg-base-200 flex h-3 overflow-hidden rounded-full">
              <div className="bg-primary" style={{ width: `${(data.new_customers / total) * 100}%` }} />
              <div className="bg-success" style={{ width: `${(data.returning_customers / total) * 100}%` }} />
            </div>
            <div className="text-base-content/40 mt-1 flex justify-between text-xs">
              <span>新客 {total > 0 ? Math.round((data.new_customers / total) * 100) : 0}%</span>
              <span>回頭客 {total > 0 ? Math.round((data.returning_customers / total) * 100) : 0}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export function AnalyticsDashboard() {
  const [preset, setPreset] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [data, setData] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?start=${start}&end=${end}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (preset !== 'custom') {
      const { start, end } = getDateRange(preset);
      fetchData(start, end);
    }
  }, [preset, fetchData]);

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      fetchData(customStart, customEnd);
    }
  };

  const presets = [
    { value: '7d', label: '近 7 天' },
    { value: '30d', label: '近 30 天' },
    { value: '90d', label: '近 90 天' },
    { value: 'custom', label: '自訂' },
  ];

  return (
    <div>
      <PageTitle title="銷售分析" />

      <div className="space-y-6">
        {/* Date range selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="join">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`join-item btn btn-sm ${preset === p.value ? 'btn-active btn-primary' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input input-sm" />
              <span className="text-base-content/40">~</span>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="input input-sm" />
              <button onClick={handleCustomApply} className="btn btn-sm btn-primary">
                查詢
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-base-content/40 py-20 text-center">載入中...</div>
        ) : !data ? (
          <div className="text-base-content/40 py-20 text-center">無法載入資料</div>
        ) : (
          <>
            <KPICards data={data} />
            <RevenueChart data={data.daily_revenue} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TopProductsTable data={data.top_products} />
              <OrderStatusChart data={data.order_status_dist} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PaymentMethodChart data={data.payment_method_dist} />
              <CustomerStatsCard data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
