-- ============================================================
-- Coupons & Coupon Usages
-- ============================================================

-- 1. Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  max_discount numeric(10,2),
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  per_user_limit integer NOT NULL DEFAULT 1,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  product_ids uuid[],
  category_ids uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons"
  ON public.coupons FOR SELECT USING (true);

CREATE POLICY "Admin manage coupons"
  ON public.coupons FOR ALL USING (public.is_admin());

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Coupon usages table
CREATE TABLE public.coupon_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, order_id)
);

CREATE INDEX idx_coupon_usages_user ON public.coupon_usages(user_id, coupon_id);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usages"
  ON public.coupon_usages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manage usages"
  ON public.coupon_usages FOR ALL USING (public.is_admin());

-- 3. Add coupon fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;

-- 4. Update create_order_with_items RPC to support coupons
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_customer_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_payment_method text,
  p_shipping_method text,
  p_shipping_fee numeric,
  p_note text,
  p_items jsonb,
  p_coupon_code text DEFAULT NULL,
  p_discount_amount numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_total numeric(10,2);
  v_item jsonb;
  v_product record;
  v_item_subtotal numeric(10,2);
BEGIN
  -- Validate and process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, title, sm_image, price, stock_qty, availability, is_active
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION '商品不存在: %', v_item->>'product_id';
    END IF;

    IF NOT v_product.is_active THEN
      RAISE EXCEPTION '商品已下架: %', v_product.title;
    END IF;

    IF v_product.stock_qty < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION '庫存不足: % (剩餘 %)', v_product.title, v_product.stock_qty;
    END IF;

    v_item_subtotal := v_product.price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  v_total := v_subtotal + p_shipping_fee - p_discount_amount;

  -- Create the order
  INSERT INTO public.orders (
    customer_id, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, shipping_method,
    subtotal, shipping_fee, total, note,
    coupon_code, discount_amount
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_payment_method, p_shipping_method,
    v_subtotal, p_shipping_fee, v_total, p_note,
    p_coupon_code, p_discount_amount
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Create order items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, title, sm_image, price
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;

    v_item_subtotal := v_product.price * (v_item->>'quantity')::int;

    INSERT INTO public.order_items (
      order_id, product_id, product_title, product_image,
      price, quantity, subtotal
    ) VALUES (
      v_order_id, v_product.id, v_product.title, v_product.sm_image,
      v_product.price, (v_item->>'quantity')::int, v_item_subtotal
    );

    UPDATE public.products
    SET stock_qty = stock_qty - (v_item->>'quantity')::int
    WHERE id = v_product.id;
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', p_shipping_fee,
    'discount_amount', p_discount_amount,
    'total', v_total
  );
END;
$$;
