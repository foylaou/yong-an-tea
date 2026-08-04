import type { CustomerCategory, CustomerDiscountType } from './customer';

export interface CustomerDirectoryRow {
  id: string;
  source: 'customer' | 'member_only';
  customer_id: string | null;
  profile_id: string | null;
  has_login: boolean;
  name: string;
  phone: string | null;
  email: string | null;
  category: CustomerCategory;
  discount_type: CustomerDiscountType | null;
  discount_value: number;
  created_at: string;
}
