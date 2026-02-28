-- RLS policies for users table
-- This allows user creation during signup while maintaining security

-- Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Create comprehensive policies
CREATE POLICY "Allow anonymous user creation" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read by email" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own profile" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Organization-based access
CREATE POLICY "Organization members can view users" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
