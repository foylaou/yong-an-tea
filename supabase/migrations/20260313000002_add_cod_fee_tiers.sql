-- 1. Add cod_fee column to orders table
ALTER TABLE public.orders ADD COLUMN cod_fee numeric(10,2) NOT NULL DEFAULT 0;

-- 2. Insert default COD fee tiers setting
INSERT INTO public.site_settings (key, value, "group")
VALUES (
  'cod_fee_tiers',
  '[{"max":2000,"fee":30},{"max":5000,"fee":60},{"max":10000,"fee":90},{"max":20000,"fee":120},{"max":30000,"fee":150}]',
  'shipping'
)
ON CONFLICT (key) DO NOTHING;

-- 3. Update create_order_with_items RPC to support cod_fee
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
  p_discount_amount numeric DEFAULT 0,
  p_cod_fee numeric DEFAULT 0
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

  v_total := v_subtotal + p_shipping_fee + p_cod_fee - p_discount_amount;

  -- Create the order
  INSERT INTO public.orders (
    customer_id, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, shipping_method,
    subtotal, shipping_fee, cod_fee, total, note
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_payment_method, p_shipping_method,
    v_subtotal, p_shipping_fee, p_cod_fee, v_total, p_note
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
    'cod_fee', p_cod_fee,
    'discount_amount', p_discount_amount,
    'total', v_total
  );
END;
$$;
