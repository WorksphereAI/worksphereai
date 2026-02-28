-- Fix infinite recursion in RLS policies
-- This occurs when policies reference the same table they're protecting

-- ============================================
-- FIX USERS TABLE RLS POLICIES
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- FIX ORGANIZATIONS TABLE RLS POLICIES
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON organizations;
DROP POLICY IF EXISTS "Service role can manage organizations" ON organizations;

-- Create new non-recursive policies
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.organization_id = organizations.id 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update own organization" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.organization_id = organizations.id 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage organizations" ON organizations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check users table policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Check organizations table policies  
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY policyname;
