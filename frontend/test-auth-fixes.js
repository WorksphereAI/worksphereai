// Test script to verify authentication fixes
import { supabase } from './src/lib/supabase.js';

async function testAuthenticationFixes() {
  console.log('🧪 Testing Authentication Fixes...\n');

  try {
    // Test 1: Check if anonymous users can query users table (email validation)
    console.log('1️⃣ Testing anonymous email check...');
    const { data: emailCheck, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@example.com')
      .maybeSingle();

    if (emailError) {
      console.error('❌ Email check failed:', emailError.message);
    } else {
      console.log('✅ Anonymous email check works (no 500 error)');
    }

    // Test 2: Test signup flow
    console.log('\n2️⃣ Testing signup flow...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          company_name: 'Test Company'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message);
    } else {
      console.log('✅ Signup successful');
      
      // Test 3: Try immediate sign-in after signup
      console.log('\n3️⃣ Testing immediate sign-in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        console.error('❌ Immediate sign-in failed:', signInError.message);
      } else {
        console.log('✅ Immediate sign-in successful');
        console.log('📧 User email:', signInData.user?.email);
        console.log('🆔 User ID:', signInData.user?.id);
      }

      // Cleanup - sign out
      await supabase.auth.signOut();
    }

    console.log('\n🎉 Authentication fixes test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAuthenticationFixes();
