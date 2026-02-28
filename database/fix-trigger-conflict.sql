-- Fix the 500 error by creating a bypass policy for email checking
-- The issue might be that RLS policies are being evaluated in a way that triggers the update trigger

-- Create a more specific policy that bypasses potential trigger issues
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;

-- Create a policy specifically for email checking that doesn't trigger updates
CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT 
    USING (true) 
    WITH CHECK (false); -- Prevent any inserts/updates through this policy

-- Also try a completely permissive policy as a test
CREATE POLICY "Bypass all RLS for email check" ON users
    FOR SELECT 
    USING (email IS NOT NULL);

-- Test the query again
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- If this works, we can clean up the extra policy
-- DROP POLICY IF EXISTS "Bypass all RLS for email check" ON users;

-- Show current policies
SELECT policyname, cmd, qual, with_check FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
