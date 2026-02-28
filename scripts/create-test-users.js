// scripts/create-test-users.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test user data
const testUsers = [
  // Enterprise CEOs
  { email: 'ceo@rdb.rw', password: 'Test@123456', full_name: 'John Mugabo', role: 'ceo', organization_slug: 'rdb-rwanda', phone: '+250788123001' },
  { email: 'ceo@bk.rw', password: 'Test@123456', full_name: 'Marie Uwase', role: 'ceo', organization_slug: 'bk-rwanda', phone: '+250788123002' },
  { email: 'ceo@safaricom.co.ke', password: 'Test@123456', full_name: 'Peter Njoroge', role: 'ceo', organization_slug: 'safaricom-ke', phone: '+254722123001' },
  
  // Admins
  { email: 'admin@rdb.rw', password: 'Test@123456', full_name: 'Jean Paul', role: 'admin', organization_slug: 'rdb-rwanda', phone: '+250788123003' },
  { email: 'admin@bk.rw', password: 'Test@123456', full_name: 'Diane Uwamahoro', role: 'admin', organization_slug: 'bk-rwanda', phone: '+250788123004' },
  { email: 'admin@safaricom.co.ke', password: 'Test@123456', full_name: 'James Mwangi', role: 'admin', organization_slug: 'safaricom-ke', phone: '+254722123002' },
  
  // Managers
  { email: 'manager@rdb.rw', password: 'Test@123456', full_name: 'Alice Mukamana', role: 'manager', organization_slug: 'rdb-rwanda', phone: '+250788123005' },
  { email: 'manager@bk.rw', password: 'Test@123456', full_name: 'Eric Habimana', role: 'manager', organization_slug: 'bk-rwanda', phone: '+250788123006' },
  { email: 'manager@mtn.co.rw', password: 'Test@123456', full_name: 'Grace Uwase', role: 'manager', organization_slug: 'mtn-rwanda', phone: '+250788123007' },
  
  // Employees
  { email: 'employee1@rdb.rw', password: 'Test@123456', full_name: 'Patrick Ndayishimiye', role: 'employee', organization_slug: 'rdb-rwanda', phone: '+250788123008' },
  { email: 'employee2@rdb.rw', password: 'Test@123456', full_name: 'Claudine Uwase', role: 'employee', organization_slug: 'rdb-rwanda', phone: '+250788123009' },
  { email: 'employee1@bk.rw', password: 'Test@123456', full_name: 'Emmanuel Ndayisaba', role: 'employee', organization_slug: 'bk-rwanda', phone: '+250788123010' },
  { email: 'employee1@safaricom.co.ke', password: 'Test@123456', full_name: 'Lucy Wanjiku', role: 'employee', organization_slug: 'safaricom-ke', phone: '+254722123003' },
  
  // Individual users
  { email: 'freelancer@example.com', password: 'Test@123456', full_name: 'Sarah Johnson', role: 'employee', organization_slug: null, phone: '+250788123011' },
  { email: 'consultant@example.com', password: 'Test@123456', full_name: 'David Murenzi', role: 'employee', organization_slug: null, phone: '+250788123012' },
  
  // Customer portal users
  { email: 'customer1@company.com', password: 'Test@123456', full_name: 'John Customer', role: 'customer', organization_slug: null, phone: '+250788123013' },
  { email: 'customer2@company.com', password: 'Test@123456', full_name: 'Jane Client', role: 'customer', organization_slug: null, phone: '+250788123014' },
  
  // Platform admin
  { email: 'admin@worksphere.ai', password: 'Admin@123456', full_name: 'System Administrator', role: 'admin', organization_slug: null, phone: '+250788123999' }
];

