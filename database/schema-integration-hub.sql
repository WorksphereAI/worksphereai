-- WorkSphere AI - Integration Hub Schema
-- Phase 3: Enterprise Scale & Market Expansion

-- Integration Definitions
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('api', 'webhook', 'oauth', 'database', 'file_storage')),
  provider TEXT NOT NULL,
  logo_url TEXT,
  documentation_url TEXT,
  configuration_schema JSONB DEFAULT '{}',
  authentication_type TEXT CHECK (authentication_type IN ('api_key', 'oauth2', 'basic', 'bearer', 'custom')),
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT FALSE,
  version TEXT DEFAULT '1.0.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Instances (Organization-specific configurations)
CREATE TABLE IF NOT EXISTS integration_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  configuration JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}', -- Encrypted sensitive data
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'suspended')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, integration_id, name)
);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_instance_id UUID REFERENCES integration_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret_key TEXT, -- For webhook signature verification
  is_active BOOLEAN DEFAULT TRUE,
  retry_policy JSONB DEFAULT '{"max_retries": 3, "retry_delay": 60}',
  headers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Event Logs
CREATE TABLE IF NOT EXISTS webhook_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB DEFAULT '{}',
  attempt_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  error_message TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Connections
CREATE TABLE IF NOT EXISTS api_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_instance_id UUID REFERENCES integration_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  authentication JSONB DEFAULT '{}',
  rate_limit JSONB DEFAULT '{"requests_per_minute": 60}',
  timeout_seconds INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  last_test_at TIMESTAMP WITH TIME ZONE,
  test_status TEXT CHECK (test_status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Sync Configurations
CREATE TABLE IF NOT EXISTS data_sync_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_instance_id UUID REFERENCES integration_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_entity TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  field_mappings JSONB DEFAULT '{}',
  sync_direction TEXT CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
  sync_frequency TEXT CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync Execution Logs
CREATE TABLE IF NOT EXISTS sync_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_configuration_id UUID REFERENCES data_sync_configurations(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  execution_details JSONB DEFAULT '{}'
);

-- Integration Marketplace
CREATE TABLE IF NOT EXISTS integration_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL,
  provider TEXT NOT NULL,
  logo_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  pricing_model TEXT CHECK (pricing_model IN ('free', 'freemium', 'paid', 'enterprise')),
  pricing_details JSONB DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  documentation_url TEXT,
  support_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Reviews
CREATE TABLE IF NOT EXISTS integration_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_id UUID REFERENCES integration_marketplace(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, marketplace_id)
);

-- Integration Usage Analytics
CREATE TABLE IF NOT EXISTS integration_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_instance_id UUID REFERENCES integration_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_category ON integrations(category, is_active);
CREATE INDEX idx_integrations_provider ON integrations(provider, is_active);
CREATE INDEX idx_integration_instances_org ON integration_instances(organization_id, status);
CREATE INDEX idx_integration_instances_integration ON integration_instances(integration_id, is_active);
CREATE INDEX idx_webhook_endpoints_org ON webhook_endpoints(organization_id, is_active);
CREATE INDEX idx_webhook_event_logs_endpoint ON webhook_event_logs(webhook_endpoint_id, status);
CREATE INDEX idx_webhook_event_logs_scheduled ON webhook_event_logs(scheduled_at, status);
CREATE INDEX idx_api_connections_org ON api_connections(organization_id, is_active);
CREATE INDEX idx_data_sync_configurations_org ON data_sync_configurations(organization_id, status);
CREATE INDEX idx_sync_execution_logs_config ON sync_execution_logs(sync_configuration_id, started_at);
CREATE INDEX idx_integration_marketplace_category ON integration_marketplace(category, is_active);
CREATE INDEX idx_integration_marketplace_featured ON integration_marketplace(is_featured, rating);
CREATE INDEX idx_integration_reviews_marketplace ON integration_reviews(marketplace_id, rating);
CREATE INDEX idx_integration_usage_analytics_org ON integration_usage_analytics(organization_id, timestamp);
CREATE INDEX idx_integration_usage_analytics_instance ON integration_usage_analytics(integration_instance_id, timestamp);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's integrations" ON integrations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) OR is_public = true
  );

