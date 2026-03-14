import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import PrintablePickingList from '@/components/admin/orders/PrintablePickingList';

export default async function OrdersPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  const { ids } = await searchParams;
  if (!ids) redirect('/admin/orders');

  const orderIds = ids.split(',').filter(Boolean);
  if (orderIds.length === 0) redirect('/admin/orders');

  // Fetch orders with items
  const adminDb = createAdminClient();
  const { data: orders, error } = await adminDb
    .from('orders')
    .select('*, order_items(*)')
    .in('id', orderIds)
    .order('created_at', { ascending: false });

  if (error || !orders || orders.length === 0) {
    redirect('/admin/orders');
  }

  // Fetch site name for header
  const { data: siteNameRow } = await adminDb
    .from('site_settings')
    .select('value')
    .eq('key', 'site_name')
    .single();

  const siteName = (siteNameRow?.value as string) || '永安茶園';

  return <PrintablePickingList orders={orders} siteName={siteName} />;
}
