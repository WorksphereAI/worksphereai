-- WorkSphere AI - White Label Solution Schema
-- Phase 3: Enterprise Scale & Market Expansion

-- White Label Configurations
CREATE TABLE IF NOT EXISTS white_label_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  accent_color TEXT DEFAULT '#F59E0B',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#1F2937',
  font_family TEXT DEFAULT 'Inter',
  custom_css TEXT,
  custom_javascript TEXT,
  theme_config JSONB DEFAULT '{}',
  branding_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- White Label Themes
CREATE TABLE IF NOT EXISTS white_label_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  theme_type TEXT CHECK (theme_type IN ('light', 'dark', 'auto')),
  color_palette JSONB DEFAULT '{}',
  typography JSONB DEFAULT '{}',
  spacing JSONB DEFAULT '{}',
  components JSONB DEFAULT '{}',
  custom_properties JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Domain Configurations
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  ssl_status TEXT CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')) DEFAULT 'pending',
  ssl_certificate TEXT,
  ssl_private_key TEXT,
  ssl_expires_at TIMESTAMP WITH TIME ZONE,
  dns_status TEXT CHECK (dns_status IN ('pending', 'active', 'failed')) DEFAULT 'pending',
  dns_records JSONB DEFAULT '{}',
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- White Label Features
CREATE TABLE IF NOT EXISTS white_label_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  configuration JSONB DEFAULT '{}',
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'basic', 'premium', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, feature_key)
);

-- White Label Analytics
CREATE TABLE IF NOT EXISTS white_label_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES custom_domains(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- White Label Templates
CREATE TABLE IF NOT EXISTS white_label_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('theme', 'layout', 'component', 'email')),
  preview_image_url TEXT,
  configuration JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- White Label Subscriptions
CREATE TABLE IF NOT EXISTS white_label_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('starter', 'professional', 'enterprise')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'cancelled', 'suspended')) DEFAULT 'active',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
  price NUMERIC NOT NULL,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_ends_at TIMESTAMP WITH TIME ZONE,
  next_billing_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_white_label_configurations_org ON white_label_configurations(organization_id, is_active);
