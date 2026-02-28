-- WorkSphere AI - Approval Workflow System Schema
-- Add to existing schema after core tables are created

-- Approval Requests Table
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('leave', 'budget', 'document', 'expense', 'procurement')),
  title TEXT NOT NULL,
  description TEXT,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  data JSONB DEFAULT '{}', -- Store specific data like dates, amounts, etc.
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Steps Table (for multi-level approval chains)
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  comments TEXT,
  action_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Templates Table (for common approval types)
CREATE TABLE approval_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  required_fields JSONB DEFAULT '{}', -- Define required fields for this template
  approval_chain JSONB DEFAULT '[]', -- Define approval sequence
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Notifications Table
CREATE TABLE approval_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'push', 'sms', 'in_app')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_approval_requests_requester ON approval_requests(requester_id);
CREATE INDEX idx_approval_requests_org ON approval_requests(organization_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_type ON approval_requests(type);
CREATE INDEX idx_approval_requests_created ON approval_requests(created_at);

CREATE INDEX idx_approval_steps_request ON approval_steps(request_id);
CREATE INDEX idx_approval_steps_approver ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);

CREATE INDEX idx_approval_notifications_request ON approval_notifications(request_id);
CREATE INDEX idx_approval_notifications_user ON approval_notifications(user_id);

-- Row Level Security for Approval Tables
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Approval Requests
CREATE POLICY "Users can view their own approval requests" ON approval_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Users can view approval requests in their organization" ON approval_requests
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Approvers can view assigned approval requests" ON approval_requests
  FOR SELECT USING (
    id IN (
      SELECT request_id FROM approval_steps 
      WHERE approver_id = auth.uid()
    )
  );

CREATE POLICY "Users can create approval requests" ON approval_requests
  FOR INSERT WITH CHECK (
    requester_id = auth.uid()
  );

CREATE POLICY "Users can update their own requests" ON approval_requests
  FOR UPDATE USING (requester_id = auth.uid());

-- RLS Policies for Approval Steps
CREATE POLICY "Approvers can view their approval steps" ON approval_steps
  FOR SELECT USING (approver_id = auth.uid());

CREATE POLICY "Approvers can update their approval steps" ON approval_steps
  FOR UPDATE USING (approver_id = auth.uid());

-- RLS Policies for Approval Templates
CREATE POLICY "Users can view templates in their organization" ON approval_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for Approval Notifications
CREATE POLICY "Users can view their notifications" ON approval_notifications
  FOR SELECT USING (user_id = auth.uid());

-- Enable real-time for approval tables
ALTER PUBLICATION supabase_realtime ADD TABLE approval_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_notifications;

-- Insert sample approval templates
INSERT INTO approval_templates (name, type, organization_id, required_fields, approval_chain) VALUES
('Leave Request', 'leave', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'), 
 '{"start_date": {"required": true, "type": "date"}, "end_date": {"required": true, "type": "date"}, "reason": {"required": true, "type": "text"}}',
 '[{"role": "manager", "condition": "department_manager"}, {"role": "hr", "condition": "duration_gt_3_days"}]'),

('Budget Approval', 'budget', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'),
 '{"amount": {"required": true, "type": "number"}, "description": {"required": true, "type": "text"}, "category": {"required": true, "type": "select"}}',
 '[{"role": "manager", "condition": "amount_lt_1000"}, {"role": "director", "condition": "amount_gte_1000"}]'),

('Document Approval', 'document', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'),
 '{"document_url": {"required": true, "type": "file"}, "description": {"required": true, "type": "text"}, "confidentiality": {"required": true, "type": "select"}}',
 '[{"role": "manager", "condition": "confidentiality_neq_high"}, {"role": "compliance", "condition": "confidentiality_eq_high"}]');

-- Triggers for updated_at timestamps
CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_steps_updated_at
  BEFORE UPDATE ON approval_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_templates_updated_at
  BEFORE UPDATE ON approval_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_notifications_updated_at
  BEFORE UPDATE ON approval_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
