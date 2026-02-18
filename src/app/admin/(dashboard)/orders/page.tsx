import { createClient } from '@/lib/supabase/server';
import OrderTable from '@/components/admin/orders/OrderTable';

const PER_PAGE = 20;

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">訂單管理</h1>
      </div>
      <OrderTable
        initialOrders={orders || []}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
