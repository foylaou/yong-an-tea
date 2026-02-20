-- 銷售分析聚合查詢 RPC
CREATE OR REPLACE FUNCTION public.get_sales_analytics(
  p_start_date date DEFAULT (CURRENT_DATE - INTERVAL '30 days')::date,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  result jsonb;
BEGIN
  -- 只有 admin 可呼叫
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT jsonb_build_object(
    -- KPI 指標
    'total_revenue', (SELECT COALESCE(SUM(total),0) FROM public.orders
      WHERE status NOT IN ('cancelled','refunded')
      AND created_at::date BETWEEN p_start_date AND p_end_date),
    'total_orders', (SELECT COUNT(*) FROM public.orders
      WHERE created_at::date BETWEEN p_start_date AND p_end_date),
    'avg_order_value', (SELECT COALESCE(AVG(total),0) FROM public.orders
      WHERE status NOT IN ('cancelled','refunded')
      AND created_at::date BETWEEN p_start_date AND p_end_date),
    'new_customers', (SELECT COUNT(DISTINCT customer_id) FROM public.orders
      WHERE created_at::date BETWEEN p_start_date AND p_end_date
      AND customer_id NOT IN (
        SELECT DISTINCT customer_id FROM public.orders
        WHERE created_at::date < p_start_date
      )),

    -- 每日營收趨勢
    'daily_revenue', (SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) FROM (
      SELECT d::date AS date, COALESCE(SUM(o.total),0) AS revenue, COUNT(o.id) AS orders
      FROM generate_series(p_start_date::timestamp, p_end_date::timestamp, '1 day') d
      LEFT JOIN public.orders o ON o.created_at::date = d::date
        AND o.status NOT IN ('cancelled','refunded')
      GROUP BY d::date ORDER BY d::date
    ) t),

    -- 熱銷商品 TOP 10
    'top_products', (SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) FROM (
      SELECT oi.product_title AS name, SUM(oi.quantity) AS qty, SUM(oi.subtotal) AS revenue
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE o.status NOT IN ('cancelled','refunded')
        AND o.created_at::date BETWEEN p_start_date AND p_end_date
      GROUP BY oi.product_title ORDER BY revenue DESC LIMIT 10
    ) t),

    -- 訂單狀態分佈
    'order_status_dist', (SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) FROM (
      SELECT status, COUNT(*) AS count
      FROM public.orders
      WHERE created_at::date BETWEEN p_start_date AND p_end_date
      GROUP BY status
    ) t),

    -- 付款方式分佈
    'payment_method_dist', (SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) FROM (
      SELECT payment_method, COUNT(*) AS count
      FROM public.orders
      WHERE created_at::date BETWEEN p_start_date AND p_end_date
      GROUP BY payment_method
    ) t),

    -- 客戶統計
    'returning_customers', (SELECT COUNT(DISTINCT customer_id) FROM public.orders
      WHERE created_at::date BETWEEN p_start_date AND p_end_date
      AND customer_id IN (
        SELECT DISTINCT customer_id FROM public.orders
        WHERE created_at::date < p_start_date
      ))
  ) INTO result;

  RETURN result;
END;
$$;
