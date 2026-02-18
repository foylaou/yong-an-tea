import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AdminOrderDetail from '@/components/admin/orders/OrderDetail';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  return <AdminOrderDetail order={order} />;
}
