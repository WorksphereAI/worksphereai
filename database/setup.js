const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '../frontend/.env' })

console.log('Environment variables loaded:')
console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET')
console.log('SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up WorkSphere AI database...')
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Executing database schema...')
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
        if (error) {
          console.error('Error executing statement:', error)
          console.log('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log('✅ Database schema created successfully!')
    
    // Create storage buckets for files
    console.log('📁 Creating storage buckets...')
    
    const { error: bucketError } = await supabase.storage.createBucket('worksphere-files', {
      public: false,
      allowedMimeTypes: ['*/*'],
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating bucket:', bucketError)
    } else {
      console.log('✅ Storage bucket created successfully!')
    }
    
    console.log('\n🎉 WorkSphere AI database setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up your Supabase project with the provided schema')
    console.log('2. Configure Cloudinary credentials in frontend/.env')
    console.log('3. Run the frontend application: npm run dev')
    console.log('4. Create test users through the Supabase dashboard')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Alternative setup using direct SQL execution
async function setupDatabaseDirect() {
  try {
    console.log('🚀 Setting up WorkSphere AI database (direct mode)...')
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Please execute the following SQL in your Supabase SQL Editor:')
    console.log('\n' + '='.repeat(80))
    console.log(schema)
    console.log('='.repeat(80))
    console.log('\n📋 After executing the SQL:')
    console.log('1. Create storage bucket "worksphere-files" in Supabase dashboard')
    console.log('2. Configure Cloudinary credentials in frontend/.env')
    console.log('3. Run the frontend application: npm run dev')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Check if we have service key for automated setup
if (supabaseServiceKey) {
  setupDatabase()
} else {
  console.log('⚠️  SUPABASE_SERVICE_KEY not found. Running in manual setup mode.')
  setupDatabaseDirect()
}
