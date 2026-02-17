import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/products/ProductForm';

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">新增商品</h1>
      <ProductForm categories={categories || []} />
    </div>
  );
}
