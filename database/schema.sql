-- WorkSphere AI Database Schema
-- Intelligent Corporate Operating System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  manager_id UUID, -- Will be updated later with users table reference
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ceo', 'manager', 'employee', 'customer')),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  avatar_url TEXT,
  last_active TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels table (for messaging)
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('department', 'project', 'direct', 'announcement')),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  members TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  file_urls TEXT[] DEFAULT '{}',
  file_types TEXT[] DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT FALSE,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approvals table
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('leave', 'budget', 'document', 'expense')),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  data JSONB DEFAULT '{}',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  format TEXT,
  size BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_channels_organization_id ON channels(organization_id);
CREATE INDEX idx_channels_department_id ON channels(department_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_department_id ON tasks(department_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_approvals_requester_id ON approvals(requester_id);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_organization_id ON files(organization_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Organizations RLS Policies
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users RLS Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view users in same organization" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Departments RLS Policies
CREATE POLICY "Users can view departments in their organization" ON departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Channels RLS Policies
CREATE POLICY "Users can view channels they are members of" ON channels
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND
    (
      type = 'announcement' OR
      members @> ARRAY[auth.uid()::text] OR
      department_id IN (
        SELECT department_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Messages RLS Policies
CREATE POLICY "Users can view messages they are involved in" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    channel_id IN (
      SELECT id FROM channels WHERE 
        members @> ARRAY[auth.uid()::text] OR
        type = 'announcement'
    )
  );

-- Tasks RLS Policies
CREATE POLICY "Users can view their assigned tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    assigned_by = auth.uid() OR
    department_id IN (
      SELECT department_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks assigned to them" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid());

-- Approvals RLS Policies
CREATE POLICY "Users can view their own approvals" ON approvals
  FOR SELECT USING (
    requester_id = auth.uid() OR
    approver_id = auth.uid()
  );

CREATE POLICY "Users can update approvals assigned to them" ON approvals
  FOR UPDATE USING (approver_id = auth.uid());

-- Files RLS Policies
CREATE POLICY "Users can view files in their organization" ON files
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Activity Logs RLS Policies
CREATE POLICY "Users can view activity logs in their organization" ON activity_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Functions for common operations
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for departments.manager_id after users table is created
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at
    BEFORE UPDATE ON approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO organizations (name, slug) VALUES 
('WorkSphere Technologies', 'worksphere-technologies'),
('Demo Company', 'demo-company');

-- Insert sample departments
INSERT INTO departments (name, organization_id) VALUES 
('Sales', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Development', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Marketing', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Operations', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'));

-- Insert sample users (passwords will be set through Supabase Auth)
INSERT INTO users (email, full_name, role, organization_id, department_id) VALUES 
('ceo@worksphere.app', 'CEO WorkSphere', 'ceo', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), NULL),
('manager@worksphere.app', 'Manager Sales', 'manager', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), (SELECT id FROM departments WHERE name = 'Sales')),
('dev@worksphere.app', 'Developer One', 'employee', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), (SELECT id FROM departments WHERE name = 'Development')),
('marketing@worksphere.app', 'Marketing Specialist', 'employee', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), (SELECT id FROM departments WHERE name = 'Marketing'));

-- Insert sample channels
INSERT INTO channels (name, type, organization_id, department_id, members) VALUES 
('General', 'announcement', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), NULL, '{}'),
('Sales Team', 'department', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), (SELECT id FROM departments WHERE name = 'Sales'), '{}'),
('Development Team', 'department', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), (SELECT id FROM departments WHERE name = 'Development'), '{}');
