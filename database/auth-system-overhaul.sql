-- ============================================
-- WORKSPHERE AI - COMPLETE AUTH SYSTEM OVERHAUL
-- ============================================

-- STEP 1: CHECK EXISTING STRUCTURE
-- ============================================

-- Check existing tables
SELECT 'CHECKING EXISTING TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check existing policies
SELECT 'CHECKING EXISTING POLICIES:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check existing functions
SELECT 'CHECKING EXISTING FUNCTIONS:' as info;
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- STEP 2: CLEAN UP EXISTING TABLES (CAREFULLY)
-- ============================================

SELECT 'DROPPING EXISTING TABLES:' as info;

-- Drop tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS webhook_errors CASCADE;
DROP TABLE IF EXISTS stripe_checkout_sessions CASCADE;
DROP TABLE IF EXISTS usage_metrics CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS subscription_invoices CASCADE;
DROP TABLE IF EXISTS organization_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS signup_attempts CASCADE;
DROP TABLE IF EXISTS customer_success_metrics CASCADE;
DROP TABLE IF EXISTS onboarding_progress CASCADE;
DROP TABLE IF EXISTS organization_invitations CASCADE;
DROP TABLE IF EXISTS phone_verifications CASCADE;
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP TABLE IF EXISTS system_alerts CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS system_health_metrics CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS integration_usage_analytics CASCADE;
DROP TABLE IF EXISTS integration_reviews CASCADE;
DROP TABLE IF EXISTS integration_marketplace CASCADE;
DROP TABLE IF EXISTS sync_execution_logs CASCADE;
DROP TABLE IF EXISTS data_sync_configurations CASCADE;
DROP TABLE IF EXISTS api_connections CASCADE;
DROP TABLE IF EXISTS webhook_event_logs CASCADE;
DROP TABLE IF EXISTS webhook_endpoints CASCADE;
DROP TABLE IF EXISTS integration_instances CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS signup_analytics CASCADE;
DROP TABLE IF EXISTS document_tag_relations CASCADE;
DROP TABLE IF EXISTS document_tags CASCADE;
DROP TABLE IF EXISTS document_comments CASCADE;
DROP TABLE IF EXISTS document_shares CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS track_usage CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read CASCADE;
DROP FUNCTION IF EXISTS get_organization_usage CASCADE;
DROP FUNCTION IF EXISTS get_executive_dashboard CASCADE;
DROP FUNCTION IF EXISTS calculate_engagement_score CASCADE;
DROP FUNCTION IF EXISTS update_activity_heatmap CASCADE;
DROP FUNCTION IF EXISTS cache_performance_metric CASCADE;
DROP FUNCTION IF EXISTS test_api_connection CASCADE;
DROP FUNCTION IF EXISTS trigger_webhook CASCADE;
DROP FUNCTION IF EXISTS execute_data_sync CASCADE;
DROP FUNCTION IF EXISTS log_integration_usage CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_tokens CASCADE;
DROP FUNCTION IF EXISTS generate_verification_token CASCADE;
DROP FUNCTION IF EXISTS generate_phone_code CASCADE;
DROP FUNCTION IF EXISTS get_user_by_email CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

SELECT 'CLEANUP COMPLETED - STARTING FRESH SETUP:' as info;

-- STEP 3: CREATE CORE TABLES IN CORRECT ORDER
-- ============================================