CREATE POLICY "Admins can manage integrations" ON integrations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their integration instances" ON integration_instances
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage webhooks" ON webhook_endpoints
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view webhook logs" ON webhook_event_logs
  FOR SELECT USING (
    webhook_endpoint_id IN (
      SELECT we.id FROM webhook_endpoints we
      JOIN integration_instances ii ON ii.id = we.integration_instance_id
      WHERE ii.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage API connections" ON api_connections
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view sync configurations" ON data_sync_configurations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view sync logs" ON sync_execution_logs
  FOR SELECT USING (
    sync_configuration_id IN (
      SELECT dsc.id FROM data_sync_configurations dsc
      WHERE dsc.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Everyone can view marketplace" ON integration_marketplace
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage reviews" ON integration_reviews
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view usage analytics" ON integration_usage_analytics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Functions for Integration Hub

-- Function to test API connection
CREATE OR REPLACE FUNCTION test_api_connection(p_connection_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  response_status INTEGER,
  response_time_ms INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_connection RECORD;
  v_start_time TIMESTAMP WITH TIME ZONE;
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_response_status INTEGER;
  v_response_body TEXT;
  v_error_message TEXT;
BEGIN
  -- Get connection details
  SELECT * INTO v_connection
  FROM api_connections
  WHERE id = p_connection_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, NULL, 'Connection not found'::TEXT;
    RETURN;
  END IF;

  v_start_time := NOW();
  
  BEGIN
    -- Test connection (simplified - in production, use http extension)
    -- This is a mock implementation
    v_response_status := 200;
    v_response_body := 'OK';
    v_end_time := NOW();
    
    -- Update connection with test results
    UPDATE api_connections
    SET 
      last_test_at = NOW(),
      test_status = CASE WHEN v_response_status BETWEEN 200 AND 299 THEN 'success' ELSE 'failed' END
    WHERE id = p_connection_id;
    
    RETURN QUERY 
    SELECT 
      true,
      v_response_status,
      EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::INTEGER,
      NULL::TEXT;
      
  EXCEPTION WHEN OTHERS THEN
    v_error_message := SQLERRM;
    v_end_time := NOW();
    
    UPDATE api_connections
    SET 
      last_test_at = NOW(),
      test_status = 'failed'
    WHERE id = p_connection_id;
    
    RETURN QUERY 
    SELECT 
      false,
      NULL,
      EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::INTEGER,
      v_error_message;
  END;
END;
$$;

-- Function to trigger webhook
CREATE OR REPLACE FUNCTION trigger_webhook(p_webhook_endpoint_id UUID, p_event_type TEXT, p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_webhook RECORD;
  v_event_log_id UUID;
BEGIN
  -- Get webhook details
  SELECT * INTO v_webhook
  FROM webhook_endpoints
  WHERE id = p_webhook_endpoint_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Webhook endpoint not found or inactive';
  END IF;

  -- Check if event type is allowed
  IF NOT (p_event_type = ANY(v_webhook.events)) THEN
    RAISE EXCEPTION 'Event type not allowed for this webhook';
  END IF;

  -- Create event log
  INSERT INTO webhook_event_logs (
    webhook_endpoint_id, event_type, payload, scheduled_at
  ) VALUES (
    p_webhook_endpoint_id, p_event_type, p_payload, NOW()
  ) RETURNING id INTO v_event_log_id;

  -- In production, this would trigger actual HTTP request
  -- For now, we'll mark as delivered immediately
  UPDATE webhook_event_logs
  SET 
    status = 'delivered',
    response_status = 200,
    delivered_at = NOW()
  WHERE id = v_event_log_id;

  RETURN v_event_log_id;
END;
$$;

-- Function to execute data sync
CREATE OR REPLACE FUNCTION execute_data_sync(p_sync_configuration_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_sync_config RECORD;
  v_execution_log_id UUID;
  v_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get sync configuration
  SELECT * INTO v_sync_config
  FROM data_sync_configurations
  WHERE id = p_sync_configuration_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sync configuration not found or inactive';
  END IF;

  -- Create execution log
  INSERT INTO sync_execution_logs (
    sync_configuration_id, started_at, status
  ) VALUES (
    p_sync_configuration_id, NOW(), 'running'
  ) RETURNING id INTO v_execution_log_id;

  v_start_time := NOW();

  -- Update sync configuration
  UPDATE data_sync_configurations
  SET 
    last_sync_at = NOW(),
    next_sync_at = CASE 
      WHEN sync_frequency = 'hourly' THEN NOW() + INTERVAL '1 hour'
      WHEN sync_frequency = 'daily' THEN NOW() + INTERVAL '1 day'
      WHEN sync_frequency = 'weekly' THEN NOW() + INTERVAL '1 week'
      ELSE NULL
    END
  WHERE id = p_sync_configuration_id;

  -- Mock sync execution (in production, this would perform actual data sync)
  UPDATE sync_execution_logs
  SET 
    completed_at = NOW(),
    status = 'completed',
    records_processed = 100,
    records_created = 10,
    records_updated = 90,
    records_failed = 0
  WHERE id = v_execution_log_id;

  RETURN v_execution_log_id;
END;
$$;

-- Function to log integration usage
CREATE OR REPLACE FUNCTION log_integration_usage(
  p_organization_id UUID,
  p_integration_instance_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO integration_usage_analytics (
    organization_id, integration_instance_id, event_type, event_data
  ) VALUES (
    p_organization_id, p_integration_instance_id, p_event_type, p_event_data
  );
END;
$$;

-- Enable Real-time for integration tables
ALTER PUBLICATION supabase_realtime ADD TABLE integration_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_event_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_execution_logs;

-- Insert sample integrations
INSERT INTO integrations (
  organization_id, name, slug, description, category, type, provider, 
  authentication_type, configuration_schema, is_public
)
SELECT 
  o.id,
  'Slack Integration',
  'slack-integration',
  'Connect WorkSphere AI with Slack for real-time notifications and messaging',
  'Communication',
  'api',
  'Slack',
  'oauth2',
  '{
    "workspace_id": {"type": "string", "required": true, "label": "Workspace ID"},
    "channels": {"type": "array", "required": false, "label": "Default Channels"},
    "notify_on": {"type": "array", "required": false, "label": "Events to Notify"}
  }',
  true
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO integrations (
  organization_id, name, slug, description, category, type, provider,
  authentication_type, configuration_schema, is_public
)
SELECT 
  o.id,
  'Google Drive',
  'google-drive',
  'Sync files and documents with Google Drive',
  'Storage',
  'oauth2',
  'Google',
  'oauth2',
  '{
    "folder_id": {"type": "string", "required": false, "label": "Default Folder ID"},
    "sync_direction": {"type": "select", "required": true, "label": "Sync Direction", "options": ["import", "export", "bidirectional"]},
    "file_types": {"type": "array", "required": false, "label": "File Types to Sync"}
  }',
  true
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO integrations (
  organization_id, name, slug, description, category, type, provider,
  authentication_type, configuration_schema, is_public
)
SELECT 
  o.id,
  'Salesforce CRM',
  'salesforce-crm',
  'Connect with Salesforce for customer and sales data synchronization',
  'CRM',
  'api',
  'Salesforce',
  'oauth2',
  '{
    "instance_url": {"type": "string", "required": true, "label": "Salesforce Instance URL"},
    "sync_objects": {"type": "array", "required": true, "label": "Objects to Sync"},
    "sync_frequency": {"type": "select", "required": true, "label": "Sync Frequency", "options": ["realtime", "hourly", "daily"]}
  }',
  true
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (slug) DO NOTHING;

-- Insert marketplace items
INSERT INTO integration_marketplace (
  name, slug, description, category, provider, logo_url,
  pricing_model, features, is_featured
) VALUES
  (
    'Slack Integration',
    'slack-integration',
    'Connect WorkSphere AI with Slack for real-time notifications and team collaboration',
    'Communication',
    'Slack',
    'https://cdn.example.com/slack-logo.png',
    'freemium',
    ARRAY['Real-time notifications', 'Message synchronization', 'Channel management', 'File sharing'],
    true
  ),
  (
    'Google Drive',
    'google-drive',
    'Seamlessly sync your documents and files with Google Drive',
    'Storage',
    'Google',
    'https://cdn.example.com/google-drive-logo.png',
    'free',
    ARRAY['Automatic sync', 'Version control', 'Shared folders', 'Offline access'],
    true
  ),
  (
    'Salesforce CRM',
    'salesforce-crm',
    'Integrate customer data and sales processes with Salesforce',
    'CRM',
    'Salesforce',
    'https://cdn.example.com/salesforce-logo.png',
    'paid',
    ARRAY['Lead management', 'Contact sync', 'Opportunity tracking', 'Sales analytics'],
    false
  ),
  (
    'Microsoft Teams',
    'microsoft-teams',
    'Enhance team collaboration with Microsoft Teams integration',
    'Communication',
    'Microsoft',
    'https://cdn.example.com/teams-logo.png',
    'freemium',
    ARRAY['Meeting scheduling', 'Chat integration', 'File sharing', 'Calendar sync'],
    true
  ),
  (
    'Zoom Video Conferencing',
    'zoom-integration',
    'Schedule and manage video conferences directly from WorkSphere AI',
    'Communication',
    'Zoom',
    'https://cdn.example.com/zoom-logo.png',
    'freemium',
    ARRAY['Meeting scheduling', 'Recording management', 'Participant management', 'Calendar integration'],
    false
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
