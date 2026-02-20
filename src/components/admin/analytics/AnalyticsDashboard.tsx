'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import type { SalesAnalytics } from '@/types';

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
    { label: '總營收', value: `NT$ ${Math.round(data.total_revenue).toLocaleString()}`, color: 'text-indigo-600' },
    { label: '訂單數', value: data.total_orders.toLocaleString(), color: 'text-emerald-600' },
    { label: '平均客單價', value: `NT$ ${Math.round(data.avg_order_value).toLocaleString()}`, color: 'text-amber-600' },
    { label: '新客戶數', value: data.new_customers.toLocaleString(), color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${card.color}`}>{card.value}</p>
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
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-gray-900">每日營收趨勢</h3>
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
  );
}

function TopProductsTable({ data }: { data: SalesAnalytics['top_products'] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-gray-900">熱銷商品 TOP 10</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-2 font-medium text-gray-500">#</th>
            <th className="pb-2 font-medium text-gray-500">商品</th>
            <th className="pb-2 text-right font-medium text-gray-500">銷量</th>
            <th className="pb-2 text-right font-medium text-gray-500">營收</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-400">尚無資料</td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.name} className="border-b border-gray-50">
                <td className="py-2 text-gray-400">{idx + 1}</td>
                <td className="py-2 max-w-[200px] truncate">{item.name}</td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">NT$ {Math.round(item.revenue).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function OrderStatusChart({ data }: { data: SalesAnalytics['order_status_dist'] }) {
  const chartData = data.map((d) => ({
    name: ORDER_STATUS_LABEL[d.status] || d.status,
    value: d.count,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-gray-900">訂單狀態分佈</h3>
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-gray-400">尚無資料</p>
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
  );
}

function PaymentMethodChart({ data }: { data: SalesAnalytics['payment_method_dist'] }) {
  const chartData = data.map((d) => ({
    name: PAYMENT_METHOD_LABEL[d.payment_method] || d.payment_method,
    count: d.count,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-gray-900">付款方式分佈</h3>
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-gray-400">尚無資料</p>
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
  );
}

function CustomerStatsCard({ data }: { data: SalesAnalytics }) {
  const total = data.new_customers + data.returning_customers;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-gray-900">客戶統計</h3>
      <div className="flex gap-6">
        <div className="flex-1 text-center">
          <p className="text-3xl font-bold text-indigo-600">{data.new_customers}</p>
          <p className="mt-1 text-sm text-gray-500">新客戶</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-3xl font-bold text-emerald-600">{data.returning_customers}</p>
          <p className="mt-1 text-sm text-gray-500">回頭客</p>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-4">
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="bg-indigo-500"
              style={{ width: `${(data.new_customers / total) * 100}%` }}
            />
            <div
              className="bg-emerald-500"
              style={{ width: `${(data.returning_customers / total) * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>新客 {total > 0 ? Math.round((data.new_customers / total) * 100) : 0}%</span>
            <span>回頭客 {total > 0 ? Math.round((data.returning_customers / total) * 100) : 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export default function AnalyticsDashboard() {
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
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex flex-wrap items-center gap-3">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              preset === p.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        {preset === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
            <button
              onClick={handleCustomApply}
              className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white"
            >
              查詢
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">載入中...</div>
      ) : !data ? (
        <div className="py-20 text-center text-gray-400">無法載入資料</div>
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
  );
}
