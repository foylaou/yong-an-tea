import { createClient } from '@/lib/supabase/server';
import { CustomerTable } from '@/components/admin/nexus-customers/CustomerTable';

const PER_PAGE = 20;

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return <CustomerTable initialCustomers={customers || []} initialTotal={count || 0} initialPage={1} perPage={PER_PAGE} />;
}
