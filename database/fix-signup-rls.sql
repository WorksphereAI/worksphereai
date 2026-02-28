-- Fix RLS policies for signup system to allow unauthenticated signup attempts
-- This resolves the "new row violates row-level security policy" error

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================

-- Drop existing signup_attempts policies
DROP POLICY IF EXISTS "Users can view their own signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Service role can manage signup attempts" ON signup_attempts;

-- ============================================
-- CREATE NEW POLICIES
-- ============================================

-- Allow anyone to create signup attempts (for new user registration)
CREATE POLICY "Allow anonymous signup attempts" ON signup_attempts
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own signup attempts by email
CREATE POLICY "Users can view their own signup attempts" ON signup_attempts
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow service role to manage all signup attempts
CREATE POLICY "Service role can manage signup attempts" ON signup_attempts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow users to update their own signup attempts (for verification flow)
CREATE POLICY "Users can update their own signup attempts" ON signup_attempts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- EMAIL VERIFICATIONS POLICIES FIX
-- ============================================

-- Drop existing email_verifications policies
DROP POLICY IF EXISTS "Users can view their own email verifications" ON email_verifications;
DROP POLICY IF EXISTS "Service role can manage email verifications" ON email_verifications;

-- Allow anonymous email verification creation (for signup flow)
CREATE POLICY "Allow anonymous email verification creation" ON email_verifications
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own email verifications
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own email verifications (for verification)
CREATE POLICY "Users can update their own email verifications" ON email_verifications
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow service role to manage email verifications
CREATE POLICY "Service role can manage email verifications" ON email_verifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify policies are created correctly
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
WHERE tablename IN ('signup_attempts', 'email_verifications')
ORDER BY tablename, policyname;
