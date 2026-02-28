-- ============================================
-- WORKSPHERE AI - AUTHENTICATION SYSTEM TESTS
-- ============================================

SELECT '========================================' as separator;
SELECT 'TESTING AUTHENTICATION SYSTEM' as message;
SELECT '========================================' as separator;

-- Test 1: Verify Core Tables Exist
SELECT 'TEST 1: VERIFYING CORE TABLES EXIST' as test_name;
SELECT 
  'organizations' as table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') as exists_check
UNION ALL
SELECT 
  'users' as table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') as exists_check
UNION ALL
SELECT 
  'departments' as table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'departments' AND table_schema = 'public') as exists_check
UNION ALL
SELECT 
  'signup_attempts' as table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'signup_attempts' AND table_schema = 'public') as exists_check;

-- Test 2: Verify RLS is Enabled
SELECT 'TEST 2: VERIFYING RLS IS ENABLED' as test_name;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('organizations', 'users', 'departments', 'signup_attempts') 
  AND schemaname = 'public'
ORDER BY tablename;

-- Test 3: Verify Policies Exist
SELECT 'TEST 3: VERIFYING RLS POLICIES EXIST' as test_name;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'users', 'departments', 'signup_attempts')
GROUP BY tablename
ORDER BY tablename;

-- Test 4: Verify Functions Exist
SELECT 'TEST 4: VERIFYING FUNCTIONS EXIST' as test_name;
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_by_email', 'handle_new_user')
ORDER BY routine_name;

-- Test 5: Verify Trigger Exists
SELECT 'TEST 5: VERIFYING TRIGGER EXISTS' as test_name;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'on_auth_user_created';

-- Test 6: Test Basic Insert Operations (Service Role Simulation)
SELECT 'TEST 6: TESTING BASIC OPERATIONS' as test_name;

-- Test organization insert
DO $$
DECLARE
  org_id UUID;
BEGIN
  INSERT INTO organizations (name, slug, email)
  VALUES ('Test Organization', 'test-org', 'test@example.com')
  RETURNING id INTO org_id;
  
  RAISE NOTICE '✓ Organization created successfully: %', org_id;
  
  -- Test user insert (simulate auth user)
  INSERT INTO users (id, email, full_name, role, organization_id)
  VALUES (
    gen_random_uuid(),
    'test@example.com',
    'Test User',
    'admin',
    org_id
  );
  
  RAISE NOTICE '✓ User created successfully';
  
  -- Cleanup
  DELETE FROM users WHERE email = 'test@example.com';
  DELETE FROM organizations WHERE slug = 'test-org';
  
  RAISE NOTICE '✓ Test data cleaned up';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '✗ Test failed: %', SQLERRM;
END $$;

-- Test 7: Verify Default Data
SELECT 'TEST 7: VERIFYING DEFAULT DATA' as test_name;
SELECT 
  'subscription_plans' as table_name,
  COUNT(*) as record_count
FROM subscription_plans
UNION ALL
SELECT 
  'organizations' as table_name,
  COUNT(*) as record_count
FROM organizations
WHERE name = 'WorkSphere Technologies';

-- Test 8: Test Permission Structure
SELECT 'TEST 8: TESTING PERMISSION STRUCTURE' as test_name;
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
  AND table_name IN ('organizations', 'users', 'subscription_plans')
ORDER BY table_name, grantee, privilege_type;

-- Test 9: Test Indexes
SELECT 'TEST 9: VERIFYING INDEXES EXIST' as test_name;
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'users', 'departments', 'signup_attempts')
ORDER BY tablename, indexname;

-- Test 10: Test Foreign Key Constraints
SELECT 'TEST 10: VERIFYING FOREIGN KEY CONSTRAINTS' as test_name;
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
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

SELECT '========================================' as separator;
SELECT 'AUTHENTICATION SYSTEM TESTS COMPLETED' as message;
SELECT '========================================' as separator;

-- Summary Query
SELECT 'SUMMARY:' as info;
SELECT 
  'Tables Created' as metric,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('organizations', 'users', 'departments', 'signup_attempts', 'email_verifications', 'organization_invitations', 'subscription_plans', 'organization_subscriptions', 'customer_success_metrics', 'onboarding_progress')) as value
UNION ALL
SELECT 
  'RLS Enabled Tables' as metric,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('organizations', 'users', 'departments', 'signup_attempts', 'email_verifications', 'organization_invitations', 'subscription_plans', 'organization_subscriptions', 'customer_success_metrics', 'onboarding_progress')) as value
UNION ALL
SELECT 
  'Policies Created' as metric,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as value
UNION ALL
SELECT 
  'Functions Created' as metric,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('get_user_by_email', 'handle_new_user')) as value
UNION ALL
SELECT 
  'Triggers Created' as metric,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created') as value;
