-- ========================================
-- 08_row_level_security.sql
-- Row Level Security Policies
-- ========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_orders" ON public.orders;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

-- Users can view and update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "profiles_admin_access" ON public.profiles
  FOR ALL USING (public.is_admin());

-- ===========================================
-- PRODUCTS POLICIES
-- ===========================================

-- Everyone can view active products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (public.is_admin());

-- ===========================================
-- ORDERS POLICIES
-- ===========================================

-- Users can view their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.is_admin()
  );

-- Users can create orders (for themselves or as guest)
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL OR -- Guest orders
    public.is_admin()
  );

-- Users can update their own orders, admins can update all
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    public.is_admin()
  );

-- Admins can delete orders
CREATE POLICY "orders_admin_delete" ON public.orders
  FOR DELETE USING (public.is_admin());

-- ===========================================
-- ORDER ITEMS POLICIES
-- ===========================================

-- Users can view order items for their orders
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Users can add items to their orders
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR public.is_admin())
    )
  );

-- Users can update items in their orders
CREATE POLICY "order_items_update_own" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Users can delete items from their orders
CREATE POLICY "order_items_delete_own" ON public.order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ===========================================
-- PAYMENT METHODS POLICIES
-- ===========================================

-- Everyone can view active payment methods
CREATE POLICY "payment_methods_public_read" ON public.payment_methods
  FOR SELECT USING (is_active = true OR public.is_admin());

-- Admins can manage payment methods
CREATE POLICY "payment_methods_admin_all" ON public.payment_methods
  FOR ALL USING (public.is_admin());

-- ===========================================
-- NOTIFICATIONS POLICIES
-- ===========================================

-- Admins can view all notifications
CREATE POLICY "notifications_admin_read" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- Admins can create notifications
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- Users can view notifications for their orders
CREATE POLICY "notifications_user_read_own" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = notifications.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ===========================================
-- APP SETTINGS POLICIES
-- ===========================================

-- Everyone can read public settings
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT USING (is_public = true OR public.is_admin());

-- Admins can manage all settings
CREATE POLICY "app_settings_admin_all" ON public.app_settings
  FOR ALL USING (public.is_admin());

-- ===========================================
-- ADMIN USERS POLICIES
-- ===========================================

-- Admins can view admin users
CREATE POLICY "admin_users_read" ON public.admin_users
  FOR SELECT USING (public.is_admin());

-- Super admins can manage admin users
CREATE POLICY "admin_users_manage" ON public.admin_users
  FOR ALL USING (
    public.get_user_role() = 'super_admin' OR
    public.has_permission('manage_admins')
  );

-- Users can view their own admin status
CREATE POLICY "admin_users_view_own" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 8 Complete: Row Level Security policies created successfully';
  RAISE NOTICE '🔒 All tables are now secured with appropriate access controls';
END $$;