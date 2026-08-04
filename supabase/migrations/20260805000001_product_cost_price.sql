-- ============================================================
-- 商品成本欄位（毛利計算用）
--
-- cost_price 是真正可為 NULL 的覆寫欄位：跟 discount_price 不同，
-- 0 是合理的真實成本（例如試喝樣品），所以用 COALESCE 判斷完全正確，
-- 不會有 discount_price 那種 0/NULL 混淆的 bug。
--
-- order_items.cost_price 是下單當下的 snapshot，比照既有的
-- product_title/price 欄位設計，避免之後改商品成本連動改到歷史訂單毛利。
-- ============================================================

ALTER TABLE public.products ADD COLUMN cost_price numeric(10,2);
ALTER TABLE public.product_variants ADD COLUMN cost_price numeric(10,2);
ALTER TABLE public.order_items ADD COLUMN cost_price numeric(10,2);

-- 重寫 create_order_with_items：
-- 1. 修掉已知但未修的 $0 定價 bug —— COALESCE(discount_price, price) 把
--    discount_price=0（這個資料庫「沒有折扣」的慣例值）當成真的 $0 售價，
--    改成 CASE WHEN discount_price > 0 判斷。
-- 2. 算出並 snapshot cost_price 到 order_items。
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
    SELECT id, title, sm_image, price, cost_price, stock_qty, is_active, variant_stock_mode
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
      SELECT id, name, price, discount_price, cost_price, stock_qty
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
    SELECT id, title, sm_image, price, cost_price, variant_stock_mode
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;

    v_stock_mode := COALESCE(v_product.variant_stock_mode, 'shared');
    v_variant_id := NULL;
    v_variant_label := NULL;
    v_item_price := v_product.price;
    v_item_cost := v_product.cost_price;

    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' <> '' THEN
      SELECT id, name, price, discount_price, cost_price
      INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid
        AND product_id = v_product.id;

      v_variant_id := v_variant.id;
      v_variant_label := v_variant.name;
      v_item_price := CASE WHEN v_variant.discount_price > 0 THEN v_variant.discount_price ELSE v_variant.price END;
      v_item_cost := COALESCE(v_variant.cost_price, v_product.cost_price);

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
