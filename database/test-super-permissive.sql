-- Test the query with the super-permissive policy
-- This should work if the issue was with policy logic

SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- If this works, we know RLS itself isn't the problem
-- The issue was with the specific SELECT policy logic

-- Now let's create a proper working policy
-- Drop the debugging policy
DROP POLICY IF EXISTS "Enable all access for debugging" ON users;

-- Create a working policy based on what we learned
CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT USING (true);

-- Test with the clean policy
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- Show final policy state
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;
