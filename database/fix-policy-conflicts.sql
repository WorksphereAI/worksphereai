-- Fix policy conflicts by ensuring anonymous access works properly
-- The issue is that multiple SELECT policies might conflict

-- Drop the conflicting policies and recreate them in the right order
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in same organization" ON users;

-- Create policies in logical order - most permissive first
CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view users in same organization" ON users
    FOR SELECT USING (organization_id IN (
        SELECT users_1.organization_id 
        FROM users users_1 
        WHERE users_1.id = auth.uid()
    ));

-- Keep the non-SELECT policies as they are
-- "Users can manage own profile" and "Users can update their own profile" should be fine

-- Verify the fix
SELECT policyname, cmd, qual, permissive FROM pg_policies 
WHERE tablename = 'users' AND cmd = 'SELECT'
ORDER BY policyname;
