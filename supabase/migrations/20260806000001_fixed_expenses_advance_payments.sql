-- ============================================================
-- 每月固定支出登記 + 代墊款獨立帳
--
-- 代墊款（advance_payments）是應收款性質，故意不進任何營收計算 —
-- 只會出現在自己的清單頁，符合客戶原話「不可併入賣茶營收」。
-- ============================================================

CREATE TABLE public.fixed_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  month date NOT NULL, -- 該筆支出所屬月份第一天，例如 2026-08-01
  category text NOT NULL DEFAULT '其他' CHECK (category IN ('房租','人事','其他')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fixed_expenses_month_idx ON public.fixed_expenses (month);

ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage fixed_expenses" ON public.fixed_expenses FOR ALL USING (public.is_admin());
CREATE TRIGGER update_fixed_expenses_updated_at
  BEFORE UPDATE ON public.fixed_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.advance_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payee text NOT NULL, -- 代墊對象（自由文字，不強制連結 customers）
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  advance_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'outstanding' CHECK (status IN ('outstanding','returned')),
  returned_date date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX advance_payments_status_idx ON public.advance_payments (status);

ALTER TABLE public.advance_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage advance_payments" ON public.advance_payments FOR ALL USING (public.is_admin());
CREATE TRIGGER update_advance_payments_updated_at
  BEFORE UPDATE ON public.advance_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
