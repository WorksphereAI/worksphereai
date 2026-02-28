-- WorkSphere AI - Admin Dashboard Schema
-- Add to existing database for comprehensive admin management

-- Admin Audit Logs
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

-- System Alerts
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
  category TEXT CHECK (category IN ('system', 'billing', 'security', 'performance', 'customer')),
  status TEXT CHECK (status IN ('active', 'acknowledged', 'resolved')) DEFAULT 'active',
  affected_entities JSONB,
  metadata JSONB,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Health Metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  unit TEXT,
  status TEXT CHECK (status IN ('healthy', 'degraded', 'down')),
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  percentage DECIMAL DEFAULT 100,
  rules JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT CHECK (type IN ('info', 'update', 'maintenance', 'critical')),
  audience TEXT CHECK (audience IN ('all', 'admins', 'customers', 'specific_orgs')),
  target_organizations UUID[],
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_system_alerts_status ON system_alerts(status, severity);
CREATE INDEX idx_system_alerts_category ON system_alerts(category, created_at DESC);
CREATE INDEX idx_admin_notifications_admin ON admin_notifications(admin_id, read, created_at DESC);
CREATE INDEX idx_system_health_metrics_name ON system_health_metrics(metric_name, timestamp DESC);
CREATE INDEX idx_announcements_scheduled ON announcements(scheduled_for, expires_at);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Tables
CREATE POLICY "Only admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

CREATE POLICY "Only admins can manage system alerts" ON system_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

CREATE POLICY "Admins can view their notifications" ON admin_notifications
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Only admins can view system health" ON system_health_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

CREATE POLICY "Only admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

CREATE POLICY "Only admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ceo', 'admin'))
  );

-- Enable Real-time for admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE system_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE system_health_metrics;

-- Insert sample data for testing
INSERT INTO system_health_metrics (metric_name, metric_value, unit, status, details) VALUES
  ('api_response_time', 120, 'ms', 'healthy', '{"endpoint": "/api/v1/*", "p95": 250}'),
  ('database_connections', 45, 'count', 'healthy', '{"max_connections": 100, "active": 45}'),
  ('storage_usage', 75.5, 'percent', 'healthy', '{"total_gb": 1000, "used_gb": 755}'),
  ('auth_service', 99.9, 'percent', 'healthy', '{"uptime": 99.9, "last_check": "2024-02-28T16:00:00Z"}'),
  ('realtime_service', 99.8, 'percent', 'healthy', '{"connections": 1234, "messages_per_second": 45}');

INSERT INTO system_alerts (title, description, severity, category, metadata) VALUES
  ('High CPU Usage Detected', 'API server CPU usage is above 80% threshold', 'warning', 'performance', '{"cpu_percent": 85, "server": "api-01"}'),
  ('New Customer Signup', 'Rwanda Development Board has signed up for Enterprise plan', 'info', 'customer', '{"customer_id": "uuid-here", "plan": "Enterprise"}'),
  ('Payment Failed', 'Customer MTN Rwanda payment failed - retry scheduled', 'error', 'billing', '{"customer_id": "uuid-here", "amount": 299000, "currency": "RWF"}');

INSERT INTO feature_flags (name, description, enabled, percentage, rules) VALUES
  ('white_label_enabled', 'Enable white label features for enterprise customers', true, 100, '{"min_plan": "Enterprise"}'),
  ('mobile_money_kenya', 'Enable mobile money payments for Kenya market', false, 0, '{"countries": ["KE"], "providers": ["mpesa"]}'),
  ('advanced_analytics', 'Enable advanced analytics dashboard', true, 50, '{"user_tier": "professional", "rollout_percentage": 50}'),
  ('beta_features', 'Enable beta features for selected customers', false, 10, '{"beta_testers": ["uuid-1", "uuid-2"], "features": ["ai_assistant", "auto_organize"]}');

INSERT INTO announcements (title, content, type, audience, scheduled_for) VALUES
  ('System Maintenance Scheduled', 'We will be performing system maintenance on March 1st from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 'maintenance', 'all', '2024-03-01T02:00:00Z'),
  ('New Payment Methods Available', 'We are excited to announce that MTN Mobile Money and Airtel Money payments are now fully supported for all customers!', 'update', 'customers', '2024-02-28T10:00:00Z'),
  ('Security Update', 'We have implemented additional security measures to protect your data. Please review your security settings.', 'info', 'all', '2024-02-27T15:00:00Z');

COMMIT;
