import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderDetail } from '@/components/admin/nexus-orders/OrderDetail';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
