-- Add only the missing anonymous email check policy
-- This fixes the 500 error without affecting existing policies

CREATE POLICY "Allow anonymous email check" ON users
    FOR SELECT USING (true);

-- Verify all policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;
