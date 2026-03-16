-- RPC to restore stock when an order is cancelled/refunded
CREATE OR REPLACE FUNCTION public.restore_order_stock(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_item record;
  v_stock_mode text;
BEGIN
  FOR v_item IN
    SELECT oi.product_id, oi.variant_id, oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    -- Get the product's stock mode
    SELECT COALESCE(variant_stock_mode, 'shared')
    INTO v_stock_mode
    FROM public.products
    WHERE id = v_item.product_id;

    IF v_item.variant_id IS NOT NULL AND v_stock_mode = 'independent' THEN
      -- Independent: restore variant stock
      UPDATE public.product_variants
      SET stock_qty = stock_qty + v_item.quantity
      WHERE id = v_item.variant_id;
    ELSE
      -- Shared or no variant: restore product stock
      UPDATE public.products
      SET stock_qty = stock_qty + v_item.quantity
      WHERE id = v_item.product_id;
    END IF;
  END LOOP;
END;
$$;
