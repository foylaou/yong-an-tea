import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CouponForm from '@/components/admin/coupons/CouponForm';

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !coupon) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          編輯優惠券 — {coupon.code}
        </h1>
      </div>
      <CouponForm coupon={coupon} />
    </div>
  );
}
