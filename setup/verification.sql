-- ========================================
-- verification.sql
-- Database Setup Verification Script
-- ========================================

DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
  settings_count INTEGER;
  products_count INTEGER;
  payment_methods_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 Starting Database Verification...';
  RAISE NOTICE '';

  -- ==========================================
  -- 1. Check Tables
  -- ==========================================
  
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'products', 'orders', 'order_items', 
    'payment_methods', 'notifications', 'app_settings', 
    'admin_users', 'dashboard_stats'
  );

  RAISE NOTICE '📊 TABLES CHECK:';
  IF table_count = 9 THEN
    RAISE NOTICE '✅ All 9 required tables created successfully';
  ELSE
    RAISE NOTICE '❌ Missing tables! Expected: 9, Found: %', table_count;
  END IF;

  -- List all tables
  FOR table_count IN 
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  LOOP
    RAISE NOTICE '   • %', (
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name 
      OFFSET (table_count-1) LIMIT 1
    );
  END LOOP;

  -- ==========================================
  -- 2. Check RLS Policies
  -- ==========================================
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '🔒 ROW LEVEL SECURITY CHECK:';
  IF policy_count >= 20 THEN
    RAISE NOTICE '✅ RLS policies created successfully (% policies)', policy_count;
  ELSE
    RAISE NOTICE '⚠️  Limited RLS policies found (% policies)', policy_count;
  END IF;

  -- ==========================================
  -- 3. Check Functions
  -- ==========================================
  
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_updated_at', 'handle_new_user', 'update_order_total',
    'is_admin', 'get_user_role', 'has_permission', 
    'refresh_dashboard_stats', 'search_products', 'get_order_stats'
  );

  RAISE NOTICE '';
  RAISE NOTICE '⚙️ FUNCTIONS CHECK:';
  IF function_count >= 8 THEN
    RAISE NOTICE '✅ All required functions created successfully (% functions)', function_count;
  ELSE
    RAISE NOTICE '❌ Missing functions! Expected: 8+, Found: %', function_count;
  END IF;

  -- ==========================================
  -- 4. Check Indexes
  -- ==========================================
  
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '🚀 PERFORMANCE INDEXES CHECK:';
  IF index_count >= 20 THEN
    RAISE NOTICE '✅ Performance indexes created successfully (% indexes)', index_count;
  ELSE
    RAISE NOTICE '⚠️  Limited indexes found (% indexes)', index_count;
  END IF;

  -- ==========================================
  -- 5. Check Triggers
  -- ==========================================
  
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '🔄 TRIGGERS CHECK:';
  IF trigger_count >= 8 THEN
    RAISE NOTICE '✅ Database triggers created successfully (% triggers)', trigger_count;
  ELSE
    RAISE NOTICE '⚠️  Limited triggers found (% triggers)', trigger_count;
  END IF;

  -- ==========================================
  -- 6. Check Default Settings
  -- ==========================================
  
  SELECT COUNT(*) INTO settings_count
  FROM public.app_settings;

  RAISE NOTICE '';
  RAISE NOTICE '⚙️ APP SETTINGS CHECK:';
  IF settings_count >= 10 THEN
    RAISE NOTICE '✅ Default app settings inserted successfully (% settings)', settings_count;
    
    -- Check specific important settings
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE setting_key = 'currency' AND setting_value = 'IDR') THEN
      RAISE NOTICE '   ✅ Currency set to IDR (Rupiah)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE setting_key = 'contact_whatsapp') THEN
      RAISE NOTICE '   ✅ WhatsApp contact configured';
    END IF;
  ELSE
    RAISE NOTICE '❌ Missing app settings! Expected: 10+, Found: %', settings_count;
  END IF;

  -- ==========================================
  -- 7. Check Sample Data
  -- ==========================================
  
  SELECT COUNT(*) INTO products_count
  FROM public.products;

  SELECT COUNT(*) INTO payment_methods_count
  FROM public.payment_methods;

  RAISE NOTICE '';
  RAISE NOTICE '📚 SAMPLE DATA CHECK:';
  IF products_count >= 10 THEN
    RAISE NOTICE '✅ Sample products inserted successfully (% products)', products_count;
  ELSE
    RAISE NOTICE '⚠️  Limited sample products (% products)', products_count;
  END IF;

  IF payment_methods_count >= 5 THEN
    RAISE NOTICE '✅ Payment methods configured successfully (% methods)', payment_methods_count;
  ELSE
    RAISE NOTICE '⚠️  Limited payment methods (% methods)', payment_methods_count;
  END IF;

  -- ==========================================
  -- 8. Final Status
  -- ==========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 SETUP SUMMARY:';
  RAISE NOTICE '   Tables: % / 9', table_count;
  RAISE NOTICE '   RLS Policies: %', policy_count;
  RAISE NOTICE '   Functions: % / 8+', function_count;
  RAISE NOTICE '   Indexes: %', index_count;
  RAISE NOTICE '   Triggers: %', trigger_count;
  RAISE NOTICE '   Settings: % / 10+', settings_count;
  RAISE NOTICE '   Products: %', products_count;
  RAISE NOTICE '   Payment Methods: %', payment_methods_count;
  
  RAISE NOTICE '';
  IF table_count = 9 AND function_count >= 8 AND settings_count >= 10 THEN
    RAISE NOTICE '🎉 DATABASE SETUP VERIFICATION SUCCESSFUL!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your Ebook Store database is ready to use!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 NEXT STEPS:';
    RAISE NOTICE '   1. Update your .env.local with Supabase credentials';
    RAISE NOTICE '   2. Add your first admin user (see README.md)';
    RAISE NOTICE '   3. Configure your payment methods';
    RAISE NOTICE '   4. Start adding your ebook products';
    RAISE NOTICE '   5. Test the application functionality';
  ELSE
    RAISE NOTICE '❌ DATABASE SETUP INCOMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Please check the following:';
    RAISE NOTICE '   • All SQL scripts ran without errors';
    RAISE NOTICE '   • No missing tables or functions';
    RAISE NOTICE '   • RLS policies are properly configured';
    RAISE NOTICE '   • Review the setup logs for any errors';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🔗 Useful queries for verification:';
  RAISE NOTICE '   SELECT * FROM public.app_settings;';
  RAISE NOTICE '   SELECT * FROM public.products LIMIT 5;';
  RAISE NOTICE '   SELECT * FROM public.payment_methods;';
  RAISE NOTICE '   SELECT * FROM public.dashboard_stats;';

END $$;