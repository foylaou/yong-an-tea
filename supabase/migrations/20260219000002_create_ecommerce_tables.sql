-- ============================================================
-- E-commerce Core: orders, order_items, addresses, payments
-- ============================================================

-- ============================================================
-- 1. Order number sequence
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val int;
BEGIN
  seq_val := nextval('public.order_number_seq');
  RETURN 'YAT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

-- ============================================================
-- 2. Orders
-- ============================================================
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT public.generate_order_number(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  -- Status
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','processing','shipped','completed','cancelled','refunded')),

  -- Amounts
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,

  -- Payment
  payment_method text NOT NULL DEFAULT 'line_pay'
    CHECK (payment_method IN ('line_pay','bank_transfer','cod')),
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),

  -- Shipping
  shipping_method text DEFAULT 'tcat',
  tracking_number text,

  -- Customer info snapshot
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address jsonb NOT NULL DEFAULT '{}',

  -- Notes
  note text,

  -- Timestamps
  paid_at timestamptz,
  shipped_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Admin full access
CREATE POLICY "Admin can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. Order Items (snapshot design)
-- ============================================================
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,

  -- Snapshot fields
  product_title text NOT NULL,
  product_image text,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  subtotal numeric(10,2) NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own order items
CREATE POLICY "Customers can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 4. Addresses
-- ============================================================
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  label text NOT NULL DEFAULT '住家',
  recipient_name text NOT NULL,
  phone text NOT NULL,
  postal_code text,
  city text NOT NULL,
  district text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  is_default boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Customers can manage their own addresses
CREATE POLICY "Customers can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can read all addresses
CREATE POLICY "Admin can view all addresses"
  ON public.addresses FOR SELECT
  USING (public.is_admin());

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. Payments
-- ============================================================
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  method text NOT NULL CHECK (method IN ('line_pay','bank_transfer','cod')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','refunded')),
  amount numeric(10,2) NOT NULL,

  transaction_id text,
  provider_data jsonb DEFAULT '{}',

  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Customers can view their own payments
CREATE POLICY "Customers can view own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin can manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. RPC: create_order_with_items (atomic order creation)
-- ============================================================
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
  p_items jsonb  -- array of { product_id, quantity }
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
    -- Lock the product row for update (prevent race condition)
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

  v_total := v_subtotal + p_shipping_fee;

  -- Create the order
  INSERT INTO public.orders (
    customer_id, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, shipping_method,
    subtotal, shipping_fee, total, note
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_payment_method, p_shipping_method,
    v_subtotal, p_shipping_fee, v_total, p_note
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

    -- Deduct stock
    UPDATE public.products
    SET stock_qty = stock_qty - (v_item->>'quantity')::int
    WHERE id = v_product.id;
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', p_shipping_fee,
    'total', v_total
  );
END;
$$;

-- ============================================================
-- 7. Shipping seed data in site_settings
-- ============================================================
INSERT INTO public.site_settings (key, value, "group", description) VALUES
  ('shipping_fee', '100', 'shipping', '固定運費（元）'),
  ('free_shipping_threshold', '1500', 'shipping', '滿額免運門檻（元，0 表示不啟用）'),
  ('shipping_note', '"滿 $1,500 免運費，一般宅配約 1-3 個工作天送達"', 'shipping', '運費說明文字')
ON CONFLICT (key) DO NOTHING;
