-- Create missing tables for the application
-- These tables are referenced in the code but don't exist yet

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  file_urls TEXT[],
  file_types TEXT[],
  is_deleted BOOLEAN DEFAULT FALSE,
  read_by UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they are part of" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    auth.uid() IS NULL -- Allow anonymous for now during testing
  );

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Service role can manage messages" ON messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- TASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view tasks assigned to them" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    assigned_by = auth.uid() OR
    auth.uid() IS NULL -- Allow anonymous for now during testing
  );

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can update tasks they manage" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    assigned_by = auth.uid()
  );

CREATE POLICY "Service role can manage tasks" ON tasks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- DEPARTMENTS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Users can view their organization departments" ON departments
  FOR SELECT USING (
    auth.uid() IS NULL -- Allow anonymous for now during testing
  );

CREATE POLICY "Service role can manage departments" ON departments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON departments(organization_id);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  table_name,
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('messages', 'tasks', 'departments')
ORDER BY table_name;
