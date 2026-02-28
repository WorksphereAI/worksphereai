-- Fix the 500 error with correct policy syntax
-- WITH CHECK cannot be used with SELECT operations

-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
DROP POLICY IF EXISTS "Bypass all RLS for email check" ON users;

-- Create a simple, clean policy for anonymous access
CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT USING (true);

-- Test the query again
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- Show current policies
SELECT policyname, cmd, qual, with_check FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- If the 500 error persists, let's try disabling RLS temporarily to confirm it's the issue
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
