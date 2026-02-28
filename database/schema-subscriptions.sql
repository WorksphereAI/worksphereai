-- WorkSphere AI - Subscription & Payment Schema
-- Phase 4: Market Expansion & Enterprise Launch

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC NOT NULL,
  currency TEXT DEFAULT 'RWF',
  features JSONB DEFAULT '{}',
  max_users INTEGER,
  max_storage_gb INTEGER,
  max_bandwidth_gb INTEGER,
  white_label BOOLEAN DEFAULT FALSE,
  custom_domain BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  mobile_money BOOLEAN DEFAULT FALSE,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  custom_integrations BOOLEAN DEFAULT FALSE,
  dedicated_support BOOLEAN DEFAULT FALSE,
  sla_guarantee TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Subscriptions
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
  payment_method TEXT CHECK (payment_method IN ('card', 'mobile_money', 'bank_transfer')),
  mobile_money_provider TEXT,
  mobile_money_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Invoices
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES organization_subscriptions(id),
  stripe_invoice_id TEXT UNIQUE,
  amount_paid NUMERIC,
  amount_due NUMERIC,
  currency TEXT DEFAULT 'RWF',
  status TEXT,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE,
  type TEXT CHECK (type IN ('card', 'mobile_money', 'bank_transfer')),
  provider TEXT, -- mtn, airtel, safaricom, etc.
  phone_number TEXT,
  last4 TEXT,
  brand TEXT, -- visa, mastercard, etc.
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- users, storage, bandwidth, api_calls
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Metrics
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  mrr NUMERIC DEFAULT 0, -- Monthly Recurring Revenue
  arr NUMERIC DEFAULT 0, -- Annual Run Rate
  active_organizations INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  paid_organizations INTEGER DEFAULT 0,
  free_organizations INTEGER DEFAULT 0,
  trial_organizations INTEGER DEFAULT 0,
  paid_conversion_rate NUMERIC DEFAULT 0,
  churn_rate NUMERIC DEFAULT 0,
  cac NUMERIC DEFAULT 0, -- Customer Acquisition Cost
  ltv NUMERIC DEFAULT 0, -- Lifetime Value
  nps_score INTEGER,
  average_revenue_per_customer NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Pipeline
CREATE TABLE IF NOT EXISTS sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  industry TEXT,
  employee_count INTEGER,
  current_solution TEXT,
  pain_points TEXT,
  budget NUMERIC,
  timeline TEXT,
  status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) DEFAULT 'new',
  source TEXT CHECK (source IN ('website', 'referral', 'partner', 'outbound', 'event', 'cold_email', 'social')) DEFAULT 'website',
  assigned_to UUID REFERENCES users(id),
  estimated_value NUMERIC,
  probability NUMERIC DEFAULT 0,
  notes TEXT,
  next_followup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Activities
CREATE TABLE IF NOT EXISTS sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES sales_leads(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'note')),
  subject TEXT,
  description TEXT,
  duration_minutes INTEGER,
  outcome TEXT,
  next_step TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  partner_type TEXT CHECK (partner_type IN ('reseller', 'implementer', 'referral', 'technology', 'strategic')),
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
  commission_rate NUMERIC DEFAULT 10,
  total_revenue NUMERIC DEFAULT 0,
  customers_referred INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  agreement_signed_at TIMESTAMP WITH TIME ZONE,
  territory TEXT,
  specialties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner Commissions
CREATE TABLE IF NOT EXISTS partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  subscription_id UUID REFERENCES organization_subscriptions(id),
  amount NUMERIC,
  rate NUMERIC,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Checklists
CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  checklist JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Success Metrics
CREATE TABLE IF NOT EXISTS customer_success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  health_score NUMERIC DEFAULT 100,
  engagement_score NUMERIC DEFAULT 100,
  support_tickets_count INTEGER DEFAULT 0,
  feature_adoption JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  usage_frequency TEXT DEFAULT 'daily',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  account_manager UUID REFERENCES users(id),
  renewal_probability NUMERIC DEFAULT 100,
  upsell_opportunities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_subscription_plans_active ON subscription_plans(name);
