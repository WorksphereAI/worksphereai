-- Comprehensive fix for all RLS policies in signup system
-- This resolves both INSERT and SELECT issues for unauthenticated users

-- ============================================
-- SIGNUP_ATTEMPTS POLICIES
-- ============================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow anonymous signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Users can view their own signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Users can update their own signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Service role can manage signup attempts" ON signup_attempts;

-- Create new comprehensive policies
CREATE POLICY "Allow anonymous signup attempt creation" ON signup_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read by email" ON signup_attempts
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage their attempts" ON signup_attempts
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role full access" ON signup_attempts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- EMAIL_VERIFICATIONS POLICIES
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous email verification creation" ON email_verifications;
DROP POLICY IF EXISTS "Users can view their own email verifications" ON email_verifications;
DROP POLICY IF EXISTS "Users can update their own email verifications" ON email_verifications;
DROP POLICY IF EXISTS "Service role can manage email verifications" ON email_verifications;

-- Create new comprehensive policies
CREATE POLICY "Allow anonymous email verification creation" ON email_verifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read by email" ON email_verifications
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous update by token" ON email_verifications
    FOR UPDATE USING (true);

CREATE POLICY "Service role full access" ON email_verifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- USERS TABLE ACCESS (if needed)
-- ============================================

-- Check if users table needs RLS policies for email checking
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Enable RLS if not already enabled
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) THEN
            ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        END IF;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        DROP POLICY IF EXISTS "Service role full access" ON users;
        
        -- Create policies
        CREATE POLICY "Allow anonymous email check" ON users
            FOR SELECT USING (true);
            
        CREATE POLICY "Users can view own profile" ON users
            FOR ALL USING (auth.uid() = id);
            
        CREATE POLICY "Service role full access" ON users
            FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

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
WHERE tablename IN ('signup_attempts', 'email_verifications', 'users')
ORDER BY tablename, policyname;
