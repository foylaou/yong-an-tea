import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CategoryForm from '@/components/admin/categories/CategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [categoryResult, parentCategoriesResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .neq('id', id)
      .order('sort_order', { ascending: true }),
  ]);

  if (!categoryResult.data) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        編輯分類：{categoryResult.data.name}
      </h1>
      <CategoryForm
        parentCategories={parentCategoriesResult.data || []}
        initialData={categoryResult.data}
        isEdit
      />
    </div>
  );
}
