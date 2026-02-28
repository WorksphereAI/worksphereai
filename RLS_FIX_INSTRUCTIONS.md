# RLS Policy Fix Instructions

## Issue: Infinite Recursion in Users Table RLS Policies

The error `infinite recursion detected in policy for relation "users"` (PostgreSQL code 42P17) is blocking all database operations.

## Solution: Run this SQL in Supabase SQL Editor

Go to your Supabase dashboard → SQL Editor → New query and run:

```sql
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
```

## Verification

After running the SQL, test by refreshing your app. The infinite recursion errors should disappear.

## Additional Issues

1. **Google OAuth Error**: "The given origin is not allowed for the given client ID"
   - Fix: Add your localhost origin to Google OAuth console
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add `http://localhost:5173` to Authorized JavaScript origins

2. **Missing Components**: Several responsive page components are imported but may not exist
   - Check: ResponsiveMessages, ResponsiveTasks, ResponsiveDocuments, ResponsiveApprovals, ResponsiveProfile