-- 1. ORGANIZATIONS TABLE (no foreign keys)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  employee_count INTEGER,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS TABLE (references organizations)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('ceo', 'admin', 'manager', 'employee', 'customer')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  department_id UUID,
  avatar_url TEXT,
  last_active TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{
    "notifications": true,
    "language": "en",
    "theme": "system",
    "onboarding_completed": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DEPARTMENTS TABLE (references organizations and users)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add department_id foreign key to users (after departments table exists)
ALTER TABLE users 
  ADD CONSTRAINT fk_users_department 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- 4. SIGNUP ATTEMPTS TABLE (tracks signup process)
CREATE TABLE signup_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('enterprise', 'individual', 'customer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'email_sent', 'verified', 'completed', 'failed')),
  organization_name TEXT,
  full_name TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 5. EMAIL VERIFICATIONS TABLE
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'signup' CHECK (type IN ('signup', 'invitation', 'password_reset')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- 6. ORGANIZATION INVITATIONS TABLE
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- 7. SUBSCRIPTION PLANS TABLE
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stripe_price_id TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'RWF',
  features JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 50,
  max_bandwidth_gb INTEGER DEFAULT 500,
  white_label BOOLEAN DEFAULT FALSE,
  custom_domain BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ORGANIZATION SUBSCRIPTIONS TABLE
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid', 'inactive')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  payment_method TEXT CHECK (payment_method IN ('card', 'mobile_money', 'bank_transfer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CUSTOMER SUCCESS METRICS TABLE
CREATE TABLE customer_success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  health_score INTEGER DEFAULT 100,
  engagement_score INTEGER DEFAULT 100,
  support_tickets_count INTEGER DEFAULT 0,
  feature_adoption JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ONBOARDING PROGRESS TABLE
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  steps_completed JSONB DEFAULT '[]',
  steps_skipped JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

SELECT 'CORE TABLES CREATED SUCCESSFULLY' as info;

-- STEP 4: CREATE INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_last_active ON users(last_active DESC);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);

CREATE INDEX idx_signup_attempts_email ON signup_attempts(email);
CREATE INDEX idx_signup_attempts_status ON signup_attempts(status);
CREATE INDEX idx_signup_attempts_created_at ON signup_attempts(created_at DESC);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_status ON email_verifications(status);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

CREATE INDEX idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX idx_organization_invitations_status ON organization_invitations(status);

CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_organization_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX idx_organization_subscriptions_status ON organization_subscriptions(status);

CREATE INDEX idx_onboarding_progress_user ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_org ON onboarding_progress(organization_id);

SELECT 'INDEXES CREATED SUCCESSFULLY' as info;

-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

SELECT 'RLS ENABLED ON ALL TABLES' as info;

-- STEP 6: CREATE RLS POLICIES
-- ============================================

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

CREATE POLICY "Service role can manage organizations" ON organizations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users policies
CREATE POLICY "Users can view themselves" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view others in their organization" ON users
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update themselves" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage users in their organization" ON users
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Departments policies
CREATE POLICY "Users can view departments in their organization" ON departments
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

-- Signup attempts policies (service role only - no public access)
CREATE POLICY "Service role can manage signup attempts" ON signup_attempts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Email verifications policies
CREATE POLICY "Service role can manage email verifications" ON email_verifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Organization invitations policies
CREATE POLICY "Users can view invitations for their organization" ON organization_invitations
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations" ON organization_invitations
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin', 'manager'))
  );

CREATE POLICY "Service role can manage invitations" ON organization_invitations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage subscription plans" ON subscription_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Organization subscriptions policies
CREATE POLICY "Users can view their organization's subscription" ON organization_subscriptions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage subscription" ON organization_subscriptions
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

-- Customer success metrics policies
CREATE POLICY "Users can view their metrics" ON customer_success_metrics
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Service role can manage metrics" ON customer_success_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Onboarding progress policies
CREATE POLICY "Users can manage their onboarding" ON onboarding_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view org onboarding" ON onboarding_progress
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

SELECT 'RLS POLICIES CREATED SUCCESSFULLY' as info;

-- STEP 7: INSERT DEFAULT DATA
-- ============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, max_users, max_storage_gb)
VALUES 
  ('Starter', 9900, 99000, '{"messaging": true, "tasks": true, "documents": true, "basic_analytics": true}'::jsonb, 10, 50),
  ('Professional', 29900, 299000, '{"messaging": true, "tasks": true, "documents": true, "advanced_analytics": true, "integrations": true}'::jsonb, 50, 200),
  ('Enterprise', 99900, 999000, '{"messaging": true, "tasks": true, "documents": true, "advanced_analytics": true, "integrations": true, "white_label": true, "api_access": true}'::jsonb, 500, 1000);

-- Insert default organization
INSERT INTO organizations (name, slug, email)
VALUES ('WorkSphere Technologies', 'worksphere-technologies', 'info@worksphere.ai')
ON CONFLICT (slug) DO NOTHING;

SELECT 'DEFAULT DATA INSERTED SUCCESSFULLY' as info;

-- STEP 8: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get user by email (safe, returns NULL if not found)
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.role, u.organization_id
  FROM users u
  WHERE u.email = p_email
  LIMIT 1;
END;
$$;

-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

SELECT 'HELPER FUNCTIONS AND TRIGGERS CREATED SUCCESSFULLY' as info;

-- STEP 9: GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON subscription_plans TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_email TO anon, authenticated;

SELECT 'PERMISSIONS GRANTED SUCCESSFULLY' as info;

-- STEP 10: VERIFICATION
-- ============================================

SELECT '========================================' as separator;
SELECT 'AUTH SYSTEM OVERHAUL COMPLETED!' as message;
SELECT '========================================' as separator;

-- Final verification checks
SELECT 'FINAL VERIFICATION:' as info;
SELECT 
  (SELECT COUNT(*) FROM organizations) as org_count,
  (SELECT COUNT(*) FROM subscription_plans) as plans_count,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('organizations', 'users', 'departments')) as core_tables_count;
