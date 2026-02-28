-- Check ALL policies on users table to see if there are conflicts
SELECT 
    policyname,
    cmd,
    qual,
    with_check,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Also check if there are any restrictive policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'users' AND permissive = 'RESTRICTIVE'
ORDER BY policyname;
