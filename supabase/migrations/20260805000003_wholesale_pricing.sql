-- ============================================================
-- 差別定價：商品各別批發價
--
-- wholesale_price 為 NULL 表示這個商品/變體沒有設定批發價，批發商客戶
-- 下單時就照一般售價（discount_price/price）計算。
-- ============================================================

ALTER TABLE public.products ADD COLUMN wholesale_price numeric(10,2);
ALTER TABLE public.product_variants ADD COLUMN wholesale_price numeric(10,2);

-- 再次重寫 create_order_with_items（以 20260805000001_product_cost_price.sql
-- 修改後的版本為底）：簽名尾端加 p_is_wholesale，維持向後相容（沿用之前加
-- p_walk_in_customer_id/p_channel 時同樣的「尾端加、給預設值」手法）。
-- order_items 不用再加欄位，批發價算出來的結果本來就會存進既有的 price
-- snapshot 欄位。
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
  p_channel text DEFAULT 'website',
  p_is_wholesale boolean DEFAULT false
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
  v_item_cost numeric(10,2);
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
    SELECT id, title, sm_image, price, cost_price, wholesale_price, stock_qty, is_active, variant_stock_mode
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
    v_item_cost := v_product.cost_price;

    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' <> '' THEN
      SELECT id, name, price, discount_price, cost_price, wholesale_price, stock_qty
      INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid
        AND product_id = v_product.id
        AND is_active = true
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION '變體不存在: %', v_item->>'variant_id';
      END IF;

      v_item_price := CASE WHEN v_variant.discount_price > 0 THEN v_variant.discount_price ELSE v_variant.price END;
      v_item_cost := COALESCE(v_variant.cost_price, v_product.cost_price);
      IF p_is_wholesale AND v_variant.wholesale_price IS NOT NULL THEN
        v_item_price := v_variant.wholesale_price;
      END IF;

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
      IF p_is_wholesale AND v_product.wholesale_price IS NOT NULL THEN
        v_item_price := v_product.wholesale_price;
      END IF;

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
    SELECT id, title, sm_image, price, cost_price, wholesale_price, variant_stock_mode
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;

    v_stock_mode := COALESCE(v_product.variant_stock_mode, 'shared');
    v_variant_id := NULL;
    v_variant_label := NULL;
    v_item_price := v_product.price;
    v_item_cost := v_product.cost_price;

    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' <> '' THEN
      SELECT id, name, price, discount_price, cost_price, wholesale_price
      INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid
        AND product_id = v_product.id;

      v_variant_id := v_variant.id;
      v_variant_label := v_variant.name;
      v_item_price := CASE WHEN v_variant.discount_price > 0 THEN v_variant.discount_price ELSE v_variant.price END;
      v_item_cost := COALESCE(v_variant.cost_price, v_product.cost_price);
      IF p_is_wholesale AND v_variant.wholesale_price IS NOT NULL THEN
        v_item_price := v_variant.wholesale_price;
      END IF;

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
      IF p_is_wholesale AND v_product.wholesale_price IS NOT NULL THEN
        v_item_price := v_product.wholesale_price;
      END IF;

      -- No variant: deduct product stock
      UPDATE public.products
      SET stock_qty = stock_qty - (v_item->>'quantity')::int
      WHERE id = v_product.id;
    END IF;

    v_item_subtotal := v_item_price * (v_item->>'quantity')::int;

    INSERT INTO public.order_items (
      order_id, product_id, product_title, product_image,
      price, cost_price, quantity, subtotal, variant_id, variant_label
    ) VALUES (
      v_order_id, v_product.id, v_product.title, v_product.sm_image,
      v_item_price, v_item_cost, (v_item->>'quantity')::int, v_item_subtotal,
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
