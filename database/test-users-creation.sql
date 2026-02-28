-- WorkSphere AI - Comprehensive Test Users Creation Script
-- Run this AFTER all schemas are installed

-- ============================================
-- PART 1: CREATE TEST ORGANIZATIONS
-- ============================================

-- Create Rwanda-based test organizations
INSERT INTO organizations (id, name, slug, settings, created_at)
VALUES 
  -- Enterprise organizations
  (gen_random_uuid(), 'Rwanda Development Board', 'rdb-rwanda', 
   '{"country": "Rwanda", "city": "Kigali", "timezone": "Africa/Kigali", "language": "en", "currency": "RWF", "industry": "Government", "employee_count": 500, "phone": "+250788123456", "website": "https://rdb.rw"}'::jsonb, 
   NOW() - INTERVAL '6 months'),
  
  (gen_random_uuid(), 'Bank of Kigali', 'bk-rwanda', 
   '{"country": "Rwanda", "city": "Kigali", "timezone": "Africa/Kigali", "language": "en", "currency": "RWF", "industry": "Finance", "employee_count": 1200, "phone": "+250788123457", "website": "https://bk.rw"}'::jsonb, 
   NOW() - INTERVAL '1 year'),
  
  (gen_random_uuid(), 'MTN Rwanda', 'mtn-rwanda', 
   '{"country": "Rwanda", "city": "Kigali", "timezone": "Africa/Kigali", "language": "en", "currency": "RWF", "industry": "Telecommunications", "employee_count": 800, "phone": "+250788123458", "website": "https://mtn.co.rw"}'::jsonb, 
   NOW() - INTERVAL '8 months'),
  
  (gen_random_uuid(), 'Kigali Heights Mall', 'kigali-heights', 
   '{"country": "Rwanda", "city": "Kigali", "timezone": "Africa/Kigali", "language": "en", "currency": "RWF", "industry": "Real Estate", "employee_count": 150, "phone": "+250788123459", "website": "https://kigaliheights.rw"}'::jsonb, 
   NOW() - INTERVAL '3 months'),
  
  -- Kenyan organizations
  (gen_random_uuid(), 'Safaricom Kenya', 'safaricom-ke', 
   '{"country": "Kenya", "city": "Nairobi", "timezone": "Africa/Nairobi", "language": "en", "currency": "KES", "industry": "Telecommunications", "employee_count": 2500, "phone": "+254722123456", "website": "https://safaricom.co.ke"}'::jsonb, 
   NOW() - INTERVAL '1 year'),
  
  (gen_random_uuid(), 'Equity Bank Kenya', 'equity-ke', 
   '{"country": "Kenya", "city": "Nairobi", "timezone": "Africa/Nairobi", "language": "en", "currency": "KES", "industry": "Finance", "employee_count": 1800, "phone": "+254722123457", "website": "https://equitybank.co.ke"}'::jsonb, 
   NOW() - INTERVAL '9 months'),
  
  -- Ugandan organizations
  (gen_random_uuid(), 'MTN Uganda', 'mtn-ug', 
   '{"country": "Uganda", "city": "Kampala", "timezone": "Africa/Kampala", "language": "en", "currency": "UGX", "industry": "Telecommunications", "employee_count": 950, "phone": "+256772123456", "website": "https://mtn.co.ug"}'::jsonb, 
   NOW() - INTERVAL '7 months'),
  
  -- Tanzanian organizations
  (gen_random_uuid(), 'Vodacom Tanzania', 'vodacom-tz', 
   '{"country": "Tanzania", "city": "Dar es Salaam", "timezone": "Africa/Dar_es_Salaam", "language": "en", "currency": "TZS", "industry": "Telecommunications", "employee_count": 1100, "phone": "+255752123456", "website": "https://vodacom.co.tz"}'::jsonb, 
   NOW() - INTERVAL '5 months'),
  
  -- Small/Individual organizations
  (gen_random_uuid(), 'Kigali Tech Solutions', 'kigali-tech', 
   '{"country": "Rwanda", "city": "Kigali", "timezone": "Africa/Kigali", "language": "en", "currency": "RWF", "industry": "Technology", "employee_count": 12, "phone": "+250788123460", "website": "https://kigalitech.rw"}'::jsonb, 
   NOW() - INTERVAL '2 months'),
  
  (gen_random_uuid(), 'Kigali Digital Agency', 'kigali-digital', 
   '{"country": "Rwanda", "city": "Kigali", "timezone": "Africa/Kigali", "language": "en", "currency": "RWF", "industry": "Marketing", "employee_count": 8, "phone": "+250788123461", "website": "https://kigaligital.rw"}'::jsonb, 
   NOW() - INTERVAL '1 month');