CREATE INDEX idx_organization_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX idx_organization_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX idx_organization_subscriptions_stripe ON organization_subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscription_invoices_org ON subscription_invoices(organization_id);
CREATE INDEX idx_subscription_invoices_status ON subscription_invoices(status);
CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(organization_id, is_default);
CREATE INDEX idx_usage_metrics_org_date ON usage_metrics(organization_id, metric_date);
CREATE INDEX idx_usage_metrics_type ON usage_metrics(metric_type);
CREATE INDEX idx_business_metrics_date ON business_metrics(date);
CREATE INDEX idx_sales_leads_status ON sales_leads(status);
CREATE INDEX idx_sales_leads_assigned ON sales_leads(assigned_to);
CREATE INDEX idx_sales_activities_lead ON sales_activities(lead_id);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partner_commissions_partner ON partner_commissions(partner_id);
CREATE INDEX idx_onboarding_checklists_org ON onboarding_checklists(organization_id);
CREATE INDEX idx_customer_success_metrics_org ON customer_success_metrics(organization_id);
CREATE INDEX idx_customer_success_metrics_health ON customer_success_metrics(health_score);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_success_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view plans" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Organizations can view their subscription" ON organization_subscriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subscriptions" ON organization_subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Organizations can view their invoices" ON subscription_invoices
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organizations can manage their payment methods" ON payment_methods
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organizations can view their usage metrics" ON usage_metrics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view business metrics" ON business_metrics
  FOR SELECT USING (true);

CREATE POLICY "Sales team can view leads" ON sales_leads
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    role IN ('admin', 'sales')
  );

CREATE POLICY "Sales team can manage leads" ON sales_leads
  FOR ALL USING (
    role IN ('admin', 'sales')
  );

CREATE POLICY "Sales team can view activities" ON sales_activities
  FOR SELECT USING (
    created_by = auth.uid() OR 
    role IN ('admin', 'sales')
  );

CREATE POLICY "Sales team can manage activities" ON sales_activities
  FOR ALL USING (
    role IN ('admin', 'sales')
  );

CREATE POLICY "Anyone can view partners" ON partners
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage partners" ON partners
  FOR ALL USING (role = 'admin');

CREATE POLICY "Organizations can view their onboarding" ON onboarding_checklists
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage onboarding" ON onboarding_checklists
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view customer success metrics" ON customer_success_metrics
  FOR SELECT USING (role = 'admin');

CREATE POLICY "Admins can manage customer success metrics" ON customer_success_metrics
  FOR ALL USING (role = 'admin');

-- Functions for Subscription Management

-- Function to calculate MRR
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_mrr NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN billing_cycle = 'monthly' THEN sp.price_monthly
      WHEN billing_cycle = 'yearly' THEN sp.price_yearly / 12
      ELSE 0
    END
  ), 0) INTO v_mrr
  FROM organization_subscriptions os
  JOIN subscription_plans sp ON os.plan_id = sp.id
  WHERE os.status = 'active';

  RETURN v_mrr;
END;
$$;

-- Function to update business metrics
CREATE OR REPLACE FUNCTION update_business_metrics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_mrr NUMERIC;
  v_arr NUMERIC;
  v_active_orgs INTEGER;
  v_total_users INTEGER;
  v_paid_orgs INTEGER;
  v_free_orgs INTEGER;
  v_trial_orgs INTEGER;
  v_conversion_rate NUMERIC;
