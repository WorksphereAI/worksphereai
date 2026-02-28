-- Quick fix for immediate resolution - run this in Supabase SQL Editor

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous email check" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Create policies for anonymous email checking
CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT USING (true);

-- Create policy for authenticated users
CREATE POLICY "Users can manage own profile" ON users
    FOR ALL USING (auth.uid() = id);

-- Create policy for service role
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';
