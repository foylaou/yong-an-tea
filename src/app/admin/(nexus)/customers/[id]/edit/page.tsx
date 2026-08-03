import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CustomerForm } from '@/components/admin/nexus-customers/CustomerForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase.from('customers').select('*').eq('id', id).single();

  if (error || !customer) {
    notFound();
  }

  const orderFilter = customer.profile_id
    ? `walk_in_customer_id.eq.${id},customer_id.eq.${customer.profile_id}`
    : `walk_in_customer_id.eq.${id}`;

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, payment_status, created_at')
    .or(orderFilter)
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageTitle title={`編輯客戶：${customer.name}`} />
      <CustomerForm initialData={customer} isEdit orderHistory={orders || []} />
    </div>
  );
}
