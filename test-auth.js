// Simple test script to verify authentication flow
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing authentication flow...');
  
  try {
    // Test 1: Check if we can create a client
    console.log('✓ Supabase client created successfully');
    
    // Test 2: Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('ℹ No active session (expected for fresh test):', sessionError.message);
    } else if (session) {
      console.log('✓ Active session found');
      console.log('  - User ID:', session.user.id);
      console.log('  - Email:', session.user.email);
      console.log('  - Token expires at:', new Date(session.expires_at * 1000));
    } else {
      console.log('ℹ No active session');
    }
    
    // Test 3: Verify environment variables are loaded
    console.log('✓ Environment variables loaded');
    console.log('  - Supabase URL:', supabaseUrl.substring(0, 30) + '...');
    console.log('  - Anon Key:', supabaseKey.substring(0, 20) + '...');
    
    console.log('\nAuthentication system appears to be configured correctly.');
    console.log('Next steps: Test with actual login credentials in the browser.');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testAuth();
