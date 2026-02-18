'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useCartStore } from '../../store/cart/cart-slice';
import { formatPrice } from '../../store/settings/settings-slice';
import { checkoutFormSchema, type CheckoutFormData } from '../../lib/validations/order';
import type { Address } from '../../types/order';
import type { ShippingSettings } from '../../lib/orders-db';
import TaiwanAddressSelector from '../TaiwanAddressSelector';
import EmptyCheckout from './EmptyCheckout';

interface CheckoutFormProps {
  addresses: Address[];
  shippingSettings: ShippingSettings;
  userEmail: string;
  userName: string;
}

const inputField =
  'border border-[#e8e8e8] focus-visible:outline-0 placeholder:text-[#7b7975] py-[10px] px-[20px] w-full h-[50px]';
const textareaField =
  'border border-[#e8e8e8] focus-visible:outline-0 placeholder:text-[#7b7975] py-[10px] px-[20px] w-full min-h-[120px]';
const labelClass = 'mb-[5px] text-sm font-medium';
const errorClass = 'text-red-500 text-xs mt-1';

function CheckoutForm({ addresses, shippingSettings, userEmail, userName }: CheckoutFormProps) {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearAllFromCart = useCartStore((state) => state.clearAllFromCart);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: string;
    discount_amount: number;
    description: string;
  } | null>(null);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const baseShippingFee =
    shippingSettings.free_shipping_threshold > 0 &&
    subtotal >= shippingSettings.free_shipping_threshold
      ? 0
      : shippingSettings.shipping_fee;

  const shippingFee =
    appliedCoupon?.discount_type === 'free_shipping' ? 0 : baseShippingFee;

  const discountAmount = appliedCoupon?.discount_amount ?? 0;
  const total = subtotal - discountAmount + shippingFee;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer_name: userName || '',
      customer_email: userEmail || '',
      customer_phone: '',
      city: '',
      district: '',
      address_line1: '',
      payment_method: 'line_pay',
      save_address: false,
    },
  });

  const fillFromAddress = (address: Address) => {
    setValue('customer_name', address.recipient_name);
    setValue('customer_phone', address.phone);
    setValue('postal_code', address.postal_code || '');
    setValue('city', address.city);
    setValue('district', address.district);
    setValue('address_line1', address.address_line1);
    setValue('address_line2', address.address_line2 || '');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
          product_ids: cartItems.map((item) => item.id),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setCouponError(result.error || '折扣碼無效');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount_type: result.discount_type,
          discount_amount: result.discount_amount,
          description: result.description,
        });
        setCouponError('');
      }
    } catch {
      setCouponError('驗證折扣碼失敗，請稍後再試');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const onSubmit = async (formData: CheckoutFormData) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          shipping_address: {
            postal_code: formData.postal_code || '',
            city: formData.city,
            district: formData.district,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || '',
          },
          payment_method: formData.payment_method,
          note: formData.note || '',
          save_address: formData.save_address || false,
          items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || '訂單建立失敗');
        setSubmitting(false);
        return;
      }

      // Clear cart
      clearAllFromCart();

      // If LINE Pay, redirect to payment URL
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      // Otherwise go to success page
      router.push(`/order-success/${result.order.order_number}`);
    } catch {
      setSubmitError('網路錯誤，請稍後再試');
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
        <EmptyCheckout />
      </div>
    );
  }

  return (
    <div className="checkout border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
      <div className="container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 lg:gap-x-[25px] max-md:gap-y-[50px]">
            {/* Left: Shipping form */}
            <div className="lg:col-span-7 col-span-12">
              <div className="billing">
                <h2 className="text-[18px] mb-[20px] font-medium">收件資訊</h2>

                {/* Saved addresses quick fill */}
                {addresses.length > 0 && (
                  <div className="mb-[25px]">
                    <p className="text-sm text-gray-500 mb-2">快速填入已儲存的地址：</p>
                    <div className="flex flex-wrap gap-2">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => fillFromAddress(addr)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          {addr.label} - {addr.recipient_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-[20px]">
                  <div className="grid grid-cols-2 gap-[20px]">
                    <div>
                      <label htmlFor="customer_name" className={labelClass}>
                        收件人姓名 *
                      </label>
                      <input
                        {...register('customer_name')}
                        className={inputField}
                        id="customer_name"
                        placeholder="王小明"
                      />
                      {errors.customer_name && (
                        <p className={errorClass}>{errors.customer_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="customer_phone" className={labelClass}>
                        聯絡電話 *
                      </label>
                      <input
                        {...register('customer_phone')}
                        className={inputField}
                        id="customer_phone"
                        placeholder="0912345678"
                      />
                      {errors.customer_phone && (
                        <p className={errorClass}>{errors.customer_phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="customer_email" className={labelClass}>
                      電子郵件 *
                    </label>
                    <input
                      {...register('customer_email')}
                      className={inputField}
                      type="email"
                      id="customer_email"
                    />
                    {errors.customer_email && (
                      <p className={errorClass}>{errors.customer_email.message}</p>
                    )}
                  </div>

                  <TaiwanAddressSelector
                    postalCodeValue={watch('postal_code') ?? ''}
                    cityValue={watch('city')}
                    districtValue={watch('district')}
                    addressLine1Value={watch('address_line1')}
                    onPostalCodeChange={(zip, city, district) => {
                      setValue('postal_code', zip);
                      if (city) {
                        setValue('city', city, { shouldValidate: true });
                        setValue('district', district, { shouldValidate: true });
                      }
                    }}
                    onCityChange={(city) => {
                      setValue('city', city, { shouldValidate: true });
                      setValue('district', '', { shouldValidate: false });
                      setValue('postal_code', '');
                      setValue('address_line1', '');
                    }}
                    onDistrictChange={(district, zipCode) => {
                      setValue('district', district, { shouldValidate: true });
                      setValue('postal_code', zipCode);
                    }}
                    onAddressLine1Change={(addr) => {
                      setValue('address_line1', addr, { shouldValidate: true });
                    }}
                    inputClassName={inputField}
                    cityError={errors.city?.message}
                    districtError={errors.district?.message}
                    addressError={errors.address_line1?.message}
                  />

                  <div>
                    <label htmlFor="address_line2" className={labelClass}>
                      地址補充（選填）
                    </label>
                    <input
                      {...register('address_line2')}
                      className={inputField}
                      id="address_line2"
                      placeholder="請寫樓層或特殊需求，比如說管理室收"
                    />
                  </div>

                  <div>
                    <label htmlFor="note" className={labelClass}>
                      訂單備註（選填）
                    </label>
                    <textarea
                      {...register('note')}
                      className={textareaField}
                      id="note"
                      placeholder="配送時段偏好、其他備註..."
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('save_address')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">儲存此地址以便下次使用</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-5 col-span-12">
              <div className="order-info">
                <div className="bg-[#f6f6f6] border border-[#bfbfbf] p-[40px_45px_50px]">
                  <h2 className="text-[18px] mb-[20px] font-medium">訂單摘要</h2>

                  <table className="w-full text-sm text-left">
                    <thead className="text-[16px] bg-[#f4f5f7]">
                      <tr>
                        <th className="font-normal py-3">商品</th>
                        <th className="font-normal py-3 text-right">小計</th>
                      </tr>
                    </thead>
                    <tbody className="border-t border-[#cdcdcd]">
                      {cartItems.map((item) => (
                        <tr key={item.id} className="border-t border-[#cdcdcd]">
                          <td className="py-[15px] font-normal">
                            {item.name} x {item.quantity}
                          </td>
                          <td className="py-[15px] text-right">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-[#cdcdcd]">
                        <td className="py-[15px] font-bold">小計</td>
                        <td className="py-[15px] text-right">{formatPrice(subtotal)}</td>
                      </tr>
                      <tr className="border-t border-[#cdcdcd]">
                        <td className="py-[15px] font-bold">運費</td>
                        <td className="py-[15px] text-right">
                          {shippingFee === 0 ? (
                            <span className="text-green-600">免運費</span>
                          ) : (
                            formatPrice(shippingFee)
                          )}
                        </td>
                      </tr>
                      {appliedCoupon && discountAmount > 0 && (
                        <tr className="border-t border-[#cdcdcd]">
                          <td className="py-[15px] font-bold text-green-600">折扣</td>
                          <td className="py-[15px] text-right text-green-600">
                            -{formatPrice(discountAmount)}
                          </td>
                        </tr>
                      )}
                      {appliedCoupon?.discount_type === 'free_shipping' && (
                        <tr className="border-t border-[#cdcdcd]">
                          <td className="py-[15px] font-bold text-green-600">免運優惠</td>
                          <td className="py-[15px] text-right text-green-600">已套用</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-[#333]">
                        <td className="py-[15px] font-bold text-lg">合計</td>
                        <td className="py-[15px] text-right font-bold text-lg">
                          {formatPrice(total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {shippingSettings.shipping_note && (
                    <p className="text-xs text-gray-500 mt-2">
                      {shippingSettings.shipping_note}
                    </p>
                  )}

                  {/* Coupon code */}
                  <div className="mt-[20px]">
                    <h3 className="text-[16px] mb-[10px] font-medium">折扣碼</h3>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                        <div>
                          <span className="font-medium text-green-700">
                            {appliedCoupon.code}
                          </span>
                          {appliedCoupon.description && (
                            <p className="text-xs text-green-600 mt-0.5">
                              {appliedCoupon.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          移除
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="輸入折扣碼"
                          className={inputField}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 h-[50px] bg-[#222] text-white text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {couponLoading ? '驗證中...' : '套用'}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-red-500 text-xs mt-1">{couponError}</p>
                    )}
                  </div>

                  {/* Payment method */}
                  <div className="mt-[30px]">
                    <h3 className="text-[16px] mb-[15px] font-medium">付款方式</h3>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="radio"
                          value="line_pay"
                          {...register('payment_method')}
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">LINE Pay</span>
                          <p className="text-xs text-gray-500">使用 LINE Pay 安全付款</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="radio"
                          value="bank_transfer"
                          {...register('payment_method')}
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">銀行轉帳</span>
                          <p className="text-xs text-gray-500">匯款後請通知客服確認</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="radio"
                          value="cod"
                          {...register('payment_method')}
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">貨到付款</span>
                          <p className="text-xs text-gray-500">收到商品時付款給物流人員</p>
                        </div>
                      </label>
                    </div>
                    {errors.payment_method && (
                      <p className={errorClass}>{errors.payment_method.message}</p>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="payment-btn-wrap pt-[35px]">
                  <button
                    className="bg-[#222222] text-white w-full px-[42px] h-[46px] leading-[44px] transition-all hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? '處理中...' : '確認下單'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutForm;
