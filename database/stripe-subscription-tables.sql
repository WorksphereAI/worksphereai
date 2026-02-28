-- Stripe Subscription Tables for WorkSphere AI
-- These tables support the new subscription service with proper Stripe integration

-- Create table for tracking Stripe checkout sessions
CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  price_id TEXT NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for webhook errors (for debugging)
CREATE TABLE IF NOT EXISTS webhook_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  session_id TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for subscription invoices
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_due DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'unknown' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'mobile_money', 'bank_transfer', 'other')),
  provider TEXT,
  last4 TEXT,
  brand TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  phone_number TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for usage metrics
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment_failed', 'trial_ending', 'subscription_updated', 'invoice_created')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organizations can view their invoices" ON subscription_invoices;

-- RLS Policies for stripe_checkout_sessions
CREATE POLICY "Organizations can view their checkout sessions" ON stripe_checkout_sessions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage checkout sessions" ON stripe_checkout_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for webhook_errors
CREATE POLICY "Service role can manage webhook errors" ON webhook_errors
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for subscription_invoices
CREATE POLICY "Organizations can view their invoices" ON subscription_invoices
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage invoices" ON subscription_invoices
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for payment_methods
CREATE POLICY "Organizations can view their payment methods" ON payment_methods
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage payment methods" ON payment_methods
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for usage_metrics
CREATE POLICY "Organizations can view their usage metrics" ON usage_metrics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage usage metrics" ON usage_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR (
      user_id IS NULL AND organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_org ON stripe_checkout_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_status ON stripe_checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_org ON subscription_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_created ON subscription_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_org ON usage_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_date ON usage_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create function for tracking usage
CREATE OR REPLACE FUNCTION track_usage(
  p_organization_id UUID,
  p_metric_type TEXT,
  p_metric_value DECIMAL,
  p_metric_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO usage_metrics (organization_id, metric_type, metric_value, metric_date)
  VALUES (p_organization_id, p_metric_type, p_metric_value, p_metric_date)
  ON CONFLICT (organization_id, metric_type, metric_date) 
  DO UPDATE SET 
    metric_value = p_metric_value,
    updated_at = NOW();
END;
$$;

-- Grant necessary permissions
GRANT ALL ON stripe_checkout_sessions TO authenticated;
GRANT ALL ON webhook_errors TO authenticated;
GRANT ALL ON subscription_invoices TO authenticated;
GRANT ALL ON payment_methods TO authenticated;
GRANT ALL ON usage_metrics TO authenticated;
GRANT ALL ON notifications TO authenticated;

GRANT EXECUTE ON FUNCTION track_usage TO authenticated;
