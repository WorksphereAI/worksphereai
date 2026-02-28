// src/lib/testSupabase.ts
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('Key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

  try {
    // Test 1: Simple health check using auth session
    console.log('📋 Test 1: Checking auth session...');
    const { error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Auth session check failed:', sessionError);
    } else {
      console.log('✅ Auth session check passed');
    }

    // Test 2: Try to access a simple table that should allow anonymous access
    console.log('📋 Test 2: Testing subscription_plans access...');
    const { error: plansError } = await supabase
      .from('subscription_plans')
      .select('count', { count: 'exact', head: true });

    if (plansError) {
      console.error('❌ Subscription plans test failed:', {
        message: plansError.message,
        details: plansError.details,
        hint: plansError.hint,
        code: plansError.code
      });
      
      if (plansError.code === '401' || plansError.message.includes('Invalid API key')) {
        console.log('💡 This suggests an API key issue or RLS policy problem');
        console.log('   - Check if VITE_SUPABASE_ANON_KEY is correct');
        console.log('   - Run: database/check-subscription-plans-rls.sql');
      }
    } else {
      console.log('✅ Subscription plans access successful');
    }

    // Test 3: Try anonymous insert (should be allowed by RLS)
    console.log('📋 Test 3: Testing anonymous signup attempt...');
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
      console.error('❌ Insert test failed:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      console.log('   This might be an RLS issue with signup_attempts');
    } else {
      console.log('✅ Anonymous insert successful');
    }

    return !plansError && !insertError;
  } catch (err: any) {
    console.error('❌ Unexpected error:', {
      message: err.message,
      stack: err.stack
    });
    return false;
  }
}

// Run the test
testSupabaseConnection().then(ok => {
  if (ok) {
    console.log('✅ Supabase is properly configured!');
  } else {
    console.log('❌ Supabase configuration needs attention');
    console.log('💡 Next steps:');
    console.log('   1. Check your Supabase project settings');
    console.log('   2. Verify the anon key in your .env file');
    console.log('   3. Run the SQL scripts in the database folder');
  }
});
