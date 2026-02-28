// Temporary script to fix RLS policies
// Run this in browser console when authenticated
import { supabase } from './src/lib/supabase.js';

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies...');
  
  try {
    // Execute the SQL fix
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
      console.error('❌ Error fixing policies:', error);
      return;
    }
    
    console.log('✅ RLS policies fixed successfully!');
    
    // Test the fix by trying to read user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userError) {
      console.error('❌ Still getting error after fix:', userError);
    } else {
      console.log('✅ User profile access working!');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Auto-run
fixRLSPolicies();
