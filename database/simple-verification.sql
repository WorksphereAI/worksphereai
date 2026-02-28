-- Simple verification - test the actual query pattern
-- This simulates the frontend query without parameters

-- Test the exact query pattern that was failing
SELECT id FROM users WHERE email = 'testing@company.com';

-- Test with a different email to make sure it works generally
SELECT id FROM users WHERE email = 'nonexistent@example.com';

-- Show all current policies for confirmation
SELECT 
    policyname,
    cmd,
    qual,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY cmd, policyname;

-- Test RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public';

-- If these queries work without errors, the 500 error should be fixed in the frontend
