import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/products/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_categories(category_id)')
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (!productResult.data) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        編輯商品：{productResult.data.title}
      </h1>
      <ProductForm
        categories={categoriesResult.data || []}
        initialData={productResult.data}
        isEdit
      />
    </div>
  );
}
