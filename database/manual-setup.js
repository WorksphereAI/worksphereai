const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Hardcoded credentials for immediate setup
const supabaseUrl = 'https://gibecealgjhbadjhiflu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYmVjZWFsZ2poYmFkamhpZmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjQ3NTksImV4cCI6MjA4Nzg0MDc1OX0.5wVUV85GumWD_2Z1ccOVMBA4PqfxLy0ABuzGuN1_894'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up WorkSphere AI database...')
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Database schema loaded successfully')
    console.log('📋 Please execute the following SQL in your Supabase SQL Editor:')
    console.log('\n' + '='.repeat(80))
    console.log(schema)
    console.log('='.repeat(80))
    console.log('\n✅ Setup instructions provided!')
    
    console.log('\n📋 Next steps:')
    console.log('1. Go to your Supabase project: https://gibecealgjhbadjhiflu.supabase.co')
    console.log('2. Open SQL Editor')
    console.log('3. Copy and paste the schema above')
    console.log('4. Execute the SQL')
    console.log('5. Create storage bucket "worksphere-files"')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()
