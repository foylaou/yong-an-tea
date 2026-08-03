import { createClient } from '@/lib/supabase/server';
import { CouponTable } from '@/components/admin/nexus-coupons/CouponTable';

const PER_PAGE = 20;

export default async function CouponsPage() {
  const supabase = await createClient();

  const { data: coupons, count } = await supabase
    .from('coupons')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return <CouponTable initialCoupons={coupons || []} initialTotal={count || 0} initialPage={1} perPage={PER_PAGE} />;
}
