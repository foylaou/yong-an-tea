'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { couponFormSchema, type CouponFormData } from '@/lib/validations/coupon';
import type { Coupon } from '@/types/coupon';

interface CouponFormProps {
  coupon?: Coupon;
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const errorClass = 'text-red-500 text-xs mt-1';

export default function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const isEdit = !!coupon;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || '',
      description: coupon?.description || '',
      discount_type: coupon?.discount_type || 'percentage',
      discount_value: coupon?.discount_value ?? 0,
      min_order_amount: coupon?.min_order_amount ?? 0,
      max_discount: coupon?.max_discount ?? null,
      usage_limit: coupon?.usage_limit ?? null,
      per_user_limit: coupon?.per_user_limit ?? 1,
      starts_at: coupon?.starts_at ? coupon.starts_at.slice(0, 16) : null,
      expires_at: coupon?.expires_at ? coupon.expires_at.slice(0, 16) : null,
      is_active: coupon?.is_active ?? true,
      product_ids: coupon?.product_ids ?? null,
      category_ids: coupon?.category_ids ?? null,
    },
  });

  const discountType = watch('discount_type');

  const onSubmit = async (data: CouponFormData) => {
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      ...data,
      starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      max_discount: data.max_discount ?? null,
      usage_limit: data.usage_limit ?? null,
    };

    try {
      const url = isEdit
        ? `/api/admin/coupons/${coupon!.id}`
        : '/api/admin/coupons';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || '操作失敗');
        setSubmitting(false);
        return;
      }

      router.push('/admin/coupons');
      router.refresh();
    } catch {
      setSubmitError('網路錯誤，請稍後再試');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* Code */}
      <div>
        <label className={labelClass}>折扣碼 *</label>
        <input
          {...register('code')}
          className={inputClass}
          placeholder="SUMMER2026"
          style={{ textTransform: 'uppercase' }}
        />
        {errors.code && <p className={errorClass}>{errors.code.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>描述</label>
        <input
          {...register('description')}
          className={inputClass}
          placeholder="夏季優惠活動"
        />
      </div>

      {/* Discount type + value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>折扣類型 *</label>
          <select {...register('discount_type')} className={inputClass}>
            <option value="percentage">百分比折扣</option>
            <option value="fixed_amount">固定金額</option>
            <option value="free_shipping">免運費</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            {discountType === 'percentage'
              ? '折扣百分比 (%)'
              : discountType === 'fixed_amount'
                ? '折扣金額 (元)'
                : '折扣值（免運不需設定）'}
          </label>
          <input
            {...register('discount_value', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            disabled={discountType === 'free_shipping'}
          />
          {errors.discount_value && (
            <p className={errorClass}>{errors.discount_value.message}</p>
          )}
        </div>
      </div>

      {/* Min order amount + max discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>最低訂單金額</label>
          <input
            {...register('min_order_amount', { valueAsNumber: true })}
            type="number"
            step="1"
            min="0"
            className={inputClass}
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">0 表示不限制</p>
        </div>
        {discountType === 'percentage' && (
          <div>
            <label className={labelClass}>折扣上限金額</label>
            <input
              {...register('max_discount', { valueAsNumber: true })}
              type="number"
              step="1"
              min="0"
              className={inputClass}
              placeholder="留空表示不限制"
            />
          </div>
        )}
      </div>

      {/* Usage limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>總使用次數上限</label>
          <input
            {...register('usage_limit', { valueAsNumber: true })}
            type="number"
            step="1"
            min="1"
            className={inputClass}
            placeholder="留空表示不限制"
          />
        </div>
        <div>
          <label className={labelClass}>每人使用次數上限</label>
          <input
            {...register('per_user_limit', { valueAsNumber: true })}
            type="number"
            step="1"
            min="1"
            className={inputClass}
          />
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>開始時間</label>
          <input
            {...register('starts_at')}
            type="datetime-local"
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1">留空表示立即生效</p>
        </div>
        <div>
          <label className={labelClass}>結束時間</label>
          <input
            {...register('expires_at')}
            type="datetime-local"
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1">留空表示永不過期</p>
        </div>
      </div>

      {/* Active toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_active')}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">啟用此優惠券</span>
        </label>
      </div>

      {/* Error */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : isEdit ? '更新優惠券' : '建立優惠券'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/coupons')}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}
