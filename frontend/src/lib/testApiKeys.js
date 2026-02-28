// Test both possible URLs with the current API key
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYmVjZWFsZ2poYmFkamhpZmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjQ3NTksImV4cCI6MjA4Nzg0MDc1OX0.5wVUV85GumWD_2Z1ccOVMBA4PqfxLy0ABuzGuN1_894';

const urls = [
  'https://gibecealgjhbadjhiflu.supabase.co',  // Current in .env
  'https://gibeceasgjhbadjhiflu.supabase.co'   // From JWT
];

async function testUrl(url) {
  console.log(`🔍 Testing: ${url}`);
  
  try {
    const response = await fetch(`${url}/rest/v1/subscription_plans?select=count`, {
      method: 'HEAD',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.ok) {
      console.log(`   ✅ SUCCESS: This URL works with the current API key`);
      return url;
    } else {
      console.log(`   ❌ FAILED: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  return null;
}

async function findCorrectUrl() {
  console.log('🔍 Testing which URL works with your current API key...\n');
  
  for (const url of urls) {
    const workingUrl = await testUrl(url);
    if (workingUrl) {
      console.log(`\n✅ FOUND: Use this URL in your .env file:`);
      console.log(`VITE_SUPABASE_URL=${workingUrl}`);
      return;
    }
  }
  
  console.log('\n❌ Neither URL works. You may need a new API key.');
}

findCorrectUrl();
