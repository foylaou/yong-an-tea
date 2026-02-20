-- product_reviews 資料表
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_verified_purchase boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, customer_id)
);

-- products 表新增聚合欄位
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS avg_rating numeric(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- 自動重算平均評分的 trigger
CREATE OR REPLACE FUNCTION public.recalc_product_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.products SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recalc_product_rating
  AFTER INSERT OR UPDATE OF status, rating OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_product_rating();

-- 已購買驗證 RPC
CREATE OR REPLACE FUNCTION public.has_purchased_product(p_product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = p_product_id
      AND o.customer_id = auth.uid()
      AND o.status IN ('completed','shipped')
  );
$$;

-- RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
  ON public.product_reviews FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can insert own review"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own pending review"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'pending');

CREATE POLICY "Admin full access to reviews"
  ON public.product_reviews FOR ALL
  USING (public.is_admin());
