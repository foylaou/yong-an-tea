import { createClient } from '@/lib/supabase/server';
import CouponTable from '@/components/admin/coupons/CouponTable';

const PER_PAGE = 20;

export default async function CouponsPage() {
  const supabase = await createClient();

  const { data: coupons, count } = await supabase
    .from('coupons')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">優惠券管理</h1>
      </div>
      <CouponTable
        initialCoupons={coupons || []}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
