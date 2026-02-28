-- WorkSphere AI - Analytics & Business Intelligence Schema
-- Phase 3: Enterprise Scale & Market Expansion

-- Analytics Events Table - Track all user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Dashboards - Custom dashboard configurations
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  widgets JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  layout JSONB DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Definitions - Custom metrics tracking
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  formula TEXT NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  refresh_interval TEXT DEFAULT 'daily',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Heatmap Data
CREATE TABLE IF NOT EXISTS user_activity_heatmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  activity_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  task_count INTEGER DEFAULT 0,
  approval_count INTEGER DEFAULT 0,
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Templates
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  query TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  layout JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Executions
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES users(id),
  parameters JSONB DEFAULT '{}',
  file_url TEXT,
  status TEXT DEFAULT 'running',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Cache
CREATE TABLE IF NOT EXISTS performance_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC,
  metric_type TEXT,
  time_period TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Engagement Scores
CREATE TABLE IF NOT EXISTS user_engagement_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  engagement_score NUMERIC,
  login_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  task_completion_rate NUMERIC,
  approval_response_time NUMERIC,
  document_activity NUMERIC,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_time ON analytics_events(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time ON analytics_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON analytics_events(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org ON analytics_dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_created_by ON analytics_dashboards(created_by);

CREATE INDEX IF NOT EXISTS idx_kpi_definitions_org ON kpi_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category ON kpi_definitions(category);

CREATE INDEX IF NOT EXISTS idx_user_activity_heatmap_org_date ON user_activity_heatmap(organization_id, date, hour);
CREATE INDEX IF NOT EXISTS idx_user_activity_heatmap_user_date ON user_activity_heatmap(user_id, date);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_org_key ON performance_metrics(organization_id, metric_key);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_expires ON performance_metrics(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_engagement_scores_org ON user_engagement_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_scores_user ON user_engagement_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_scores_score ON user_engagement_scores(engagement_score DESC);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Analytics Events
CREATE POLICY "Users can view analytics events in their organization" ON analytics_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for Analytics Dashboards
CREATE POLICY "Users can view dashboards in their organization" ON analytics_dashboards
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own dashboards" ON analytics_dashboards
  FOR ALL USING (
    created_by = auth.uid()
  );

-- RLS Policies for KPI Definitions
CREATE POLICY "Users can view KPIs in their organization" ON kpi_definitions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage KPIs in their organization" ON kpi_definitions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for User Activity Heatmap
CREATE POLICY "Users can view heatmap data in their organization" ON user_activity_heatmap
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create heatmap data in their organization" ON user_activity_heatmap
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for Report Templates
CREATE POLICY "Users can view templates in their organization" ON report_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) OR
    is_public = true
  );

CREATE POLICY "Users can manage templates in their organization" ON report_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for Report Executions
CREATE POLICY "Users can view their own report executions" ON report_executions
  FOR SELECT USING (
    executed_by = auth.uid()
  );

CREATE POLICY "Users can create report executions" ON report_executions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for Performance Metrics Cache
CREATE POLICY "Users can view metrics in their organization" ON performance_metrics_cache
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for User Engagement Scores
CREATE POLICY "Users can view engagement scores in their organization" ON user_engagement_scores
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own engagement score" ON user_engagement_scores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own engagement score" ON user_engagement_scores
  FOR UPDATE USING (user_id = auth.uid());

-- Enable Real-time for Analytics Tables
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_dashboards;
ALTER PUBLICATION supabase_realtime ADD TABLE user_activity_heatmap;
ALTER PUBLICATION supabase_realtime ADD TABLE user_engagement_scores;

-- Create Functions for Analytics

-- Function to get executive dashboard metrics
CREATE OR REPLACE FUNCTION get_executive_dashboard(time_range TEXT DEFAULT 'week')
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  org_id UUID;
  start_date TIMESTAMP WITH TIME ZONE;
  end_date TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Get organization ID from session
  org_id := current_setting('app.current_organization_id', NULL::UUID);
  
  -- Calculate date range
  CASE time_range
    WHEN 'today' THEN
      start_date := date_trunc('day', CURRENT_TIMESTAMP);
      end_date := date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '1 day';
    WHEN 'week' THEN
      start_date := date_trunc('week', CURRENT_TIMESTAMP);
      end_date := date_trunc('week', CURRENT_TIMESTAMP) + INTERVAL '1 week';
    WHEN 'month' THEN
      start_date := date_trunc('month', CURRENT_TIMESTAMP);
      end_date := date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month';
    ELSE
      start_date := date_trunc('week', CURRENT_TIMESTAMP);
      end_date := date_trunc('week', CURRENT_TIMESTAMP) + INTERVAL '1 week';
  END CASE;
  
  -- Build result JSON
  SELECT json_build_object(
    'activeUsers', (
      SELECT COUNT(DISTINCT user_id)::int
      FROM analytics_events
      WHERE organization_id = org_id
        AND timestamp >= start_date
        AND timestamp < end_date
        AND event_type = 'login'
    ),
    'totalMessages', (
      SELECT COUNT(*)::int
      FROM analytics_events
      WHERE organization_id = org_id
        AND timestamp >= start_date
        AND timestamp < end_date
        AND event_type = 'message_sent'
    ),
    'tasksCompleted', (
      SELECT COUNT(*)::int
      FROM analytics_events
      WHERE organization_id = org_id
        AND timestamp >= start_date
        AND timestamp < end_date
        AND event_type = 'task_completed'
    ),
    'approvalsPending', (
      SELECT COUNT(*)::int
      FROM analytics_events
      WHERE organization_id = org_id
        AND timestamp >= start_date
        AND timestamp < end_date
        AND event_type = 'approval_created'
    ),
    'documentsUploaded', (
      SELECT COUNT(*)::int
      FROM analytics_events
      WHERE organization_id = org_id
        AND timestamp >= start_date
        AND timestamp < end_date
        AND event_type = 'document_uploaded'
    ),
    'avgResponseTime', (
      SELECT AVG(EXTRACT(EPOCH FROM (metadata->>'response_time')::bigint))::numeric
      FROM analytics_events
      WHERE organization_id = org_id
        AND timestamp >= start_date
        AND timestamp < end_date
        AND event_type = 'message_sent'
        AND metadata ? 'response_time' IS NOT NULL
    ),
    'userGrowth', (
      SELECT json_agg(
        json_build_object(
          'date', to_char(date_trunc('day', timestamp), 'YYYY-MM-DD'),
          'count', COUNT(DISTINCT user_id)::int
        )
        ORDER BY date_trunc('day', timestamp)
      )::json
      FROM (
        SELECT 
          timestamp::date as date,
          user_id
        FROM analytics_events
        WHERE organization_id = org_id
          AND event_type = 'login'
          AND timestamp >= start_date
          AND timestamp < end_date
        GROUP BY date_trunc('day', timestamp), user_id
      ) t
    ),
    'departmentActivity', (
      SELECT json_agg(
        json_build_object(
          'name', u.department_name,
          'messages', COUNT(*) FILTER (WHERE ae.event_type = 'message_sent')::int,
          'tasks', COUNT(*) FILTER (WHERE ae.event_type = 'task_completed')::int
        )
      )::json
      FROM analytics_events ae
      JOIN users u ON u.id = ae.user_id
      WHERE ae.organization_id = org_id
        AND ae.timestamp >= start_date
        AND ae.timestamp < end_date
        AND ae.event_type IN ('message_sent', 'task_completed')
      GROUP BY u.department_name
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(user_id_param UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  login_score NUMERIC := 0;
  message_score NUMERIC := 0;
  task_score NUMERIC := 0;
  approval_score NUMERIC := 0;
  document_score NUMERIC := 0;
  total_score NUMERIC;
  days_active INTEGER := 30;
BEGIN
  -- Calculate scores based on recent activity (last 30 days)
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'), 0) * 10 INTO login_score
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_type = 'login';
  
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'), 0) * 5 INTO message_score
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_type = 'message_sent';
  
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'), 0) * 15 INTO task_score
  FROM analytics_events
    WHERE user_id = user_id_param
    AND event_type = 'task_completed';
  
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'), 0) * 8 INTO approval_score
  FROM analytics_events
    WHERE user_id = user_id_param
    AND event_type = 'approval_completed';
  
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'), 0) * 7 INTO document_score
  FROM analytics_events
    WHERE user_id = user_id_param
    AND event_type = 'document_uploaded';
  
  -- Calculate total score (max 100)
  total_score := LEAST(
    (login_score + message_score + task_score + approval_score + document_score) / 50 * 100,
    100
  );
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update user activity heatmap
CREATE OR REPLACE FUNCTION update_activity_heatmap()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update or insert heatmap data for each user and date/hour
  INSERT INTO user_activity_heatmap (
    organization_id,
    user_id,
    date,
    EXTRACT(HOUR FROM timestamp),
    activity_count,
    message_count,
    task_count,
    approval_count,
    document_count
  )
  SELECT 
    organization_id,
    user_id,
    DATE(timestamp) as date,
    EXTRACT(HOUR FROM timestamp) as hour,
    COUNT(*) as activity_count,
    COUNT(*) FILTER (WHERE event_type = 'message_sent') as message_count,
    COUNT(*) FILTER (WHERE event_type = 'task_completed') as task_count,
    COUNT(*) FILTER (WHERE event_type = 'approval_completed') as approval_count,
    COUNT(*) FILTER (WHERE event_type = 'document_uploaded') as document_count
  FROM analytics_events
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY organization_id, user_id, DATE(timestamp), EXTRACT(HOUR FROM timestamp)
  ON CONFLICT (organization_id, user_id, date, hour) DO UPDATE SET
    activity_count = EXCLUDED.activity_count,
    message_count = EXCLUDED.message_count,
    task_count = EXCLUDED.task_count,
    approval_count = EXCLUDED.approval_count,
    document_count = EXCLUDED.document_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cache performance metrics
CREATE OR REPLACE FUNCTION cache_performance_metric(
  org_id_param UUID,
  metric_key_param TEXT,
  metric_value_param NUMERIC,
  metric_type_param TEXT,
  time_period_param TEXT,
  expires_hours_param INTEGER DEFAULT 24
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO performance_metrics_cache (
    organization_id,
    metric_key,
    metric_value,
    metric_type,
    time_period,
    calculated_at,
    expires_at
  ) VALUES (
    org_id_param,
    metric_key_param,
    metric_value_param,
    metric_type_param,
    time_period_param,
    NOW(),
    NOW() + INTERVAL '1 hour' * expires_hours_param
  )
  ON CONFLICT (organization_id, metric_key, time_period) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    calculated_at = NOW(),
    expires_at = EXCLUDED.expires_at;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for Automatic Heatmap Updates
CREATE OR REPLACE FUNCTION trigger_activity_heatmap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_activity_heatmap();
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analytics_events_heatmap
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_activity_heatmap();

-- Create Trigger for Engagement Score Updates
CREATE OR REPLACE FUNCTION trigger_engagement_score_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update engagement scores for users with significant activity
  UPDATE user_engagement_scores
  SET 
    engagement_score = calculate_engagement_score(NEW.user_id),
    login_count = login_count + 1,
    last_calculated = NOW()
  WHERE user_id = NEW.user_id
    AND NEW.event_type = 'login';
  
  -- Update other activity counts
  UPDATE user_engagement_scores
  SET 
    message_count = CASE 
      WHEN NEW.event_type = 'message_sent' THEN message_count + 1
      ELSE message_count
    END,
    task_count = CASE 
      WHEN NEW.event_type = 'task_completed' THEN task_count + 1
      ELSE task_count
    END,
    approval_count = CASE 
      WHEN NEW.event_type = 'approval_completed' THEN approval_count + 1
      ELSE approval_count
    END,
    document_count = CASE 
      WHEN NEW.event_type = 'document_uploaded' THEN document_count + 1
      ELSE document_count
    END,
    last_calculated = NOW()
  WHERE user_id = NEW.user_id
    AND NEW.event_type IN ('message_sent', 'task_completed', 'approval_completed', 'document_uploaded');
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analytics_events_engagement
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_engagement_score_update();

-- Insert Sample KPI Definitions
INSERT INTO kpi_definitions (organization_id, name, description, formula, target_value, unit, category) VALUES
  ((SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 'Daily Active Users', 'Number of unique users who logged in today', 'SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = ''login'' AND DATE(timestamp) = CURRENT_DATE', 100, 'users', 'engagement'),
  ((SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 'Message Volume', 'Total messages sent in the period', 'SELECT COUNT(*) FROM analytics_events WHERE event_type = ''message_sent'' AND timestamp >= $1 AND timestamp < $2', 1000, 'messages', 'communication'),
  ((SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 'Task Completion Rate', 'Percentage of tasks marked as completed', 'SELECT (COUNT(*) FILTER (WHERE status = ''completed'')::float / COUNT(*) * 100 FROM tasks WHERE created_at >= $1 AND created_at < $2', 85, '%', 'productivity'),
  ((SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 'Approval Cycle Time', 'Average time to complete approval requests', 'SELECT AVG(EXTRACT(EPOCH FROM (metadata->>'response_time')::bigint)) FROM analytics_events WHERE event_type = ''approval_completed'' AND timestamp >= $1 AND timestamp < $2', 24, 'hours', 'efficiency'),
  ((SELECT id FROM organizations WHERE slug = 'worksphere-engagement'), 'User Engagement Score', 'Average engagement score across all users', 'SELECT AVG(engagement_score) FROM user_engagement_scores', 75, 'score', 'engagement');

-- Insert Sample Dashboard
INSERT INTO analytics_dashboards (organization_id, name, created_by, widgets, is_default, layout) VALUES
  ((SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 'Executive Dashboard', (SELECT id FROM users WHERE role = 'ceo' LIMIT 1), 
  '[
    {"type": "kpi", "id": "active_users", "title": "Active Users", "icon": "users", "color": "#3B82F6"},
    {"type": "kpi", "id": "messages", "title": "Messages", "icon": "message-square", "color": "#10B981"},
    {"type": "kpi", "id": "tasks", "title": "Tasks Completed", "icon": "check-circle", "color": "#059669"},
    {"type": "kpi", "id": "approvals", "title": "Pending Approvals", "icon": "clock", "color": "#F59E0B"},
    {"type": "chart", "id": "user_growth", "title": "User Growth", "type": "line", "height": 300},
    {"type": "chart", "id": "department_activity", "title": "Department Activity", "type": "bar", "height": 300},
    {"type": "feed", "id": "activity_feed", "title": "Live Activity", "height": 400}
  ]',
  true,
  '{"sidebar": {"width": 250, "widgets": ["active_users", "messages", "tasks", "approvals"]}, "main": {"widgets": [{"type": "chart", "id": "user_growth", "width": 6}, {"type": "chart", "id": "department_activity", "width": 6}]}, "footer": {"widgets": ["activity_feed"]}}'
  );

-- Create Sample Report Template
INSERT INTO report_templates (organization_id, name, description, type, query, parameters, layout, created_by, is_public, category) VALUES
  ((SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 'Weekly Productivity Report', 'Comprehensive weekly productivity overview', 'executive', 
  'SELECT * FROM get_executive_dashboard('week')', 
  '{"time_range": "week"}',
  '{"sections": [{"title": "Overview", "widgets": ["active_users", "messages", "tasks", "approvals"]}, {"title": "Charts", "widgets": ["user_growth", "department_activity"]}, {"title": "Details", "widgets": ["activity_feed"]}]}',
  (SELECT id FROM users WHERE role = 'ceo' LIMIT 1),
  false,
  'productivity'
  );

-- Create Sample Report Template
INSERT INTO report_templates (organization_id, name, description, type, query, parameters, layout, created_by, is_public, category) VALUES
  ((SELECT id FROM organizations WHERE slug = 'worksphere-engagement'), 'Department Performance', 'Monthly department performance comparison', 'department',
  'SELECT 
    d.name,
    COUNT(*) FILTER (WHERE ae.event_type = ''message_sent'') as messages,
    COUNT(*) FILTER (WHERE ae.event_type = ''task_completed'') as tasks,
    AVG(CASE WHEN u.role = ''manager'' THEN 1 ELSE 0 END) as manager_score
  FROM analytics_events ae
  JOIN users u ON u.id = ae.user_id
  JOIN departments d ON d.id = u.department_id
  WHERE ae.organization_id = $1
    AND ae.timestamp >= $1 AND ae.timestamp < $2
    AND ae.event_type IN (''message_sent'', ''task_completed'')
  GROUP BY d.name, u.role
  ORDER BY messages DESC, tasks DESC',
  '{"department": "department", "time_range": "month", "chart_type": "bar"}',
  '{"sections": [{"title": "Department Overview", "widgets": ["department_performance"]}, {"title": "Details", "widgets": ["department_details"]}]}',
  (SELECT id FROM users WHERE role = 'ceo' LIMIT 1),
  false,
  'management'
  );

-- Insert Sample User Engagement Data
INSERT INTO user_engagement_scores (organization_id, user_id, engagement_score, login_count, message_count, task_completion_rate, approval_response_time, document_activity, last_calculated)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  calculate_engagement_score(u.id) as engagement_score,
  0 as login_count,
  0 as message_count,
  0 as task_completion_rate,
  0 as approval_response_time,
  0 as document_activity,
  NOW() as last_calculated
FROM organizations o
JOIN users u ON u.organization_id = o.id
WHERE o.slug = 'worksphere-engagement';

-- Insert Sample Activity Data for Testing
INSERT INTO analytics_events (organization_id, user_id, event_type, entity_type, entity_id, metadata, timestamp)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  'login' as event_type,
  'user' as entity_type,
  u.id as entity_id,
  '{}' as metadata,
  NOW() - (random() * INTERVAL '7 days') as timestamp
FROM organizations o
JOIN users u ON u.organization_id = o.id
WHERE o.slug = 'worksphere-technologies'
LIMIT 50;

INSERT INTO analytics_events (organization_id, user_id, event_type, entity_type, entity_id, metadata, timestamp)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  'message_sent' as event_type,
  'message' as entity_type,
  m.id as entity_id,
  json_build_object('response_time', EXTRACT(EPOCH FROM (m.updated_at - m.created_at))) as metadata,
  m.created_at as timestamp
FROM organizations o
JOIN users u ON u.organization_id = o.id
JOIN messages m ON m.sender_id = u.id
WHERE o.slug = 'worksphere-technologies'
  AND m.created_at >= NOW() - INTERVAL '7 days'
LIMIT 200;

INSERT INTO analytics_events (organization_id, user_id, event_type, entity_type, entity_id, metadata, timestamp)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  'task_completed' as event_type,
  'task' as entity_type,
  t.id as entity_id,
  json_build_object('priority', t.priority, 'time_taken', EXTRACT(EPOCH FROM (t.completed_at - t.created_at))) as metadata,
  t.completed_at as timestamp
FROM organizations o
JOIN users u ON u.organization_id = o.id
JOIN tasks t ON t.assigned_to = u.id
WHERE o.slug = 'worksphere-technologies'
  AND t.status = 'completed'
  AND t.completed_at >= NOW() - INTERVAL '7 days'
LIMIT 150;

INSERT INTO analytics_events (organization_id, user_id, event_type, entity_type, entity_id, metadata, timestamp)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  'document_uploaded' as event_type,
  'file' as entity_type,
  f.id as entity_id,
  json_build_object('file_size', f.size, 'file_type', f.format) as metadata,
  f.created_at as timestamp
FROM organizations o
JOIN users u ON u.organization_id = o.id
JOIN files f ON f.uploaded_by = u.id
WHERE o.slug = 'worksphere-technologies'
  AND f.created_at >= NOW() - INTERVAL '7 days'
LIMIT 100;

INSERT INTO analytics_events (organization_id, user_id, event_type, entity_type, entity_id, metadata, timestamp)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  'approval_completed' as event_type,
  'approval' as entity_type,
  a.id as entity_id,
  json_build_object('priority', a.priority, 'time_taken', EXTRACT(EPOCH FROM (a.updated_at - a.created_at))) as metadata,
  a.updated_at as timestamp
FROM organizations o
JOIN users u ON u.organization_id = o.id
JOIN approvals a ON a.approver_id = u.id
WHERE o.slug = 'worksphere-technologies'
  AND a.status = 'approved'
  AND a.updated_at >= NOW() - INTERVAL '7 days'
LIMIT 75;

-- Create Heatmap Sample Data
INSERT INTO user_activity_heatmap (organization_id, user_id, date, hour, activity_count, message_count, task_count, approval_count, document_count)
SELECT 
  o.id as organization_id,
  u.id as user_id,
  DATE(ae.timestamp) as date,
  EXTRACT(HOUR FROM ae.timestamp) as hour,
  COUNT(*) as activity_count,
  COUNT(*) FILTER (WHERE ae.event_type = 'message_sent') as message_count,
  COUNT(*) FILTER (WHERE ae.event_type = 'task_completed') as task_count,
  COUNT(*) FILTER (WHERE ae.event_type = 'approval_completed') as approval_count,
  COUNT(*) FILTER (WHERE ae.event_type = 'document_uploaded') as document_count,
  ae.timestamp as timestamp
FROM organizations o
JOIN users u ON u.organization_id = o.id
JOIN analytics_events ae ON ae.user_id = u.id
WHERE o.slug = 'worksphere-technologies'
  AND ae.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY o.id, u.id, DATE(ae.timestamp), EXTRACT(HOUR FROM ae.timestamp)
ORDER BY date DESC, hour DESC;

COMMIT;
