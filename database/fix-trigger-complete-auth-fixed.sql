-- ============================================
-- WORKSPHERE AI - FIX TRIGGER & COMPLETE AUTH SETUP (FIXED)
-- ============================================

SELECT '========================================' as separator;
SELECT 'FIXING TRIGGER & COMPLETING AUTH SETUP' as message;
SELECT '========================================' as separator;

-- STEP 1: FIX THE TRIGGER FUNCTION
-- ============================================

SELECT 'STEP 1: FIXING TRIGGER FUNCTION' as step_info;

-- First, drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role TEXT;
  user_full_name TEXT;
BEGIN
  -- Get values from metadata or use defaults
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  default_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'employee'
  );

  -- Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    settings,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    default_role,
    '{
      "notifications": true,
      "language": "en",
      "theme": "system",
      "onboarding_completed": false
    }'::jsonb,
    NOW(),
    NOW()
  );

  -- Log creation
  RAISE LOG 'Created user profile for: % with role: %', NEW.email, default_role;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Verify trigger was created
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgtype::text as trigger_type
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

SELECT '✅ Trigger function created successfully' as status;

-- STEP 2: CREATE MISSING BUSINESS METRICS TABLE
-- ============================================

SELECT 'STEP 2: CREATING BUSINESS METRICS TABLE' as step_info;

