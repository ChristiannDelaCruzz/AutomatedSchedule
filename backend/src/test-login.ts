// backend/src/test-login.ts
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n========================================');
console.log('🔍 LOGIN DEBUG TEST');
console.log('========================================\n');

console.log('📋 Environment Check:');
console.log('  SUPABASE_URL:', supabaseUrl || '❌ MISSING');
console.log('  SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present (' + supabaseAnonKey.substring(0, 20) + '...)' : '❌ MISSING');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Present (' + supabaseServiceKey.substring(0, 20) + '...)' : '❌ MISSING');

if (supabaseServiceKey) {
  const isValidJWT = supabaseServiceKey.startsWith('eyJ');
  console.log('  Service key format:', isValidJWT ? '✅ Valid JWT format' : '❌ INVALID');
}

console.log('\n----------------------------------------\n');

async function testLogin() {
  // ⚠️ CHANGE THESE TO YOUR ACTUAL CREDENTIALS
  const testEmail = 'christian.delacruz201@gmail.com';
  const testPassword = 'Goodperson2!';  // ← Your actual password

  console.log('🔐 Test Credentials:');
  console.log('  Email:', testEmail);
  console.log('  Password:', testPassword ? '✅ Set' : '❌ Empty');
  console.log('\n----------------------------------------\n');

  if (!testPassword || testPassword.length === 0) {
    console.log('❌ Password is empty!');
    return;
  }

  // Step 1: Create Supabase client with service role
  console.log('Step 1: Creating Supabase client...');
  const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
  console.log('  ✅ Client created\n');

  // Step 2: Test connection to auth
  console.log('Step 2: Testing Supabase Auth connection...');
  try {
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.log('  ❌ Auth admin failed:', usersError.message);
      return;
    }
    
    console.log('  ✅ Auth admin works');
    console.log('  📋 Total auth users:', usersData.users.length);
    
    const matchingUser = usersData.users.find(u => u.email === testEmail);
    if (matchingUser) {
      console.log('  ✅ Auth user found:');
      console.log('     - ID:', matchingUser.id);
      console.log('     - Email:', matchingUser.email);
      console.log('     - Confirmed:', matchingUser.email_confirmed_at ? '✅ Yes' : '❌ No');
      console.log('     - Last Sign In:', matchingUser.last_sign_in_at || 'Never');
    } else {
      console.log('  ❌ Auth user NOT FOUND for email:', testEmail);
      console.log('  📋 Available emails:');
      usersData.users.forEach(u => console.log('     -', u.email));
      return;
    }
  } catch (error: any) {
    console.log('  ❌ Exception:', error.message);
    return;
  }
  console.log('\n----------------------------------------\n');

  // Step 3: Test sign in with password
  console.log('Step 3: Testing signInWithPassword...');
  let authUser: any = null;
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.log('  ❌ Sign in failed:', authError.message);
      console.log('  Error code:', authError.status);
      console.log('\n  💡 Possible causes:');
      console.log('     - Wrong password (check the password in this file)');
      console.log('     - Email not confirmed');
      console.log('     - User banned');
      return;
    }

    authUser = authData.user;
    console.log('  ✅ Sign in successful!');
    console.log('  📋 Auth user data:');
    console.log('     - User ID:', authUser?.id);
    console.log('     - Email:', authUser?.email);
    console.log('     - Email confirmed:', authUser?.email_confirmed_at);
    console.log('     - Last sign in:', authUser?.last_sign_in_at);
  } catch (error: any) {
    console.log('  ❌ Exception:', error.message);
    return;
  }
  console.log('\n----------------------------------------\n');

  // Step 4: Test profile lookup
  console.log('Step 4: Testing profile lookup...');
  try {
    const authUserId = authUser.id;
    console.log('  🔍 Looking for profile with id:', authUserId);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (profileError) {
      console.log('  ❌ Profile lookup failed:', profileError.message);
      console.log('  Error code:', profileError.code);
      
      if (profileError.code === 'PGRST116') {
        console.log('\n  💡 The profile does NOT exist for this auth user!');
        console.log('  💡 The auth UUID and profile UUID must MATCH exactly.');
      } else if (profileError.code === '42501') {
        console.log('\n  💡 Permission denied - check RLS or service key');
      }
      return;
    }

    console.log('  ✅ Profile found:');
    console.log('     - ID:', profile.id);
    console.log('     - Email:', profile.email);
    console.log('     - Name:', profile.first_name, profile.last_name);
    console.log('     - Role:', profile.role);
    console.log('     - Active:', profile.is_active);
    console.log('     - Profile ID matches auth ID:', profile.id === authUserId ? '✅ Yes' : '❌ NO!');
  } catch (error: any) {
    console.log('  ❌ Exception:', error.message);
    return;
  }
  console.log('\n----------------------------------------\n');

  // Step 5: Verify token generation
  console.log('Step 5: Testing JWT token generation...');
  try {
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const testToken = jwt.sign(
      { id: authUser.id, email: testEmail, role: 'superadmin' },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    console.log('  ✅ Token generated successfully');
    console.log('  📋 Token preview:', testToken.substring(0, 50) + '...');
    
    const decoded = jwt.verify(testToken, jwtSecret);
    console.log('  ✅ Token verified:', decoded);
  } catch (error: any) {
    console.log('  ❌ JWT error:', error.message);
  }

  console.log('\n========================================');
  console.log('✅ TEST COMPLETE');
  console.log('========================================\n');
}

testLogin().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});