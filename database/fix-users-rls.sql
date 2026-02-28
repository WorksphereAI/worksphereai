-- Fix users table RLS policies for email checking during signup
-- This resolves the 500 Internal Server Error when checking if email exists

-- ============================================
-- ENABLE RLS ON USERS TABLE IF NOT ALREADY ENABLED
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Enable RLS if not already enabled
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) THEN
            ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
END $$;

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- ============================================
-- CREATE NEW POLICIES
-- ============================================

-- Allow anonymous users to check if email exists (for signup validation)
CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT USING (true);

-- Allow authenticated users to manage their own profile
CREATE POLICY "Users can manage own profile" ON users
    FOR ALL USING (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- VERIFICATION
-- ============================================

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
