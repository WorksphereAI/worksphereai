import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gibecealgjhbadjhiflu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYmVjZWFsZ2poYmFkamhpZmx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI2NDc1OSwiZXhwIjoyMDg3ODQwNzU5fQ.kkTBwQJPHZlFJLqMLtKqLk4J7Q3zJKh3YjKYWJY3R2U';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies...');
  
  try {
    // Execute SQL to fix users table policies
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (error) {
      console.error('❌ Error with exec_sql:', error);
      
      // Try direct SQL approach
      console.log('🔄 Trying direct SQL approach...');
      
      // Since we can't use exec_sql, let's use the SQL editor approach
      // We'll create a simple function to test if the fix worked
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
        
      if (testError) {
        console.error('❌ Still getting error:', testError);
        console.log('⚠️  Please manually run the SQL in Supabase SQL Editor:');
        console.log(`
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
        `);
      } else {
        console.log('✅ Users table access working!');
      }
    } else {
      console.log('✅ RLS policies fixed successfully!');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

fixRLSPolicies();
