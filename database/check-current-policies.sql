-- Check current policies on users table
SELECT policyname, cmd, qual, permissive, roles FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

-- If "Allow anonymous email check" exists but still getting 500 errors, 
-- let's check if RLS is actually enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public';

-- If RLS is enabled and policies exist, the issue might be with policy logic
-- Let's check the current policy details
SELECT 
    policyname,
    cmd,
    qual,
    with_check,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Allow anonymous email check';
