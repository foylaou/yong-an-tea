export type ExpenseCategory = '房租' | '人事' | '其他';
export type AdvancePaymentStatus = 'outstanding' | 'returned';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  month: string;
  category: ExpenseCategory;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvancePayment {
  id: string;
  payee: string;
  amount: number;
  advance_date: string;
  status: AdvancePaymentStatus;
  returned_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}
