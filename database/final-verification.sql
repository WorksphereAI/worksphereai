-- Final verification - test the exact query that was failing
-- This simulates the frontend query: GET /rest/v1/users?select=id&email=eq.testing@company.com

-- Test the exact query pattern
SELECT id FROM users WHERE email = 'testing@company.com';

-- Also test with a parameterized approach (what Supabase actually does)
SELECT id FROM users WHERE email = $1;

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
