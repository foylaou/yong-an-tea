import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/nexus-products/ProductForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div>
      <PageTitle title="新增商品" />
      <ProductForm categories={categories || []} />
    </div>
  );
}
