-- ========================================
-- 09_indexes_and_performance.sql
-- Performance Optimizations & Additional Indexes
-- ========================================

-- Additional composite indexes for complex queries
CREATE INDEX IF NOT EXISTS orders_user_status_idx ON public.orders(user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_guest_status_idx ON public.orders(guest_email, status) WHERE guest_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON public.orders(status, created_at DESC);

-- Product filtering and sorting indexes
CREATE INDEX IF NOT EXISTS products_price_active_idx ON public.products(price, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS products_category_price_idx ON public.products(category, price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS products_author_title_idx ON public.products(author, title) WHERE is_active = true;

-- Order items with product relationship
CREATE INDEX IF NOT EXISTS order_items_product_order_idx ON public.order_items(product_id, order_id);

-- Notification tracking indexes
CREATE INDEX IF NOT EXISTS notifications_order_type_idx ON public.notifications(order_id, type) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notifications_recipient_sent_idx ON public.notifications(recipient, sent_at DESC);

-- Performance settings and statistics
-- Update table statistics for query planner
ANALYZE public.profiles;
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.payment_methods;
ANALYZE public.notifications;
ANALYZE public.app_settings;
ANALYZE public.admin_users;

-- Create materialized view for dashboard statistics (optional, for high traffic)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.products WHERE is_active = true) as total_products,
  (SELECT COUNT(*) FROM public.orders) as total_orders,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'paid') as paid_orders,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'paid') as total_revenue,
  (SELECT COUNT(*) FROM public.profiles) as total_customers,
  NOW() as last_updated;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_stats_updated_idx ON public.dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION public.refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on materialized view
GRANT SELECT ON public.dashboard_stats TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_stats TO authenticated;

-- Create function for efficient product search
CREATE OR REPLACE FUNCTION public.search_products(
  search_term text DEFAULT '',
  category_filter text DEFAULT NULL,
  min_price decimal DEFAULT NULL,
  max_price decimal DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  author text,
  publisher text,
  price decimal,
  image_url text,
  category text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.author, p.publisher, p.price, 
    p.image_url, p.category, p.created_at
  FROM public.products p
  WHERE p.is_active = true
    AND (search_term = '' OR p.search_vector @@ plainto_tsquery('indonesian', search_term))
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  ORDER BY 
    CASE WHEN search_term = '' THEN 0 ELSE ts_rank(p.search_vector, plainto_tsquery('indonesian', search_term)) END DESC,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on search function
GRANT EXECUTE ON FUNCTION public.search_products TO authenticated, anon;

-- Create function for order statistics
CREATE OR REPLACE FUNCTION public.get_order_stats(user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  total_orders bigint,
  total_spent decimal,
  pending_orders bigint,
  paid_orders bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COUNT(*) FILTER (WHERE o.status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE o.status = 'paid') as paid_orders
  FROM public.orders o
  WHERE o.user_id = get_order_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on stats function
GRANT EXECUTE ON FUNCTION public.get_order_stats TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 9 Complete: Performance optimizations and additional indexes created';
  RAISE NOTICE '🚀 Database is optimized for high performance with 5000+ products';
  RAISE NOTICE '📊 Dashboard statistics materialized view created';
  RAISE NOTICE '🔍 Advanced search function created';
END $$;