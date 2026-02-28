-- Update existing RLS policies for signup system
-- This script updates existing policies instead of recreating them

-- ============================================
-- UPDATE SIGNUP_ATTEMPTS POLICIES
-- ============================================

-- Drop and recreate the main insert policy to ensure it's correct
DROP POLICY IF EXISTS "Allow anonymous signup attempts" ON signup_attempts;

CREATE POLICY "Allow anonymous signup attempts" ON signup_attempts
    FOR INSERT WITH CHECK (true);

-- Update other policies if needed
DROP POLICY IF EXISTS "Users can view their own signup attempts" ON signup_attempts;
CREATE POLICY "Users can view their own signup attempts" ON signup_attempts
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own signup attempts" ON signup_attempts;
CREATE POLICY "Users can update their own signup attempts" ON signup_attempts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role can manage signup attempts" ON signup_attempts;
CREATE POLICY "Service role can manage signup attempts" ON signup_attempts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- UPDATE EMAIL_VERIFICATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous email verification creation" ON email_verifications;
CREATE POLICY "Allow anonymous email verification creation" ON email_verifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own email verifications" ON email_verifications;
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own email verifications" ON email_verifications;
CREATE POLICY "Users can update their own email verifications" ON email_verifications
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Service role can manage email verifications" ON email_verifications;
CREATE POLICY "Service role can manage email verifications" ON email_verifications
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
WHERE tablename IN ('signup_attempts', 'email_verifications')
ORDER BY tablename, policyname;
