import { createAdminClient } from './supabase/admin';
import type { Review } from '../types';

// ---------------------------------------------------------------------------
// Get approved reviews for a product (public, paginated)
// ---------------------------------------------------------------------------
export async function getReviewsByProduct(
  productId: string,
  page = 1,
  perPage = 5
): Promise<{ reviews: Review[]; total: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('product_reviews')
    .select('*, profiles:customer_id(display_name)', { count: 'exact' })
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('getReviewsByProduct error:', error.message);
    return { reviews: [], total: 0 };
  }

  const reviews: Review[] = (data || []).map((row: any) => ({
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
  }));

  return { reviews, total: count || 0 };
}

// ---------------------------------------------------------------------------
// Admin: get all reviews with filters
// ---------------------------------------------------------------------------
export async function getAdminReviews(filters: {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<{ reviews: Review[]; total: number }> {
  const supabase = createAdminClient();
  const page = filters.page || 1;
  const perPage = filters.perPage || 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('product_reviews')
    .select(
      '*, profiles:customer_id(display_name), products:product_id(title)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(
      `content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('getAdminReviews error:', error.message);
    return { reviews: [], total: 0 };
  }

  const reviews: Review[] = (data || []).map((row: any) => ({
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

  return { reviews, total: count || 0 };
}

// ---------------------------------------------------------------------------
// Admin: get a single review by ID
// ---------------------------------------------------------------------------
export async function getReviewById(id: string): Promise<Review | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*, profiles:customer_id(display_name), products:product_id(title)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    product_id: data.product_id,
    customer_id: data.customer_id,
    rating: data.rating,
    title: data.title,
    content: data.content,
    status: data.status,
    is_verified_purchase: data.is_verified_purchase,
    created_at: data.created_at,
    updated_at: data.updated_at,
    customer_name: (data as any).profiles?.display_name || '匿名用戶',
    product_title: (data as any).products?.title || '',
  };
}

// ---------------------------------------------------------------------------
// Admin: update review status
// ---------------------------------------------------------------------------
export async function updateReviewStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('product_reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('updateReviewStatus error:', error.message);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Admin: delete a review
// ---------------------------------------------------------------------------
export async function deleteReview(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('product_reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteReview error:', error.message);
    return false;
  }
  return true;
}
