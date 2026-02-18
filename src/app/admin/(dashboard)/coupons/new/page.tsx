import CouponForm from '@/components/admin/coupons/CouponForm';

export default function NewCouponPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">新增優惠券</h1>
      </div>
      <CouponForm />
    </div>
  );
}
