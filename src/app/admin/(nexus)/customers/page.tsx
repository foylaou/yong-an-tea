import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerTable } from '@/components/admin/nexus-customers/CustomerTable';
import type { CustomerDirectoryRow } from '@/types/customer-directory';

const PER_PAGE = 20;

export default async function CustomersPage() {
  const adminClient = createAdminClient();

  const [{ data: customers }, { data: { users: authUsers } }, { data: profiles }] = await Promise.all([
    adminClient
      .from('customers')
      .select('id, profile_id, name, phone, email, category, discount_type, discount_value, created_at'),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    adminClient.from('profiles').select('id, full_name, role').eq('role', 'customer'),
  ]);

  const authUserMap = new Map((authUsers || []).map((u: any) => [u.id, u]));
  const linkedProfileIds = new Set((customers || []).map((c: any) => c.profile_id).filter(Boolean));

  const customerRows: CustomerDirectoryRow[] = (customers || []).map((c: any) => ({
    id: `customer:${c.id}`,
    source: 'customer',
    customer_id: c.id,
    profile_id: c.profile_id,
    has_login: !!c.profile_id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    category: c.category,
    discount_type: c.discount_type,
    discount_value: c.discount_value,
    created_at: c.created_at,
  }));

  const memberOnlyRows: CustomerDirectoryRow[] = (profiles || [])
    .filter((p: any) => !linkedProfileIds.has(p.id))
    .map((p: any) => {
      const authUser = authUserMap.get(p.id);
      return {
        id: `member:${p.id}`,
        source: 'member_only' as const,
        customer_id: null,
        profile_id: p.id,
        has_login: true,
        name: p.full_name || '',
        phone: null,
        email: authUser?.email || null,
        category: 'regular' as const,
        discount_type: null,
        discount_value: 0,
        created_at: authUser?.created_at || new Date(0).toISOString(),
      };
    });

  const merged = [...customerRows, ...memberOnlyRows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <CustomerTable
      initialRows={merged.slice(0, PER_PAGE)}
      initialTotal={merged.length}
      initialPage={1}
      perPage={PER_PAGE}
    />
  );
}
