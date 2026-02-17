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

export default function CategoryForm({ parentCategories, initialData, isEdit = false }: CategoryFormProps) {
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

    // Convert empty string parent_id to null
    const submitData = {
      ...data,
      parent_id: data.parent_id || null,
    };

    try {
      const url = isEdit
        ? `/api/admin/categories/${initialData.id}`
        : '/api/admin/categories';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{serverError}</div>
      )}

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">分類資訊</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">分類名稱 *</label>
            <input
              {...register('name')}
              onChange={handleNameChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slug * {isEdit && <span className="text-xs text-gray-400">（編輯時不可修改）</span>}
            </label>
            <input
              {...register('slug')}
              readOnly={isEdit}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isEdit ? 'cursor-not-allowed bg-gray-100' : ''
              }`}
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">父分類</label>
            <select
              {...register('parent_id')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">無（頂層分類）</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">排序</label>
            <input
              type="number"
              {...register('sort_order', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.sort_order && <p className="mt-1 text-sm text-red-600">{errors.sort_order.message}</p>}
          </div>
          <div className="flex items-center md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700">上架中</span>
            </label>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '儲存中...' : isEdit ? '更新分類' : '新增分類'}
        </button>
      </div>
    </form>
  );
}
