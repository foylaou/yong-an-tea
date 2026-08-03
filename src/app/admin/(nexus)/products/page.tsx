import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductsTable } from '@/components/admin/nexus-products/ProductsTable';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import type { AdminProduct } from '@/types/admin-product';

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
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('sort_order', { ascending: true }),
  ]);

  return (
    <div>
      <PageTitle
        title="商品管理"
        actions={
          <Link href="/admin/products/new" className="btn btn-sm btn-primary">
            新增商品
          </Link>
        }
      />
      <ProductsTable
        initialProducts={(productsResult.data as AdminProduct[]) || []}
        initialTotal={productsResult.count || 0}
        initialPage={1}
        perPage={PER_PAGE}
        categories={categoriesResult.data || []}
      />
    </div>
  );
}
