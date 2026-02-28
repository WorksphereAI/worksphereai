-- Ultimate test: Disable RLS completely to isolate the issue
-- This will tell us definitively if RLS is the problem

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test the query without RLS
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- If this works, RLS is definitely the issue
-- If this still fails, there's a deeper problem with the table or query

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Alternative approach: Try a completely different policy structure
-- Drop all existing policies and create one simple policy
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in same organization" ON users;

-- Create one super-permissive policy
CREATE POLICY "Enable all access for debugging" ON users
    FOR ALL USING (true);

-- Test with this policy
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- Show current state
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';