-- ============================================
-- PART 2: CREATE DEPARTMENTS
-- ============================================

-- Insert departments for organizations
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id, name FROM organizations LOOP
    -- Executive department
    INSERT INTO departments (name, organization_id, settings)
    VALUES ('Executive', org_record.id, '{"type": "management", "priority": 1}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Sales department
    INSERT INTO departments (name, organization_id, settings)
    VALUES ('Sales', org_record.id, '{"type": "revenue", "priority": 2}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Marketing department
    INSERT INTO departments (name, organization_id, settings)
    VALUES ('Marketing', org_record.id, '{"type": "revenue", "priority": 2}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- IT department
    INSERT INTO departments (name, organization_id, settings)
    VALUES ('Information Technology', org_record.id, '{"type": "support", "priority": 3}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- HR department
    INSERT INTO departments (name, organization_id, settings)
    VALUES ('Human Resources', org_record.id, '{"type": "support", "priority": 3}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Finance department
    INSERT INTO departments (name, organization_id, settings)
    VALUES ('Finance', org_record.id, '{"type": "support", "priority": 3}'::jsonb)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- PART 3: CREATE SAMPLE CHANNELS
-- ============================================

-- Create sample channels for organizations
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id, name FROM organizations LOOP
    -- General channel
    INSERT INTO channels (name, type, organization_id, settings)
    VALUES ('General', 'announcement', org_record.id, '{"is_default": true}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Sales channel
    INSERT INTO channels (name, type, organization_id, settings)
    VALUES ('Sales Team', 'department', org_record.id, '{"department": "Sales"}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Marketing channel
    INSERT INTO channels (name, type, organization_id, settings)
    VALUES ('Marketing Team', 'department', org_record.id, '{"department": "Marketing"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- PART 4: CREATE SAMPLE ACTIVITY LOGS
-- ============================================

-- Generate sample activity logs for the last 30 days
DO $$
DECLARE
  day_offset INTEGER;
  org_record RECORD;
  user_id UUID := '00000000-0000-0000-0000-000000000001'; -- Placeholder
  event_types TEXT[] := ARRAY['login', 'message_sent', 'task_completed', 'document_uploaded', 'user_created'];
  event_type TEXT;
BEGIN
  FOR day_offset IN 0..29 LOOP
    FOR org_record IN SELECT id FROM organizations LIMIT 5 LOOP
      -- Generate 5-20 random events per org per day
      FOR i IN 1..(5 + floor(random() * 15)::int) LOOP
        event_type := event_types[1 + floor(random() * array_length(event_types, 1))::int];
        
        INSERT INTO activity_logs (
          organization_id, user_id, action, entity_type, entity_id, created_at
        ) VALUES (
          org_record.id,
          user_id,
          event_type,
          CASE 
            WHEN event_type = 'message_sent' THEN 'message'
            WHEN event_type = 'task_completed' THEN 'task'
            WHEN event_type = 'document_uploaded' THEN 'document'
            ELSE 'user'
          END,
          gen_random_uuid(),
          NOW() - (day_offset || ' days')::interval - (floor(random() * 86400)::int || ' seconds')::interval
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- PART 5: DISPLAY TEST CREDENTIALS SUMMARY
-- ============================================

-- Display organization information
SELECT 
  '🎯 WORKSPHERE AI - TEST ORGANIZATIONS' as " ";
  
SELECT 
  name as "Organization", 
  slug as "Slug", 
  (settings->>'industry') as "Industry", 
  (settings->>'employee_count') as "Size",
  (settings->>'country') as "Country"
FROM organizations
ORDER BY (settings->>'employee_count')::integer DESC;

-- Display department information
SELECT 
  '📊 DEPARTMENTS CREATED' as " ";

SELECT 
  o.name as "Organization",
  d.name as "Department",
  d.settings->>'type' as "Type"
FROM departments d
JOIN organizations o ON d.organization_id = o.id
ORDER BY o.name, d.name;

-- Display channel information
SELECT 
  '💬 CHANNELS CREATED' as " ";

SELECT 
  o.name as "Organization",
  c.name as "Channel",
  c.type as "Type"
FROM channels c
JOIN organizations o ON c.organization_id = o.id
ORDER BY o.name, c.name;

SELECT 
  '📝 NOTES:' as " ";
  
SELECT 
  '1. Run the Node.js script to create actual auth users' as "Note 1";
  
SELECT 
  '2. All test passwords: Test@123456' as "Note 2";
  
SELECT 
  '3. Test different user roles and organizations' as "Note 3";

-- ============================================
-- COMPLETION
-- ============================================

COMMIT;

SELECT '✅ Test organizations and sample data created successfully!' as "Status";
SELECT '🚀 Now run the Node.js script to create auth users' as "Next Step";
