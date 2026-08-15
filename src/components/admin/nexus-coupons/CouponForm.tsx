'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
    couponFormSchema,
    type CouponFormData,
} from '@/lib/validations/coupon';
import type { Coupon } from '@/types/coupon';

interface CouponFormProps {
    coupon?: Coupon;
}

export function CouponForm({ coupon }: CouponFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    // Create-mode only — a transient "also broadcast right after creating"
    // flag, not a form field. Editing an existing coupon uses the separate
    // 立即推播 button below instead, since it already has an id to target.
    const [broadcastOnCreate, setBroadcastOnCreate] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
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
            expires_at: coupon?.expires_at
                ? coupon.expires_at.slice(0, 16)
                : null,
            is_active: coupon?.is_active ?? true,
            product_ids: coupon?.product_ids ?? null,
            category_ids: coupon?.category_ids ?? null,
            is_welcome_coupon: coupon?.is_welcome_coupon ?? false,
        },
    });

    const discountType = watch('discount_type');

    async function broadcastToLineMembers(couponId: string) {
        setBroadcasting(true);
        setBroadcastResult(null);
        try {
            const res = await fetch(
                `/api/admin/coupons/${couponId}/broadcast`,
                { method: 'POST' }
            );
            const data = await res.json();
            if (!res.ok) {
                setBroadcastResult(data.error || '推播失敗');
                return;
            }
            setBroadcastResult(
                `已推播給 ${data.sent}/${data.total} 位 LINE 會員`
            );
        } catch {
            setBroadcastResult('推播失敗，請稍後再試');
        } finally {
            setBroadcasting(false);
        }
    }

    const onSubmit = async (data: CouponFormData) => {
        setSubmitting(true);
        setSubmitError('');

        const payload = {
            ...data,
            starts_at: data.starts_at
                ? new Date(data.starts_at).toISOString()
                : null,
            expires_at: data.expires_at
                ? new Date(data.expires_at).toISOString()
                : null,
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

            if (!isEdit && broadcastOnCreate && result.coupon?.id) {
                // Pause on the result instead of navigating away immediately — the
                // admin should get to see how many members it actually reached.
                setSubmitting(false);
                await broadcastToLineMembers(result.coupon.id);
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }

            router.push('/admin/coupons');
            router.refresh();
        } catch {
            setSubmitError('網路錯誤，請稍後再試');
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="card card-border bg-base-100 max-w-2xl"
        >
            <div className="card-body space-y-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">折扣碼 *</legend>
                    <input
                        {...register('code')}
                        className="input w-full uppercase"
                        placeholder="SUMMER2026"
                    />
                    {errors.code && (
                        <p className="text-error text-xs">
                            {errors.code.message}
                        </p>
                    )}
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">描述</legend>
                    <input
                        {...register('description')}
                        className="input w-full"
                        placeholder="夏季優惠活動"
                    />
                </fieldset>

                <div className="grid grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">折扣類型 *</legend>
                        <select
                            {...register('discount_type')}
                            className="select w-full"
                        >
                            <option value="percentage">百分比折扣</option>
                            <option value="fixed_amount">固定金額</option>
                            <option value="free_shipping">免運費</option>
                        </select>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {discountType === 'percentage'
                                ? '折扣百分比 (%)'
                                : discountType === 'fixed_amount'
                                  ? '折扣金額 (元)'
                                  : '折扣值（免運不需設定）'}
                        </legend>
                        <input
                            {...register('discount_value', {
                                valueAsNumber: true,
                            })}
                            type="number"
                            step="0.01"
                            min="0"
                            className="input w-full"
                            disabled={discountType === 'free_shipping'}
                        />
                        {errors.discount_value && (
                            <p className="text-error text-xs">
                                {errors.discount_value.message}
                            </p>
                        )}
                    </fieldset>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            最低訂單金額
                        </legend>
                        <input
                            {...register('min_order_amount', {
                                valueAsNumber: true,
                            })}
                            type="number"
                            step="1"
                            min="0"
                            className="input w-full"
                            placeholder="0"
                        />
                        <p className="text-base-content/40 text-xs">
                            0 表示不限制
                        </p>
                    </fieldset>
                    {discountType === 'percentage' && (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                折扣上限金額
                            </legend>
                            <input
                                {...register('max_discount', {
                                    setValueAs: (v) =>
                                        v === '' ? null : Number(v),
                                })}
                                type="number"
                                step="1"
                                min="0"
                                className="input w-full"
                                placeholder="留空表示不限制"
                            />
                        </fieldset>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            總使用次數上限
                        </legend>
                        <input
                            {...register('usage_limit', {
                                setValueAs: (v) =>
                                    v === '' ? null : Number(v),
                            })}
                            type="number"
                            step="1"
                            min="1"
                            className="input w-full"
                            placeholder="留空表示不限制"
                        />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            每人使用次數上限
                        </legend>
                        <input
                            {...register('per_user_limit', {
                                valueAsNumber: true,
                            })}
                            type="number"
                            step="1"
                            min="1"
                            className="input w-full"
                        />
                    </fieldset>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">開始時間</legend>
                        <input
                            {...register('starts_at')}
                            type="datetime-local"
                            className="input w-full"
                        />
                        <p className="text-base-content/40 text-xs">
                            留空表示立即生效
                        </p>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">結束時間</legend>
                        <input
                            {...register('expires_at')}
                            type="datetime-local"
                            className="input w-full"
                        />
                        <p className="text-base-content/40 text-xs">
                            留空表示永不過期
                        </p>
                    </fieldset>
                </div>

                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        {...register('is_active')}
                        className="checkbox checkbox-sm"
                    />
                    <span className="text-sm font-medium">啟用此優惠券</span>
                </label>

                <div className="border-base-300 rounded-lg border p-4">
                    <h3 className="mb-2 text-sm font-medium">
                        LINE 官方帳號推播
                    </h3>

                    <label className="flex cursor-pointer items-start gap-2">
                        <input
                            type="checkbox"
                            {...register('is_welcome_coupon')}
                            className="checkbox checkbox-sm mt-0.5"
                        />
                        <span className="text-sm">
                            設為新會員入會禮
                            <span className="text-base-content/60 block text-xs">
                                之後每一位新綁定 LINE
                                的會員，都會自動收到這張優惠券（長期生效，不是只發一次）
                            </span>
                        </span>
                    </label>

                    {isEdit ? (
                        <div className="mt-3">
                            <button
                                type="button"
                                disabled={broadcasting}
                                onClick={() =>
                                    broadcastToLineMembers(coupon!.id)
                                }
                                className="btn btn-outline btn-sm"
                            >
                                {broadcasting
                                    ? '推播中...'
                                    : '立即推播給所有 LINE 會員'}
                            </button>
                            <p className="text-base-content/60 mt-1 text-xs">
                                一次性推播給「現在」已綁定 LINE
                                的會員（適合週年慶這類活動券），之後才加入的不會自動收到
                            </p>
                        </div>
                    ) : (
                        <label className="mt-3 flex cursor-pointer items-start gap-2">
                            <input
                                type="checkbox"
                                checked={broadcastOnCreate}
                                onChange={(e) =>
                                    setBroadcastOnCreate(e.target.checked)
                                }
                                className="checkbox checkbox-sm mt-0.5"
                            />
                            <span className="text-sm">
                                建立後立即推播給所有現有 LINE 會員
                                <span className="text-base-content/60 block text-xs">
                                    一次性動作，適合週年慶這類活動券；跟上面的「入會禮」可以同時勾，代表現有會員先發一次，之後新會員再持續自動收到
                                </span>
                            </span>
                        </label>
                    )}

                    {broadcastResult && (
                        <div className="alert alert-success mt-2 text-sm">
                            {broadcastResult}
                        </div>
                    )}
                </div>

                {submitError && (
                    <div className="alert alert-error text-sm">
                        {submitError}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                    >
                        {submitting
                            ? '儲存中...'
                            : isEdit
                              ? '更新優惠券'
                              : '建立優惠券'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/coupons')}
                        className="btn btn-outline"
                    >
                        取消
                    </button>
                </div>
            </div>
        </form>
    );
}
