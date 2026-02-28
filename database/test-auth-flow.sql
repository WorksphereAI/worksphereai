-- ============================================
-- WORKSPHERE AI - TEST AUTHENTICATION FLOW
-- ============================================

SELECT '========================================' as separator;
SELECT 'TESTING AUTHENTICATION FLOW' as message;
SELECT '========================================' as separator;

-- Test 1: Verify trigger exists and is working
SELECT 'TEST 1: VERIFYING TRIGGER' as test_name;

SELECT 
  trigger_name,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Test 2: Test the handle_new_user function directly
SELECT 'TEST 2: TESTING USER PROFILE FUNCTION' as test_name;

-- Check if function exists and is valid
SELECT 
  routine_name,
  routine_type,
  CASE WHEN routine_name = 'handle_new_user' THEN '✅ VALID' ELSE '❌ MISSING' END as status
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- Test 3: Verify all required tables exist
SELECT 'TEST 3: VERIFYING REQUIRED TABLES' as test_name;

SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = t.table_name AND table_schema = 'public'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM (VALUES 
  ('users'), ('organizations'), ('departments'),
  ('subscription_plans'), ('organization_subscriptions'),
  ('business_metrics'), ('system_health_metrics'),
  ('feature_flags'), ('announcements'), ('admin_audit_logs'),
  ('system_alerts'), ('signup_attempts'), ('email_verifications'),
  ('organization_invitations'), ('customer_success_metrics'),
  ('onboarding_progress')
) AS t(table_name);

-- Test 4: Verify RLS is enabled on critical tables
SELECT 'TEST 4: VERIFYING RLS STATUS' as test_name;

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'organizations', 'departments',
    'subscription_plans', 'organization_subscriptions',
    'business_metrics', 'system_health_metrics',
    'feature_flags', 'announcements', 'admin_audit_logs',
    'system_alerts', 'signup_attempts', 'email_verifications',
    'organization_invitations', 'customer_success_metrics',
    'onboarding_progress'
  )
ORDER BY tablename;

-- Test 5: Verify default data exists
SELECT 'TEST 5: VERIFYING DEFAULT DATA' as test_name;

SELECT 
  'subscription_plans' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) >= 3 THEN '✅ SUFFICIENT' ELSE '⚠️ INSUFFICIENT' END as status
FROM subscription_plans
UNION ALL
SELECT 
  'feature_flags' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) >= 5 THEN '✅ SUFFICIENT' ELSE '⚠️ INSUFFICIENT' END as status
FROM feature_flags
UNION ALL
SELECT 
  'business_metrics' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) >= 1 THEN '✅ SUFFICIENT' ELSE '⚠️ INSUFFICIENT' END as status
FROM business_metrics
UNION ALL
SELECT 
  'system_health_metrics' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) >= 1 THEN '✅ SUFFICIENT' ELSE '⚠️ INSUFFICIENT' END as status
FROM system_health_metrics;

-- Test 6: Verify policies exist
SELECT 'TEST 6: VERIFYING POLICIES' as test_name;

SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ PROTECTED' ELSE '❌ UNPROTECTED' END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test 7: Simulate user creation (test trigger)
SELECT 'TEST 7: SIMULATING USER CREATION' as test_name;

-- This will test the trigger by creating a test auth user
-- Note: This test should be run with service role permissions
DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test-' || encode(gen_random_bytes(16), 'hex') || '@example.com';
BEGIN
  -- Insert test user into auth.users (this should trigger our function)
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    test_email,
    NOW(),
    NOW(),
    '{"full_name": "Test User", "role": "employee"}'::jsonb
  )
  RETURNING id INTO test_user_id;
  
  -- Check if user profile was created
  PERFORM 1 FROM public.users WHERE id = test_user_id;
  
  IF FOUND THEN
    RAISE NOTICE '✅ Trigger working: User profile created for %', test_email;
    
    -- Clean up test data
    DELETE FROM public.users WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE '✅ Test data cleaned up';
  ELSE
    RAISE NOTICE '❌ Trigger failed: User profile not created for %', test_email;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- Test 8: Check indexes for performance
SELECT 'TEST 8: VERIFYING INDEXES' as test_name;

SELECT 
  tablename,
  indexname,
  CASE 
    WHEN indexname LIKE '%_pkey' THEN '✅ PRIMARY KEY'
    WHEN indexname LIKE 'idx_%' THEN '✅ CUSTOM INDEX'
    ELSE '⚠️ OTHER INDEX'
  END as index_type
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'organizations', 'departments', 'signup_attempts')
ORDER BY tablename, indexname;

-- Test 9: Verify foreign key constraints
SELECT 'TEST 9: VERIFYING FOREIGN KEY CONSTRAINTS' as test_name;

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅ CONSTRAINT' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'departments', 'organization_subscriptions')
ORDER BY tc.table_name;

-- Test 10: Final verification using our function
SELECT 'TEST 10: FINAL VERIFICATION' as test_name;

SELECT * FROM verify_database_setup();

SELECT '========================================' as separator;
SELECT 'AUTHENTICATION FLOW TESTS COMPLETED' as message;
SELECT '========================================' as separator;

-- Summary
SELECT 
  'FINAL SUMMARY' as section,
  'Total Tables' as metric,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as value
UNION ALL
SELECT 
  'FINAL SUMMARY' as section,
  'RLS Enabled Tables' as metric,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as value
UNION ALL
SELECT 
  'FINAL SUMMARY' as section,
  'Total Policies' as metric,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as value
UNION ALL
SELECT 
  'FINAL SUMMARY' as section,
  'Active Triggers' as metric,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as value
UNION ALL
SELECT 
  'FINAL SUMMARY' as section,
  'Functions Available' as metric,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as value;