-- Create business_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  mrr DECIMAL(10,2) DEFAULT 0,
  arr DECIMAL(10,2) DEFAULT 0,
  active_organizations INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  paid_organizations INTEGER DEFAULT 0,
  free_organizations INTEGER DEFAULT 0,
  trial_organizations INTEGER DEFAULT 0,
  paid_conversion_rate DECIMAL(5,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  cac DECIMAL(10,2) DEFAULT 0,
  ltv DECIMAL(10,2) DEFAULT 0,
  nps_score INTEGER,
  average_revenue_per_customer DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can view business metrics" ON business_metrics;
DROP POLICY IF EXISTS "Service role can manage business metrics" ON business_metrics;

CREATE POLICY "Admins can view business metrics" ON business_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

CREATE POLICY "Service role can manage business metrics" ON business_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert initial business metrics
INSERT INTO business_metrics (date, active_organizations, total_users)
VALUES (CURRENT_DATE, 1, 0)
ON CONFLICT (date) DO NOTHING;

SELECT '✅ Business metrics table created successfully' as status;

-- STEP 3: CREATE SYSTEM HEALTH METRICS TABLE
-- ============================================

SELECT 'STEP 3: CREATING SYSTEM HEALTH METRICS TABLE' as step_info;

-- Create system_health_metrics table
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  unit TEXT,
  status TEXT CHECK (status IN ('healthy', 'degraded', 'down')),
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can view system health" ON system_health_metrics;
DROP POLICY IF EXISTS "Service role can manage system health" ON system_health_metrics;

CREATE POLICY "Admins can view system health" ON system_health_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

CREATE POLICY "Service role can manage system health" ON system_health_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert initial health metrics
INSERT INTO system_health_metrics (metric_name, metric_value, unit, status, details)
VALUES 
  ('api_latency', 45, 'ms', 'healthy', '{"p95": 120, "p99": 200}'::jsonb),
  ('database_connections', 12, 'count', 'healthy', '{"max": 100, "active": 8}'::jsonb),
  ('storage_used', 256, 'GB', 'healthy', '{"total": 1000, "available": 744}'::jsonb),
  ('active_sessions', 1245, 'count', 'healthy', '{"unique_users": 892}'::jsonb);

SELECT '✅ System health metrics table created successfully' as status;

-- STEP 4: CREATE FEATURE FLAGS TABLE
-- ============================================

SELECT 'STEP 4: CREATING FEATURE FLAGS TABLE' as step_info;

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  percentage INTEGER DEFAULT 100,
  rules JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can manage feature flags" ON feature_flags;

CREATE POLICY "Admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

-- Insert default feature flags
INSERT INTO feature_flags (name, description, enabled, percentage)
VALUES 
  ('new_dashboard', 'Enable new dashboard UI', true, 100),
  ('ai_assistant', 'Enable AI assistant features', true, 100),
  ('mobile_app', 'Enable mobile app access', true, 100),
  ('integrations', 'Enable third-party integrations', true, 100),
  ('white_label', 'Enable white labeling for enterprise', true, 50)
ON CONFLICT (name) DO NOTHING;

SELECT '✅ Feature flags table created successfully' as status;

-- STEP 5: CREATE ANNOUNCEMENTS TABLE
-- ============================================

SELECT 'STEP 5: CREATING ANNOUNCEMENTS TABLE' as step_info;

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT CHECK (type IN ('info', 'update', 'maintenance', 'critical')),
  audience TEXT CHECK (audience IN ('all', 'admins', 'customers', 'specific_orgs')),
  target_organizations UUID[],
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;

CREATE POLICY "Users can view announcements" ON announcements
  FOR SELECT USING (
    (scheduled_for IS NULL OR scheduled_for <= NOW()) AND
    (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

SELECT '✅ Announcements table created successfully' as status;

-- STEP 6: CREATE ADMIN AUDIT LOGS TABLE
-- ============================================

SELECT 'STEP 6: CREATING ADMIN AUDIT LOGS TABLE' as step_info;

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON admin_audit_logs;

CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

CREATE POLICY "Service role can insert audit logs" ON admin_audit_logs
  FOR INSERT WITH CHECK (true);

SELECT '✅ Admin audit logs table created successfully' as status;

-- STEP 7: CREATE SYSTEM ALERTS TABLE
-- ============================================

SELECT 'STEP 7: CREATING SYSTEM ALERTS TABLE' as step_info;

-- Create system_alerts table
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  category TEXT CHECK (category IN ('system', 'billing', 'security', 'performance', 'customer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  affected_entities JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can view system alerts" ON system_alerts;
DROP POLICY IF EXISTS "Admins can manage system alerts" ON system_alerts;

CREATE POLICY "Admins can view system alerts" ON system_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

CREATE POLICY "Admins can manage system alerts" ON system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

SELECT '✅ System alerts table created successfully' as status;

-- STEP 8: VERIFY ALL TABLES AND TRIGGERS
-- ============================================

SELECT 'STEP 8: VERIFYING ALL TABLES AND TRIGGERS' as step_info;

-- Check all tables
SELECT 
  'TABLES' as component_type,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM (
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
) AS t
ORDER BY table_name;

-- Check all triggers
SELECT 
  'TRIGGERS' as component_type,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check all functions
SELECT 
  'FUNCTIONS' as component_type,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check RLS status
SELECT 
  'RLS STATUS' as component_type,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Check policy count per table
SELECT 
  'POLICIES' as component_type,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

SELECT '✅ Verification completed' as status;

-- STEP 9: CREATE COMPREHENSIVE VERIFICATION FUNCTION
-- ============================================

SELECT 'STEP 9: CREATING COMPREHENSIVE VERIFICATION FUNCTION' as step_info;

-- Create function to verify complete setup
CREATE OR REPLACE FUNCTION verify_database_setup()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check tables
  RETURN QUERY
  SELECT 
    'Table: ' || table_name::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = t.table_name AND table_schema = 'public'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END,
    'Expected table'
  FROM (VALUES 
    ('users'), ('organizations'), ('departments'), 
    ('subscription_plans'), ('organization_subscriptions'),
    ('business_metrics'), ('system_health_metrics'),
    ('feature_flags'), ('announcements'), ('admin_audit_logs'),
    ('system_alerts'), ('signup_attempts'), ('email_verifications'),
    ('organization_invitations'), ('customer_success_metrics'),
    ('onboarding_progress')
  ) AS t(table_name);

  -- Check trigger
  RETURN QUERY
  SELECT 
    'Trigger: on_auth_user_created',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END,
    'Auto-creates user profiles';

  -- Check RLS
  RETURN QUERY
  SELECT 
    'RLS on: ' || tablename::TEXT,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END,
    'Row level security'
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'users', 'organizations', 'departments',
      'subscription_plans', 'organization_subscriptions',
      'business_metrics', 'system_health_metrics',
      'feature_flags', 'announcements', 'admin_audit_logs',
      'system_alerts', 'signup_attempts', 'email_verifications',
      'organization_invitations', 'customer_success_metrics',
      'onboarding_progress'
    );

  -- Check default data
  RETURN QUERY
  SELECT 
    'Data: subscription_plans',
    CASE WHEN (SELECT COUNT(*) FROM subscription_plans) >= 3 
      THEN '✅ POPULATED' ELSE '⚠️ MISSING' END,
    'Should have at least 3 plans';

  RETURN QUERY
  SELECT 
    'Data: feature_flags',
    CASE WHEN (SELECT COUNT(*) FROM feature_flags) >= 5 
      THEN '✅ POPULATED' ELSE '⚠️ MISSING' END,
    'Should have at least 5 flags';
END;
$$;

SELECT '✅ Verification function created successfully' as status;

-- STEP 10: RUN FINAL VERIFICATION
-- ============================================

SELECT 'STEP 10: RUNNING FINAL VERIFICATION' as step_info;

SELECT '========================================' as separator;
SELECT 'FINAL VERIFICATION REPORT' as message;
SELECT '========================================' as separator;

-- Run verification
SELECT * FROM verify_database_setup();

SELECT '========================================' as separator;
SELECT 'AUTHENTICATION SYSTEM SETUP COMPLETE!' as message;
SELECT '========================================' as separator;

-- Summary
SELECT 
  'SUMMARY' as section,
  'Tables Created' as metric,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as value
UNION ALL
SELECT 
  'SUMMARY' as section,
  'Triggers Created' as metric,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as value
UNION ALL
SELECT 
  'SUMMARY' as section,
  'Functions Created' as metric,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as value
UNION ALL
SELECT 
  'SUMMARY' as section,
  'RLS Enabled Tables' as metric,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as value
UNION ALL
SELECT 
  'SUMMARY' as section,
  'Total Policies' as metric,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as value;
