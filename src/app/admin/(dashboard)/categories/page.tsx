import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CategoryTable from '@/components/admin/categories/CategoryTable';

const PER_PAGE = 20;

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories, count } = await supabase
    .from('categories')
    .select('*, parent:categories!parent_id(id, name)', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  // Get product counts
  const categoryIds = (categories || []).map((c: any) => c.id);
  let productCounts: Record<string, number> = {};

  if (categoryIds.length > 0) {
    const { data: pcData } = await supabase
      .from('product_categories')
      .select('category_id')
      .in('category_id', categoryIds);

    if (pcData) {
      for (const pc of pcData) {
        productCounts[pc.category_id] = (productCounts[pc.category_id] || 0) + 1;
      }
    }
  }

  const categoriesWithCount = (categories || []).map((cat: any) => ({
    ...cat,
    product_count: productCounts[cat.id] || 0,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">分類管理</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          新增分類
        </Link>
      </div>
      <CategoryTable
        initialCategories={categoriesWithCount}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
