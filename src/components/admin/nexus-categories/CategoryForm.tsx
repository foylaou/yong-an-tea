'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { categoryFormSchema, type CategoryFormData } from '@/lib/validations/category';

interface ParentCategory {
  id: string;
  name: string;
}

interface CategoryFormProps {
  parentCategories: ParentCategory[];
  initialData?: any;
  isEdit?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function CategoryForm({ parentCategories, initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: CategoryFormData = {
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    parent_id: initialData?.parent_id || null,
    sort_order: initialData?.sort_order ?? 0,
    is_active: initialData?.is_active ?? true,
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue('name', name);
    if (!isEdit) {
      setValue('slug', slugify(name));
    }
  }

  async function onSubmit(data: CategoryFormData) {
    setSubmitting(true);
    setServerError(null);

    const submitData = { ...data, parent_id: data.parent_id || null };

    try {
      const url = isEdit ? `/api/admin/categories/${initialData.id}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }

      router.push('/admin/categories');
      router.refresh();
    } catch {
      setServerError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <div className="alert alert-error text-sm">{serverError}</div>}

      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">分類資訊</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">分類名稱 *</legend>
              <input {...register('name')} onChange={handleNameChange} className="input w-full" />
              {errors.name && <p className="text-error mt-1 text-sm">{errors.name.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Slug * {isEdit && <span className="text-base-content/40 text-xs">（編輯時不可修改）</span>}
              </legend>
              <input {...register('slug')} readOnly={isEdit} className={`input w-full ${isEdit ? 'cursor-not-allowed opacity-60' : ''}`} />
              {errors.slug && <p className="text-error mt-1 text-sm">{errors.slug.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">父分類</legend>
              <select {...register('parent_id')} className="select w-full">
                <option value="">無（頂層分類）</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">排序</legend>
              <input type="number" {...register('sort_order', { valueAsNumber: true })} className="input w-full" />
              {errors.sort_order && <p className="text-error mt-1 text-sm">{errors.sort_order.message}</p>}
            </fieldset>
            <div className="flex items-center md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" {...register('is_active')} className="checkbox checkbox-sm" />
                <span className="text-sm">上架中</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/categories')} className="btn btn-outline">
          取消
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? '儲存中...' : isEdit ? '更新分類' : '新增分類'}
        </button>
      </div>
    </form>
  );
}
