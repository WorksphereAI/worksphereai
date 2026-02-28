-- Fix signup_attempts RLS policy to allow anonymous inserts
-- This resolves the "401 Unauthorized" and "Invalid API key" errors

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Service role can manage signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Users can view their own signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Allow anonymous signup attempts" ON signup_attempts;

-- Allow anonymous users to insert signup attempts
CREATE POLICY "Anyone can insert signup attempts" ON signup_attempts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to read their own signup attempts
CREATE POLICY "Anyone can view their own signup attempts" ON signup_attempts
  FOR SELECT TO anon, authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow service role full access
CREATE POLICY "Service role full access" ON signup_attempts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify the policies
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
WHERE tablename = 'signup_attempts'
ORDER BY policyname;
