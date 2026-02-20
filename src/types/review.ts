export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  content: string;
  status: ReviewStatus;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  customer_name?: string;
  product_title?: string;
}
