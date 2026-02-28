-- Fix the INSERT policy for user creation
-- We need to allow anonymous users to INSERT new users during signup

-- Drop the current SELECT-only policy
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;

-- Create a comprehensive policy that allows both SELECT and INSERT
CREATE POLICY "Allow anonymous user creation and email check" ON users
    FOR ALL USING (true);

-- Test the INSERT operation
INSERT INTO users (email, full_name, role, settings) 
VALUES ('test@example.com', 'Test User', 'employee', '{}')
ON CONFLICT (email) DO NOTHING;

-- Test the SELECT operation  
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- Clean up the test user
DELETE FROM users WHERE email = 'test@example.com';

-- Show final policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;
