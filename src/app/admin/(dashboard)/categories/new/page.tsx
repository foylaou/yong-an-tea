import { createClient } from '@/lib/supabase/server';
import CategoryForm from '@/components/admin/categories/CategoryForm';

export default async function NewCategoryPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">新增分類</h1>
      <CategoryForm parentCategories={categories || []} />
    </div>
  );
}
