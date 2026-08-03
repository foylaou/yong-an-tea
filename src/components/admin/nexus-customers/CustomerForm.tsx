'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { customerApiSchema, type CustomerApiData } from '@/lib/validations/customer';
import type { Customer } from '@/types/customer';

interface OrderSummary {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface CustomerFormProps {
  initialData?: Customer;
  isEdit?: boolean;
  orderHistory?: OrderSummary[];
}

const statusLabel: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export function CustomerForm({ initialData, isEdit = false, orderHistory }: CustomerFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerApiData>({
    resolver: zodResolver(customerApiSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      birthday: initialData?.birthday || '',
      tea_preference: initialData?.tea_preference || '',
      category: initialData?.category || 'regular',
      discount_type: initialData?.discount_type ?? null,
      discount_value: initialData?.discount_value ?? 0,
      note: initialData?.note || '',
    },
  });

  const discountType = watch('discount_type');

  async function onSubmit(data: CustomerApiData) {
    setSubmitting(true);
    setServerError(null);

    try {
      const url = isEdit ? `/api/admin/customers/${initialData?.id}` : '/api/admin/customers';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = data.discount_type ? data : { ...data, discount_type: null, discount_value: 0 };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }

      router.push('/admin/customers');
      router.refresh();
    } catch {
      setServerError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <h2 className="card-title">客戶資訊</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">姓名 *</legend>
                <input type="text" {...register('name')} className="input w-full" />
                {errors.name && <p className="text-error mt-1 text-sm">{errors.name.message}</p>}
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">電話</legend>
                <input type="text" {...register('phone')} placeholder="09xxxxxxxx" className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Email</legend>
                <input type="email" {...register('email')} className="input w-full" />
                {errors.email && <p className="text-error mt-1 text-sm">{errors.email.message}</p>}
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">生日</legend>
                <input type="date" {...register('birthday')} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset md:col-span-2">
                <legend className="fieldset-legend">地址（寄送用）</legend>
                <input type="text" {...register('address')} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">常買茶種/口味</legend>
                <input type="text" {...register('tea_preference')} placeholder="例：金萱、東方美人" className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">客戶分類</legend>
                <select {...register('category')} className="select w-full">
                  <option value="regular">常客</option>
                  <option value="wholesale">批發商</option>
                </select>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">熟客折扣</legend>
                <select
                  value={discountType ?? ''}
                  onChange={(e) => setValue('discount_type', e.target.value ? (e.target.value as 'percentage' | 'fixed_amount') : null, { shouldDirty: true })}
                  className="select w-full"
                >
                  <option value="">無</option>
                  <option value="percentage">百分比折扣</option>
                  <option value="fixed_amount">固定金額折扣</option>
                </select>
              </fieldset>
              {discountType && (
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    {discountType === 'percentage' ? '折扣百分比（例：10 代表 9 折省 10%）' : '折抵金額（元）'}
                  </legend>
                  <input
                    type="number"
                    min={0}
                    step={discountType === 'percentage' ? 1 : 1}
                    {...register('discount_value', { valueAsNumber: true })}
                    className="input w-full"
                  />
                  {errors.discount_value && <p className="text-error mt-1 text-sm">{errors.discount_value.message}</p>}
                </fieldset>
              )}
              <fieldset className="fieldset md:col-span-2">
                <legend className="fieldset-legend">備註</legend>
                <textarea rows={3} {...register('note')} className="textarea w-full" />
              </fieldset>
            </div>
          </div>
        </div>

        {serverError && <div className="alert alert-error text-sm">{serverError}</div>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/admin/customers')} className="btn btn-outline">
            取消
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? '儲存中...' : isEdit ? '更新客戶' : '新增客戶'}
          </button>
        </div>
      </form>

      {isEdit && orderHistory && (
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <h2 className="card-title">歷史購買紀錄</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>訂單編號</th>
                    <th>狀態</th>
                    <th>付款</th>
                    <th className="text-right">金額</th>
                    <th>時間</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-base-content/40 py-6 text-center">
                        尚無購買紀錄
                      </td>
                    </tr>
                  ) : (
                    orderHistory.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/admin/orders/${order.id}`} className="link link-hover">
                            {order.order_number}
                          </Link>
                        </td>
                        <td>{statusLabel[order.status] || order.status}</td>
                        <td>
                          <span className={`badge badge-sm ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {order.payment_status === 'paid' ? '已付款' : '未付款'}
                          </span>
                        </td>
                        <td className="text-right">${order.total.toLocaleString()}</td>
                        <td className="text-base-content/60">{new Date(order.created_at).toLocaleDateString('zh-TW')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
