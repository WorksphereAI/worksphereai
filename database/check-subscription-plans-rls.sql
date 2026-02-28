-- Check RLS policies on subscription_plans table
-- This table needs to allow anonymous reads for the test to work

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'subscription_plans';

-- Check existing policies
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
WHERE tablename = 'subscription_plans'
ORDER BY policyname;

-- If no policies exist, create one to allow anonymous reads
-- This will fix the 401 error when testing subscription_plans access

DROP POLICY IF EXISTS "Allow anonymous read access" ON subscription_plans;

CREATE POLICY "Allow anonymous read access" ON subscription_plans
  FOR SELECT TO anon, authenticated
  USING (true);

-- Verify the policy was created
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
WHERE tablename = 'subscription_plans'
ORDER BY policyname;
