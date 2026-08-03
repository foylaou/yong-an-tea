import { createClient } from '@/lib/supabase/server';
import { OrdersTable } from '@/components/admin/nexus-orders/OrdersTable';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import type { Order } from '@/types/order';

const PER_PAGE = 20;

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .in('status', ['pending', 'paid', 'processing', 'shipped'])
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return (
    <div>
      <PageTitle title="訂單管理" />
      <OrdersTable
        initialOrders={(orders as Order[]) || []}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
