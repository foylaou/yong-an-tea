export type CustomerCategory = 'regular' | 'wholesale';

export interface Customer {
  id: string;
  profile_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  birthday: string | null;
  tea_preference: string | null;
  category: CustomerCategory;
  line_user_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}