BEGIN
  -- Calculate metrics
  SELECT calculate_mrr() INTO v_mrr;
  v_arr := v_mrr * 12;
  
  SELECT COUNT(*) INTO v_active_orgs
  FROM organizations WHERE is_active = true;
  
  SELECT COUNT(*) INTO v_total_users
  FROM users WHERE is_active = true;
  
  SELECT COUNT(*) INTO v_paid_orgs
  FROM organization_subscriptions WHERE status = 'active';
  
  SELECT COUNT(*) INTO v_free_orgs
  FROM organizations 
  WHERE is_active = true 
  AND id NOT IN (SELECT organization_id FROM organization_subscriptions WHERE status = 'active');
  
  SELECT COUNT(*) INTO v_trial_orgs
  FROM organization_subscriptions WHERE status = 'trialing';
  
  v_conversion_rate := CASE 
    WHEN (v_paid_orgs + v_trial_orgs) > 0 
    THEN (v_paid_orgs::NUMERIC / (v_paid_orgs + v_trial_orgs) * 100)
    ELSE 0
  END;

  -- Update or insert business metrics
  INSERT INTO business_metrics (
    date, mrr, arr, active_organizations, total_users, 
    paid_organizations, free_organizations, trial_organizations,
    paid_conversion_rate
  ) VALUES (
    p_date, v_mrr, v_arr, v_active_orgs, v_total_users,
    v_paid_orgs, v_free_orgs, v_trial_orgs,
    v_conversion_rate
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    mrr = EXCLUDED.mrr,
    arr = EXCLUDED.arr,
    active_organizations = EXCLUDED.active_organizations,
    total_users = EXCLUDED.total_users,
    paid_organizations = EXCLUDED.paid_organizations,
    free_organizations = EXCLUDED.free_organizations,
    trial_organizations = EXCLUDED.trial_organizations,
    paid_conversion_rate = EXCLUDED.paid_conversion_rate;
END;
$$;

-- Function to track usage
CREATE OR REPLACE FUNCTION track_usage(
  p_organization_id UUID,
  p_metric_type TEXT,
  p_metric_value NUMERIC,
  p_metric_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO usage_metrics (
    organization_id, metric_type, metric_value, metric_date
  ) VALUES (
    p_organization_id, p_metric_type, p_metric_value, p_metric_date
  )
  ON CONFLICT (organization_id, metric_type, metric_date)
  DO UPDATE SET
    metric_value = usage_metrics.metric_value + p_metric_value;
END;
$$;

-- Function to calculate customer health score
CREATE OR REPLACE FUNCTION calculate_health_score(p_organization_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_login_days INTEGER;
  v_feature_usage NUMERIC;
  v_support_tickets INTEGER;
  v_health_score NUMERIC;
BEGIN
  -- Calculate login frequency (last 30 days)
  SELECT COUNT(DISTINCT DATE(created_at)) INTO v_login_days
  FROM user_activity
  WHERE organization_id = p_organization_id
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate feature adoption
  SELECT COUNT(DISTINCT feature) INTO v_feature_usage
  FROM feature_usage
  WHERE organization_id = p_organization_id
  AND used_at >= NOW() - INTERVAL '30 days';
  
  -- Get support ticket count
  SELECT COUNT(*) INTO v_support_tickets
  FROM support_tickets
  WHERE organization_id = p_organization_id
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate health score (0-100)
  v_health_score := (
    (v_login_days / 30.0 * 40) + -- 40% weight on login frequency
    (v_feature_usage / 10.0 * 40) + -- 40% weight on feature usage
    CASE 
      WHEN v_support_tickets = 0 THEN 20
      WHEN v_support_tickets <= 2 THEN 15
      WHEN v_support_tickets <= 5 THEN 10
      ELSE 5
    END -- 20% weight on support tickets
  );
  
  -- Update customer success metrics
  UPDATE customer_success_metrics
  SET 
    health_score = v_health_score,
    risk_level = CASE 
      WHEN v_health_score >= 80 THEN 'low'
      WHEN v_health_score >= 60 THEN 'medium'
      WHEN v_health_score >= 40 THEN 'high'
      ELSE 'critical'
    END,
    updated_at = NOW()
  WHERE organization_id = p_organization_id;
  
  RETURN v_health_score;
END;
$$;

-- Enable Real-time for subscription tables
ALTER PUBLICATION supabase_realtime ADD TABLE organization_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE usage_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE business_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_leads;

-- Insert subscription plans
INSERT INTO subscription_plans (
  name, stripe_price_id, price_monthly, price_yearly, features, 
  max_users, max_storage_gb, max_bandwidth_gb, white_label, custom_domain,
  api_access, priority_support, mobile_money, advanced_analytics,
  custom_integrations, dedicated_support, sla_guarantee
) VALUES
  (
    'Starter',
    'price_starter_monthly_rw',
    9900, -- 99,000 RWF
    99000, -- 990,000 RWF yearly
    '{
      "messaging": true,
      "tasks": true,
      "documents": true,
      "basic_analytics": true,
      "mobile_app": true,
      "email_support": true,
      "standard_security": true
    }',
    10,
    50,
    500,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    '99.5% uptime'
  ),
  (
    'Professional',
    'price_professional_monthly_rw',
    29900, -- 299,000 RWF
    299000, -- 2,990,000 RWF yearly
    '{
      "messaging": true,
      "tasks": true,
      "documents": true,
      "advanced_analytics": true,
      "integrations": true,
      "mobile_app": true,
      "priority_support": true,
      "advanced_security": true,
      "api_access": true,
      "custom_reports": true
    }',
    50,
    200,
    2000,
    false,
    false,
    true,
    true,
    true,
    true,
    false,
    false,
    '99.8% uptime'
  ),
  (
    'Enterprise',
    'price_enterprise_monthly_rw',
    99900, -- 999,000 RWF
    999000, -- 9,990,000 RWF yearly
    '{
      "messaging": true,
      "tasks": true,
      "documents": true,
      "advanced_analytics": true,
      "integrations": true,
      "mobile_app": true,
      "priority_support": true,
      "advanced_security": true,
      "api_access": true,
      "custom_reports": true,
      "white_label": true,
      "custom_domain": true,
      "custom_integrations": true,
      "dedicated_support": true,
      "ai_features": true,
      "advanced_compliance": true
    }',
    500,
    1000,
    10000,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '99.9% uptime with SLA'
  )
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Insert sample business metrics
INSERT INTO business_metrics (
  date, mrr, arr, active_organizations, total_users,
  paid_organizations, free_organizations, trial_organizations,
  paid_conversion_rate
) VALUES (
  CURRENT_DATE,
  0,
  0,
  1,
  5,
  0,
  1,
  0,
  0
)
ON CONFLICT (date) DO NOTHING;

COMMIT;
