import { createClient } from '@/lib/supabase/server';
import ReviewTable from './ReviewTable';

const PER_PAGE = 20;

export default async function ReviewsPage() {
  const supabase = await createClient();

  const { data: reviews, count } = await supabase
    .from('product_reviews')
    .select(
      '*, profiles:customer_id(display_name), products:product_id(title)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  const mapped = (reviews || []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    customer_id: row.customer_id,
    rating: row.rating,
    title: row.title,
    content: row.content,
    status: row.status,
    is_verified_purchase: row.is_verified_purchase,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: row.profiles?.display_name || '匿名用戶',
    product_title: row.products?.title || '',
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">評價管理</h1>
      </div>
      <ReviewTable
        initialReviews={mapped}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
