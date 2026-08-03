-- ============================================================
-- POS (銷售模式) + 客戶資料 (customers)
--
-- `customers` is deliberately separate from `profiles`/`auth.users`:
-- walk-in shop customers taken over the phone/LINE/in-person will
-- never have a website login, and `profiles.id` is a hard FK to
-- `auth.users.id` so it can't represent them. Orders can now
-- reference EITHER an authenticated site user (`customer_id`) OR a
-- walk-in customer (`walk_in_customer_id`) — at least one is required.
-- ============================================================

-- 1. customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  birthday date,
  tea_preference text,
  category text NOT NULL DEFAULT 'regular' CHECK (category IN ('regular', 'wholesale')),
  line_user_id text UNIQUE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX customers_phone_idx ON public.customers (phone);
CREATE INDEX customers_name_idx ON public.customers (name);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage customers"
  ON public.customers FOR ALL USING (public.is_admin());

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. orders: allow walk-in customers, in-store channel, cash payment

ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN customer_email DROP NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN walk_in_customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_customer_ref_check
  CHECK (customer_id IS NOT NULL OR walk_in_customer_id IS NOT NULL);

ALTER TABLE public.orders
  ADD COLUMN channel text NOT NULL DEFAULT 'website'
  CHECK (channel IN ('website', 'phone', 'line', 'in_store'));

-- payment_method CHECK was unnamed at table-creation time; find and drop
-- it dynamically instead of guessing Postgres's auto-generated name.
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT con.conname INTO con_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'orders' AND con.contype = 'c' AND att.attname = 'payment_method';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('line_pay', 'bank_transfer', 'cod', 'cash'));

-- 3. create_order_with_items RPC: accept walk-in customers + channel.
-- New params are all DEFAULT-ed and appended at the end, so the
-- existing storefront checkout call site (src/lib/orders-db.ts) keeps
-- working unchanged. Stock/variant logic is untouched.

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_customer_id uuid DEFAULT NULL,
  p_customer_name text DEFAULT NULL,
  p_customer_email text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL,
  p_shipping_address jsonb DEFAULT NULL,
  p_payment_method text DEFAULT NULL,
  p_shipping_method text DEFAULT NULL,
  p_shipping_fee numeric DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_items jsonb DEFAULT NULL,
  p_coupon_code text DEFAULT NULL,
  p_discount_amount numeric DEFAULT 0,
  p_cod_fee numeric DEFAULT 0,
  p_walk_in_customer_id uuid DEFAULT NULL,
  p_channel text DEFAULT 'website'
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
  v_variant record;
  v_item_subtotal numeric(10,2);
  v_item_price numeric(10,2);
  v_variant_id uuid;
  v_variant_label text;
  v_stock_mode text;
BEGIN
  IF p_customer_id IS NULL AND p_walk_in_customer_id IS NULL THEN
    RAISE EXCEPTION 'customer_id 或 walk_in_customer_id 至少要有一個';
  END IF;

  -- Validate and calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, title, sm_image, price, stock_qty, is_active, variant_stock_mode
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

    v_stock_mode := COALESCE(v_product.variant_stock_mode, 'shared');
    v_variant_id := NULL;
    v_variant_label := NULL;
    v_item_price := v_product.price;

    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' <> '' THEN
      SELECT id, name, price, discount_price, stock_qty
      INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid
        AND product_id = v_product.id
        AND is_active = true
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION '變體不存在: %', v_item->>'variant_id';
      END IF;

      v_item_price := COALESCE(v_variant.discount_price, v_variant.price);

      IF v_stock_mode = 'independent' THEN
        -- Independent: check and deduct variant stock
        IF v_variant.stock_qty < (v_item->>'quantity')::int THEN
          RAISE EXCEPTION '庫存不足: % - % (剩餘 %)', v_product.title, v_variant.name, v_variant.stock_qty;
        END IF;
      ELSE
        -- Shared: check product stock
        IF v_product.stock_qty < (v_item->>'quantity')::int THEN
          RAISE EXCEPTION '庫存不足: % (剩餘 %)', v_product.title, v_product.stock_qty;
        END IF;
      END IF;
    ELSE
      -- No variant: check product stock
      IF v_product.stock_qty < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION '庫存不足: % (剩餘 %)', v_product.title, v_product.stock_qty;
      END IF;
    END IF;

    v_item_subtotal := v_item_price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  v_total := v_subtotal + p_shipping_fee + p_cod_fee - p_discount_amount;

  -- Create the order
  INSERT INTO public.orders (
    customer_id, walk_in_customer_id, channel, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, shipping_method,
    subtotal, shipping_fee, cod_fee, total, note
  ) VALUES (
    p_customer_id, p_walk_in_customer_id, p_channel, p_customer_name, p_customer_email, p_customer_phone,
    COALESCE(p_shipping_address, '{}'::jsonb), p_payment_method, p_shipping_method,
    v_subtotal, p_shipping_fee, p_cod_fee, v_total, p_note
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Create order items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, title, sm_image, price, variant_stock_mode
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;

    v_stock_mode := COALESCE(v_product.variant_stock_mode, 'shared');
    v_variant_id := NULL;
    v_variant_label := NULL;
    v_item_price := v_product.price;

    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' <> '' THEN
      SELECT id, name, price, discount_price
      INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid
        AND product_id = v_product.id;

      v_variant_id := v_variant.id;
      v_variant_label := v_variant.name;
      v_item_price := COALESCE(v_variant.discount_price, v_variant.price);

      IF v_stock_mode = 'independent' THEN
        -- Independent: deduct variant stock
        UPDATE public.product_variants
        SET stock_qty = stock_qty - (v_item->>'quantity')::int
        WHERE id = v_variant.id;
      ELSE
        -- Shared: deduct product stock
        UPDATE public.products
        SET stock_qty = stock_qty - (v_item->>'quantity')::int
        WHERE id = v_product.id;
      END IF;
    ELSE
      -- No variant: deduct product stock
      UPDATE public.products
      SET stock_qty = stock_qty - (v_item->>'quantity')::int
      WHERE id = v_product.id;
    END IF;

    v_item_subtotal := v_item_price * (v_item->>'quantity')::int;

    INSERT INTO public.order_items (
      order_id, product_id, product_title, product_image,
      price, quantity, subtotal, variant_id, variant_label
    ) VALUES (
      v_order_id, v_product.id, v_product.title, v_product.sm_image,
      v_item_price, (v_item->>'quantity')::int, v_item_subtotal,
      v_variant_id, v_variant_label
    );
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', p_shipping_fee,
    'cod_fee', p_cod_fee,
    'discount_amount', p_discount_amount,
    'total', v_total
  );
END;
$$;
