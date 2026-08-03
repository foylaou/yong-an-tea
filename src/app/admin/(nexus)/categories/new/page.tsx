import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/nexus-categories/CategoryForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function NewCategoryPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase.from('categories').select('id, name').eq('is_active', true).order('sort_order', { ascending: true });

  return (
    <div>
      <PageTitle title="新增分類" />
      <CategoryForm parentCategories={categories || []} />
    </div>
  );
}