CREATE INDEX idx_white_label_configurations_domain ON white_label_configurations(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_white_label_configurations_subdomain ON white_label_configurations(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_white_label_themes_org ON white_label_themes(organization_id, is_active);
CREATE INDEX idx_custom_domains_org ON custom_domains(organization_id, is_verified);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_white_label_features_org ON white_label_features(organization_id, is_enabled);
CREATE INDEX idx_white_label_analytics_org ON white_label_analytics(organization_id, timestamp);
CREATE INDEX idx_white_label_analytics_domain ON white_label_analytics(domain_id, timestamp);
CREATE INDEX idx_white_label_templates_category ON white_label_templates(category, is_active);
CREATE INDEX idx_white_label_subscriptions_org ON white_label_subscriptions(organization_id, status);

-- Enable RLS
ALTER TABLE white_label_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their white label config" ON white_label_configurations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage white label config" ON white_label_configurations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their themes" ON white_label_themes
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their domains" ON custom_domains
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their features" ON white_label_features
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage features" ON white_label_features
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their analytics" ON white_label_analytics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view templates" ON white_label_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their subscription" ON white_label_subscriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subscription" ON white_label_subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions for White Label

-- Function to generate verification token
CREATE OR REPLACE FUNCTION generate_domain_verification_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(decode(md5(random()::text || now()::text), 'hex'), 'base64');
END;
$$;

-- Function to verify domain ownership
CREATE OR REPLACE FUNCTION verify_domain_ownership(p_domain_id UUID, p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_domain RECORD;
BEGIN
  -- Get domain details
  SELECT * INTO v_domain
  FROM custom_domains
  WHERE id = p_domain_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Verify token matches
  IF v_domain.verification_token = p_token THEN
    UPDATE custom_domains
    SET 
      is_verified = true,
      dns_status = 'active',
      updated_at = NOW()
    WHERE id = p_domain_id;
    
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Function to apply white label theme
CREATE OR REPLACE FUNCTION apply_white_label_theme(p_organization_id UUID, p_theme_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_theme RECORD;
  v_config RECORD;
BEGIN
  -- Get theme details
  SELECT * INTO v_theme
  FROM white_label_themes
  WHERE id = p_theme_id AND organization_id = p_organization_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get or create white label config
  INSERT INTO white_label_configurations (organization_id, theme_config)
  VALUES (p_organization_id, v_theme.configuration)
  ON CONFLICT (organization_id) 
  DO UPDATE SET 
    theme_config = v_theme.configuration,
    updated_at = NOW()
  WHERE organization_id = p_organization_id
  RETURNING * INTO v_config;

  RETURN true;
END;
$$;

-- Function to log white label analytics
CREATE OR REPLACE FUNCTION log_white_label_analytics(
  p_organization_id UUID,
  p_domain_id UUID,
  p_metric_type TEXT,
  p_metric_value NUMERIC,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO white_label_analytics (
    organization_id, domain_id, metric_type, metric_value, metadata
  ) VALUES (
    p_organization_id, p_domain_id, p_metric_type, p_metric_value, p_metadata
  );
END;
$$;

-- Function to check white label feature access
CREATE OR REPLACE FUNCTION check_white_label_feature(
  p_organization_id UUID,
  p_feature_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_feature_enabled BOOLEAN;
BEGIN
  SELECT is_enabled INTO v_feature_enabled
  FROM white_label_features
  WHERE organization_id = p_organization_id AND feature_key = p_feature_key;

  RETURN COALESCE(v_feature_enabled, false);
END;
$$;

-- Function to update white label subscription
CREATE OR REPLACE FUNCTION update_white_label_subscription(
  p_organization_id UUID,
  p_plan_type TEXT,
  p_billing_cycle TEXT DEFAULT 'monthly'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscription_id UUID;
  v_price NUMERIC;
  v_features JSONB;
  v_limits JSONB;
BEGIN
  -- Determine pricing and features based on plan
  CASE p_plan_type
    WHEN 'starter' THEN
      v_price := 99;
      v_features := '{
        "custom_branding": true,
        "subdomain": true,
        "basic_analytics": true,
        "email_templates": false,
        "custom_domains": false,
        "advanced_themes": false
      }'::JSONB;
      v_limits := '{
        "users": 10,
        "storage_gb": 5,
        "bandwidth_gb": 50,
        "custom_domains": 0
      }'::JSONB;
    WHEN 'professional' THEN
      v_price := 299;
      v_features := '{
        "custom_branding": true,
        "subdomain": true,
        "basic_analytics": true,
        "email_templates": true,
        "custom_domains": true,
        "advanced_themes": true
      }'::JSONB;
      v_limits := '{
        "users": 50,
        "storage_gb": 50,
        "bandwidth_gb": 500,
        "custom_domains": 3
      }'::JSONB;
    WHEN 'enterprise' THEN
      v_price := 999;
      v_features := '{
        "custom_branding": true,
        "subdomain": true,
        "basic_analytics": true,
        "email_templates": true,
        "custom_domains": true,
        "advanced_themes": true,
        "api_access": true,
        "priority_support": true,
        "custom_integrations": true
      }'::JSONB;
      v_limits := '{
        "users": -1,
        "storage_gb": -1,
        "bandwidth_gb": -1,
        "custom_domains": -1
      }'::JSONB;
  END CASE;

  -- Update or create subscription
  INSERT INTO white_label_subscriptions (
    organization_id, plan_type, billing_cycle, price, features, limits,
    current_period_ends_at, next_billing_at
  ) VALUES (
    p_organization_id, p_plan_type, p_billing_cycle, v_price, v_features, v_limits,
    NOW() + INTERVAL '1 month', NOW() + INTERVAL '1 month'
  )
  ON CONFLICT (organization_id)
  DO UPDATE SET 
    plan_type = p_plan_type,
    billing_cycle = p_billing_cycle,
    price = v_price,
    features = v_features,
    limits = v_limits,
    status = 'active',
    current_period_ends_at = NOW() + INTERVAL '1 month',
    next_billing_at = NOW() + INTERVAL '1 month',
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;

  RETURN v_subscription_id;
END;
$$;

-- Enable Real-time for white label tables
ALTER PUBLICATION supabase_realtime ADD TABLE white_label_configurations;
ALTER PUBLICATION supabase_realtime ADD TABLE white_label_themes;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_domains;
ALTER PUBLICATION supabase_realtime ADD TABLE white_label_analytics;

-- Insert sample white label templates
INSERT INTO white_label_templates (
  name, slug, description, category, template_type, configuration, is_premium
) VALUES
  (
    'Modern Corporate',
    'modern-corporate',
    'Clean and professional theme for corporate environments',
    'Business',
    'theme',
    '{
      "colors": {
        "primary": "#1E40AF",
        "secondary": "#059669",
        "accent": "#DC2626",
        "background": "#FFFFFF",
        "text": "#111827"
      },
      "typography": {
        "font_family": "Inter",
        "heading_weight": "700",
        "body_weight": "400"
      },
      "spacing": {
        "unit": "0.25rem",
        "scale": [0.5, 1, 1.5, 2, 3, 4]
      }
    }',
    false
  ),
  (
    'Minimal Dark',
    'minimal-dark',
    'Elegant dark theme for modern applications',
    'Technology',
    'theme',
    '{
      "colors": {
        "primary": "#8B5CF6",
        "secondary": "#10B981",
        "accent": "#F59E0B",
        "background": "#111827",
        "text": "#F9FAFB"
      },
      "typography": {
        "font_family": "Inter",
        "heading_weight": "600",
        "body_weight": "300"
      },
      "spacing": {
        "unit": "0.25rem",
        "scale": [0.5, 1, 1.5, 2, 3, 4]
      }
    }',
    true
  ),
  (
    'Creative Agency',
    'creative-agency',
    'Vibrant and colorful theme for creative businesses',
    'Creative',
    'theme',
    '{
      "colors": {
        "primary": "#EC4899",
        "secondary": "#8B5CF6",
        "accent": "#F59E0B",
        "background": "#FEF3C7",
        "text": "#1F2937"
      },
      "typography": {
        "font_family": "Poppins",
        "heading_weight": "800",
        "body_weight": "400"
      },
      "spacing": {
        "unit": "0.5rem",
        "scale": [0.5, 1, 1.5, 2, 3, 4]
      }
    }',
    true
  ),
  (
    'Healthcare Professional',
    'healthcare-professional',
    'Clean and trustworthy theme for healthcare organizations',
    'Healthcare',
    'theme',
    '{
      "colors": {
        "primary": "#0EA5E9",
        "secondary": "#10B981",
        "accent": "#F59E0B",
        "background": "#F0F9FF",
        "text": "#0C4A6E"
      },
      "typography": {
        "font_family": "Roboto",
        "heading_weight": "500",
        "body_weight": "400"
      },
      "spacing": {
        "unit": "0.25rem",
        "scale": [0.5, 1, 1.5, 2, 3, 4]
      }
    }',
    false
  ),
  (
    'Financial Services',
    'financial-services',
    'Conservative and professional theme for financial institutions',
    'Finance',
    'theme',
    '{
      "colors": {
        "primary": "#1E40AF",
        "secondary": "#059669",
        "accent": "#DC2626",
        "background": "#F8FAFC",
        "text": "#1E293B"
      },
      "typography": {
        "font_family": "Inter",
        "heading_weight": "600",
        "body_weight": "400"
      },
      "spacing": {
        "unit": "0.25rem",
        "scale": [0.5, 1, 1.5, 2, 3, 4]
      }
    }',
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample white label features
INSERT INTO white_label_features (
  organization_id, feature_name, feature_key, is_enabled, pricing_tier
)
SELECT 
  o.id,
  'Custom Branding',
  'custom_branding',
  true,
  'free'
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (organization_id, feature_key) DO NOTHING;

INSERT INTO white_label_features (
  organization_id, feature_name, feature_key, is_enabled, pricing_tier
)
SELECT 
  o.id,
  'Custom Domains',
  'custom_domains',
  false,
  'premium'
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (organization_id, feature_key) DO NOTHING;

INSERT INTO white_label_features (
  organization_id, feature_name, feature_key, is_enabled, pricing_tier
)
SELECT 
  o.id,
  'Advanced Analytics',
  'advanced_analytics',
  false,
  'enterprise'
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (organization_id, feature_key) DO NOTHING;

COMMIT;
