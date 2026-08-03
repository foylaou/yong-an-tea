import { createClient } from '@/lib/supabase/server';
import { PosScreen } from '@/components/admin/pos/PosScreen';
import type { AdminProduct } from '@/types/admin-product';

export default async function PosPage() {
  const supabase = await createClient();

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, title, sku, price, discount_price, xs_image, sm_image, stock_qty, is_active, product_categories(category_id), product_variants(id, name, price, discount_price, stock_qty, sku)'
      )
      .eq('is_active', true)
      .order('title', { ascending: true }),
    supabase.from('categories').select('id, name').eq('is_active', true).order('sort_order', { ascending: true }),
  ]);

  return (
    <PosScreen
      initialProducts={(productsResult.data as unknown as AdminProduct[]) || []}
      categories={categoriesResult.data || []}
    />
  );
}
