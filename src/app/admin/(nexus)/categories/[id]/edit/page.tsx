import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/nexus-categories/CategoryForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [categoryResult, parentCategoriesResult] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').eq('is_active', true).neq('id', id).order('sort_order', { ascending: true }),
  ]);

  if (!categoryResult.data) {
    notFound();
  }

  return (
    <div>
      <PageTitle title={`編輯分類：${categoryResult.data.name}`} />
      <CategoryForm parentCategories={parentCategoriesResult.data || []} initialData={categoryResult.data} isEdit />
    </div>
  );
}
