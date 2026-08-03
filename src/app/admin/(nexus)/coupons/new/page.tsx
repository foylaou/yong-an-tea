import { CouponForm } from '@/components/admin/nexus-coupons/CouponForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default function NewCouponPage() {
  return (
    <div>
      <PageTitle title="新增優惠券" />
      <CouponForm />
    </div>
  );
}
