-- Comprehensive diagnostic for the 500 error
-- Let's check everything that could cause this issue

-- 1. Check if the users table actually exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if RLS is actually enabled properly
SELECT tablename, rowsecurity, hasindexes, hasrules, hastriggers
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. Check all policies again with full details
SELECT 
    policyname,
    schemaname,
    tablename,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;

-- 4. Test a simple query that should work
SELECT COUNT(*) as user_count FROM users;

-- 5. Test the problematic query pattern directly
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- 6. Check if there are any triggers that might interfere
SELECT trigger_name, event_manipulation, action_timing, action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'public';
