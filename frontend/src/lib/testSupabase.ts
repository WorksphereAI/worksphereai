// src/lib/testSupabase.ts
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

  try {
    // Test 1: Check if we can connect
    const { error } = await supabase
      .from('subscription_plans')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }

    console.log('✅ Basic connection successful');

    // Test 2: Try anonymous insert (should be allowed by RLS)
    const testEmail = `test-${Date.now()}@example.com`;
    const { error: insertError } = await supabase
      .from('signup_attempts')
      .insert([{
        email: testEmail,
        user_type: 'individual',
        full_name: 'Test User',
        status: 'pending'
      }]);

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('   This might be an RLS issue');
    } else {
      console.log('✅ Anonymous insert successful');
    }

    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(ok => {
  if (ok) {
    console.log('✅ Supabase is properly configured!');
  } else {
    console.log('❌ Supabase configuration needs attention');
  }
});
