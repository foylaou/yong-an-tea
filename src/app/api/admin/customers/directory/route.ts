import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CustomerDirectoryRow } from '@/types/customer-directory';

async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return user;
}

/**
 * Merged customer/member directory: every `customers` row (POS/CRM records,
 * no login required) plus every website member (profiles.role='customer')
 * that doesn't have a linked customers row yet. Kept separate from
 * GET /api/admin/customers, which POS's CustomerPicker relies on for
 * pure walk-in-customer search and must not be polluted with
 * member-only rows.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '20', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const { data: customers, error: customersError } = await adminClient
    .from('customers')
    .select('id, profile_id, name, phone, email, category, discount_type, discount_value, created_at');

  if (customersError) {
    return NextResponse.json({ error: customersError.message }, { status: 500 });
  }

  const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'customer');

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

  let merged = [...customerRows, ...memberOnlyRows];

  if (search) {
    const q = search.toLowerCase();
    merged = merged.filter(
      (row) =>
        row.name?.toLowerCase().includes(q) ||
        row.phone?.toLowerCase().includes(q) ||
        row.email?.toLowerCase().includes(q)
    );
  }

  if (category === 'regular' || category === 'wholesale') {
    merged = merged.filter((row) => row.category === category);
  }

  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = merged.length;
  const from = (page - 1) * perPage;
  const rows = merged.slice(from, from + perPage);

  return NextResponse.json({ rows, total, page, perPage });
}
