import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CouponForm } from '@/components/admin/nexus-coupons/CouponForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coupon, error } = await supabase.from('coupons').select('*').eq('id', id).single();

  if (error || !coupon) {
    notFound();
  }

  return (
    <div>
      <PageTitle title={`編輯優惠券 — ${coupon.code}`} />
      <CouponForm coupon={coupon} />
    </div>
  );
}