async function createTestUsers() {
  console.log('🚀 Starting test user creation...\n');
  
  try {
    // First, get organization IDs
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, slug');
    
    if (orgError) {
      console.error('❌ Failed to fetch organizations:', orgError.message);
      return;
    }
    
    const orgMap = {};
    organizations?.forEach(org => {
      orgMap[org.slug] = org.id;
    });
    
    console.log(`✅ Found ${organizations?.length} organizations\n`);
    
    let successCount = 0;
    let failCount = 0;
    const createdUsers = [];
    
    for (const user of testUsers) {
      try {
        console.log(`Creating user: ${user.email}...`);
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (existingUser) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          continue;
        }
        
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
            phone: user.phone
          }
        });
        
        if (authError) {
          console.error(`❌ Failed to create auth user ${user.email}:`, authError.message);
          failCount++;
          continue;
        }
        
        // Insert into public.users
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: authUser.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            organization_id: user.organization_slug ? orgMap[user.organization_slug] : null,
            phone: user.phone,
            settings: {
              notifications: true,
              language: 'en',
              theme: 'light',
              timezone: 'Africa/Kigali'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (userError) {
          console.error(`❌ Failed to insert user ${user.email}:`, userError.message);
          
          // Rollback auth user
          await supabase.auth.admin.deleteUser(authUser.user.id);
          failCount++;
        } else {
          console.log(`✅ Created user: ${user.email} (${user.role})`);
          successCount++;
          createdUsers.push({
            email: user.email,
            password: user.password,
            full_name: user.full_name,
            role: user.role,
            organization: user.organization_slug || 'Individual'
          });
        }
        
      } catch (error) {
        console.error(`❌ Unexpected error for ${user.email}:`, error.message);
        failCount++;
      }
    }
    
    console.log(`\n📊 Summary: ${successCount} users created, ${failCount} failures`);
    console.log('\n🔑 All passwords: Test@123456 (except admin@worksphere.ai: Admin@123456)');
    
    // Group users by role for display
    const usersByRole = {};
    createdUsers.forEach(user => {
      if (!usersByRole[user.role]) usersByRole[user.role] = [];
      usersByRole[user.role].push(user);
    });
    
    console.log('\n📋 Created User Credentials:\n');
    for (const [role, users] of Object.entries(usersByRole)) {
      console.log(`\n${role.toUpperCase()}:`);
      users.forEach(u => {
        console.log(`  - ${u.email} (${u.full_name}) - ${u.organization}`);
      });
    }
    
    // Create a credentials file
    const credentialsContent = `# WorkSphere AI Test User Credentials
# Generated on ${new Date().toISOString()}

## 🔐 UNIVERSAL PASSWORD
All users (except platform admin): Test@123456
Platform admin: Admin@123456

## 📋 USER CREDENTIALS

${Object.entries(usersByRole).map(([role, users]) => `
### ${role.toUpperCase()}
${users.map(u => `- ${u.email} | ${u.full_name} | ${u.organization}`).join('\n')}
`).join('\n')}

## 🎯 QUICK LOGIN LINKS
- Enterprise CEO: http://localhost:5173/login (use ceo@rdb.rw)
- Admin: http://localhost:5173/login (use admin@rdb.rw)
- Manager: http://localhost:5173/login (use manager@rdb.rw)
- Employee: http://localhost:5173/login (use employee1@rdb.rw)
- Individual: http://localhost:5173/login (use freelancer@example.com)
- Customer: http://localhost:5173/login (use customer1@company.com)
- Platform Admin: http://localhost:5173/login (use admin@worksphere.ai)

## 🏢 ORGANIZATIONS
- Rwanda Development Board (Enterprise)
- Bank of Kigali (Enterprise)
- Safaricom Kenya (Enterprise)
- MTN Rwanda (Professional)
- Equity Bank Kenya (Professional)
- MTN Uganda (Professional)
- Vodacom Tanzania (Enterprise - Past Due)
- Kigali Heights Mall (Professional - Canceled)
- Kigali Tech Solutions (Starter - Trial)
- Kigali Digital Agency (Starter - Trial)

## 📊 SUBSCRIPTION STATUS
- Active: RDB, Bank of Kigali, Safaricom Kenya, MTN Rwanda, Equity Bank Kenya, MTN Uganda
- Trial: Kigali Tech Solutions, Kigali Digital Agency
- Past Due: Vodacom Tanzania
- Canceled: Kigali Heights Mall
`;
    
    // Write credentials to file
    const fs = require('fs');
    fs.writeFileSync('test-user-credentials.md', credentialsContent);
    console.log('\n📄 Credentials saved to: test-user-credentials.md');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Test the connection first
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Testing database connection...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('\n❌ Please check your database connection and try again.');
    process.exit(1);
  }
  
  await createTestUsers();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestUsers, testConnection };
