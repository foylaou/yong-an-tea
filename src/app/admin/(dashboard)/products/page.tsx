import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductTable from '@/components/admin/products/ProductTable';

const PER_PAGE = 20;

export default async function ProductsPage() {
  const supabase = await createClient();

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_categories(category_id, categories(id, name))', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(0, PER_PAGE - 1),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          新增商品
        </Link>
      </div>
      <ProductTable
        initialProducts={productsResult.data || []}
        initialTotal={productsResult.count || 0}
        initialPage={1}
        perPage={PER_PAGE}
        categories={categoriesResult.data || []}
      />
    </div>
  );
}
