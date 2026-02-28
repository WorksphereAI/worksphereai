-- WorkSphere AI - Offline Sync Schema
-- Phase 3: Enterprise Scale & Market Expansion

-- Offline Queue for Pending Sync Operations
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  record_id UUID,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Device Registry for User Devices
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'web')),
  platform TEXT,
  push_token TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Offline Cache Metadata
CREATE TABLE IF NOT EXISTS offline_cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_version INTEGER DEFAULT 1,
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id, table_name)
);

-- Conflict Resolution Log
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  server_version JSONB,
  client_version JSONB,
  resolution_strategy TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offline_sync_queue_status ON offline_sync_queue(status, created_at);
CREATE INDEX idx_offline_sync_queue_user ON offline_sync_queue(user_id, device_id);
CREATE INDEX idx_user_devices_user ON user_devices(user_id);
CREATE INDEX idx_user_devices_push ON user_devices(push_token);
CREATE INDEX idx_offline_cache_metadata_user ON offline_cache_metadata(user_id, device_id);

-- Enable RLS
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sync queue" ON offline_sync_queue
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own devices" ON user_devices
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their cache metadata" ON offline_cache_metadata
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their sync conflicts" ON sync_conflicts
  FOR ALL USING (user_id = auth.uid());

-- Function to process sync queue
CREATE OR REPLACE FUNCTION process_sync_queue(p_device_id TEXT)
RETURNS TABLE(
  id UUID,
  operation_type TEXT,
  table_name TEXT,
  record_id UUID,
  data JSONB,
  status TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_queue_item RECORD;
  v_result JSONB;
  v_error_message TEXT;
BEGIN
  -- Get next pending item for this device
  SELECT * INTO v_queue_item
  FROM offline_sync_queue
  WHERE device_id = p_device_id 
    AND status = 'pending'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Update status to processing
  UPDATE offline_sync_queue
  SET status = 'processing',
      updated_at = NOW()
  WHERE id = v_queue_item.id;

  -- Process based on operation type
  BEGIN
    CASE v_queue_item.operation_type
      WHEN 'create' THEN
        EXECUTE format('INSERT INTO %I SELECT * FROM jsonb_to_record($1) AS t(%s)', 
                      v_queue_item.table_name,
                      get_table_columns(v_queue_item.table_name))
        USING v_queue_item.data;
        
      WHEN 'update' THEN
        EXECUTE format('UPDATE %I SET %s WHERE id = $1', 
                      v_queue_item.table_name,
                      build_update_clause(v_queue_item.data))
        USING v_queue_item.record_id;
        
      WHEN 'delete' THEN
        EXECUTE format('DELETE FROM %I WHERE id = $1', v_queue_item.table_name)
        USING v_queue_item.record_id;
    END CASE;

    -- Mark as completed
    UPDATE offline_sync_queue
    SET status = 'completed',
        synced_at = NOW(),
        updated_at = NOW()
    WHERE id = v_queue_item.id;

    RETURN QUERY
    SELECT 
      v_queue_item.id,
      v_queue_item.operation_type,
      v_queue_item.table_name,
      v_queue_item.record_id,
      v_queue_item.data,
      'completed'::TEXT,
      NULL::TEXT;

  EXCEPTION WHEN OTHERS THEN
    v_error_message := SQLERRM;
    
    -- Increment retry count
    UPDATE offline_sync_queue
    SET status = 'failed',
        retry_count = retry_count + 1,
        error_message = v_error_message,
        updated_at = NOW()
    WHERE id = v_queue_item.id;

    RETURN QUERY
    SELECT 
      v_queue_item.id,
      v_queue_item.operation_type,
      v_queue_item.table_name,
      v_queue_item.record_id,
      v_queue_item.data,
      'failed'::TEXT,
      v_error_message;
  END;
END;
$$;

-- Helper function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(p_table_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_columns TEXT := '';
BEGIN
  SELECT string_agg(column_name || ' ' || data_type, ', ')
  INTO v_columns
  FROM information_schema.columns
  WHERE table_name = p_table_name
    AND table_schema = 'public';
  
  RETURN v_columns;
END;
$$;

-- Helper function to build UPDATE clause
CREATE OR REPLACE FUNCTION build_update_clause(p_data JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_clause TEXT := '';
  v_key TEXT;
BEGIN
  FOR v_key IN SELECT jsonb_object_keys(p_data)
  LOOP
    v_clause := v_clause || v_key || ' = ' || quote_literal(p_data->>v_key) || ', ';
  END LOOP;
  
  RETURN rtrim(v_clause, ', ');
END;
$$;

-- Function to register device
CREATE OR REPLACE FUNCTION register_device(
  p_user_id UUID,
  p_device_id TEXT,
  p_device_name TEXT,
  p_device_type TEXT,
  p_platform TEXT,
  p_push_token TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_device_id UUID;
BEGIN
  INSERT INTO user_devices (
    user_id, device_id, device_name, device_type, platform, push_token, last_active
  ) VALUES (
    p_user_id, p_device_id, p_device_name, p_device_type, p_platform, p_push_token, NOW()
  )
  ON CONFLICT (user_id, device_id) 
  DO UPDATE SET
    device_name = EXCLUDED.device_name,
    device_type = EXCLUDED.device_type,
    platform = EXCLUDED.platform,
    push_token = COALESCE(EXCLUDED.push_token, user_devices.push_token),
    last_active = EXCLUDED.last_active,
    updated_at = NOW()
  RETURNING id INTO v_device_id;
  
  RETURN v_device_id;
END;
$$;

-- Function to update cache metadata
CREATE OR REPLACE FUNCTION update_cache_metadata(
  p_user_id UUID,
  p_device_id TEXT,
  p_table_name TEXT,
  p_record_count INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO offline_cache_metadata (
    user_id, device_id, table_name, last_sync, record_count
  ) VALUES (
    p_user_id, p_device_id, p_table_name, NOW(), p_record_count
  )
  ON CONFLICT (user_id, device_id, table_name)
  DO UPDATE SET
    last_sync = EXCLUDED.last_sync,
    record_count = EXCLUDED.record_count,
    sync_version = offline_cache_metadata.sync_version + 1,
    updated_at = NOW();
END;
$$;

-- Function to log sync conflict
CREATE OR REPLACE FUNCTION log_sync_conflict(
  p_organization_id UUID,
  p_user_id UUID,
  p_device_id TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_server_version JSONB,
  p_client_version JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict_id UUID;
BEGIN
  INSERT INTO sync_conflicts (
    organization_id, user_id, device_id, table_name, record_id,
    server_version, client_version
  ) VALUES (
    p_organization_id, p_user_id, p_device_id, p_table_name, p_record_id,
    p_server_version, p_client_version
  )
  RETURNING id INTO v_conflict_id;
  
  RETURN v_conflict_id;
END;
$$;

-- Enable Real-time for sync tables
ALTER PUBLICATION supabase_realtime ADD TABLE offline_sync_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE user_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_conflicts;

-- Insert sample device data for testing
INSERT INTO user_devices (user_id, device_id, device_name, device_type, platform, last_active)
SELECT 
  u.id,
  'device-' || gen_random_uuid()::TEXT,
  'Test Device',
  'mobile',
  'web',
  NOW()
FROM users u
WHERE u.role = 'employee'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert sample sync queue data for testing
INSERT INTO offline_sync_queue (
  organization_id, user_id, device_id, operation_type, table_name, record_id, data
)
SELECT 
  o.id,
  u.id,
  d.device_id,
  'create',
  'messages',
  gen_random_uuid(),
  json_build_object(
    'content', 'Test message from offline',
    'channel_id', (SELECT id FROM channels LIMIT 1),
    'sender_id', u.id,
    'created_at', NOW()
  )
FROM organizations o
JOIN users u ON u.organization_id = o.id
JOIN user_devices d ON d.user_id = u.id
WHERE o.slug = 'worksphere-technologies'
LIMIT 10
ON CONFLICT DO NOTHING;

COMMIT;
