-- WorkSphere AI - Customer Portal Schema
-- Phase 3: Enterprise Scale & Market Expansion

-- External Users (Customers, Partners)
CREATE TABLE IF NOT EXISTS external_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, organization_id)
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('customer', 'agent', 'system')),
  sender_id UUID, -- references either users or external_users
  sender_name TEXT,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Documents
CREATE TABLE IF NOT EXISTS customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  uploaded_by UUID, -- references either users or external_users
  uploaded_by_type TEXT CHECK (uploaded_by_type IN ('agent', 'customer')),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Messages (Direct Chat)
CREATE TABLE IF NOT EXISTS customer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('customer', 'agent')),
  sender_id UUID, -- references either users or external_users
  sender_name TEXT,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Articles
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES users(id),
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Categories
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES kb_categories(id),
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Feedback
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Level Agreements
CREATE TABLE IF NOT EXISTS service_level_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  response_time_hours INTEGER,
  resolution_time_hours INTEGER,
  business_hours_only BOOLEAN DEFAULT TRUE,
  priority_levels JSONB DEFAULT '{
    "low": {"response": 24, "resolution": 72},
    "medium": {"response": 8, "resolution": 48},
    "high": {"response": 4, "resolution": 24},
    "urgent": {"response": 1, "resolution": 8}
  }',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_support_tickets_org ON support_tickets(organization_id, created_at DESC);
CREATE INDEX idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status, priority);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX idx_customer_documents_customer ON customer_documents(customer_id);
CREATE INDEX idx_customer_messages_customer ON customer_messages(customer_id, created_at DESC);
CREATE INDEX idx_kb_articles_org ON knowledge_base_articles(organization_id, category);
CREATE INDEX idx_kb_articles_slug ON knowledge_base_articles(slug);
CREATE INDEX idx_customer_feedback_customer ON customer_feedback(customer_id);

-- Enable RLS
ALTER TABLE external_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for External Users
CREATE POLICY "Agents can manage external users" ON external_users
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "External users can view their own data" ON external_users
  FOR SELECT USING (
    email = current_setting('app.user_email', TRUE)
  );

-- RLS Policies for Support Tickets
CREATE POLICY "Agents can manage tickets" ON support_tickets
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their tickets" ON support_tickets
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM external_users WHERE email = current_setting('app.user_email', TRUE)
    )
  );

-- RLS Policies for Ticket Messages
CREATE POLICY "Agents can view all ticket messages" ON ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can view their ticket messages" ON ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets WHERE customer_id IN (
        SELECT id FROM external_users WHERE email = current_setting('app.user_email', TRUE)
      )
    )
  );

CREATE POLICY "Users can create ticket messages" ON ticket_messages
  FOR INSERT WITH CHECK (
    (auth.uid() IN (SELECT id FROM users WHERE organization_id = (
      SELECT organization_id FROM support_tickets WHERE id = ticket_id
    ))) OR
    (current_setting('app.user_email', TRUE) IN (
      SELECT email FROM external_users WHERE id = (
        SELECT customer_id FROM support_tickets WHERE id = ticket_id
      )
    ))
  );

-- RLS Policies for Customer Documents
CREATE POLICY "Agents can manage customer documents" ON customer_documents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their documents" ON customer_documents
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM external_users WHERE email = current_setting('app.user_email', TRUE)
    )
  );

CREATE POLICY "Customers can upload documents" ON customer_documents
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM external_users WHERE email = current_setting('app.user_email', TRUE)
    )
  );

-- RLS Policies for Customer Messages
CREATE POLICY "Agents can view customer messages" ON customer_messages
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their messages" ON customer_messages
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM external_users WHERE email = current_setting('app.user_email', TRUE)
    )
  );

-- RLS Policies for Knowledge Base
CREATE POLICY "Agents can manage knowledge base" ON knowledge_base_articles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view published articles" ON knowledge_base_articles
  FOR SELECT USING (is_published = true);

-- RLS Policies for Customer Feedback
CREATE POLICY "Agents can view feedback" ON customer_feedback
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can submit feedback" ON customer_feedback
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM external_users WHERE email = current_setting('app.user_email', TRUE)
    )
  );

-- Enable Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_documents;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(NEW.created_at, 'YYYY');
  
  SELECT COALESCE(MAX(SUBSTRING(ticket_number FROM 9)::INTEGER), 0) + 1
  INTO sequence_num
  FROM support_tickets
  WHERE ticket_number LIKE 'TKT-' || year_prefix || '-%';
  
  NEW.ticket_number := 'TKT-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Function to calculate ticket metrics
CREATE OR REPLACE FUNCTION get_ticket_metrics(p_organization_id UUID, p_date_range TEXT DEFAULT '30 days')
RETURNS TABLE(
  total_tickets BIGINT,
  open_tickets BIGINT,
  resolved_tickets BIGINT,
  avg_resolution_time INTERVAL,
  customer_satisfaction DECIMAL,
  tickets_by_category JSONB,
  tickets_by_priority JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_start_date := NOW() - (p_date_range::INTERVAL);
  
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status IN ('open', 'in_progress', 'waiting'))::BIGINT,
    COUNT(*) FILTER (WHERE status IN ('resolved', 'closed'))::BIGINT,
    AVG(resolved_at - created_at) FILTER (WHERE resolved_at IS NOT NULL),
    COALESCE(AVG(rating), 0)::DECIMAL,
    jsonb_object_agg(category, ticket_count) FILTER (WHERE category IS NOT NULL),
    jsonb_object_agg(priority, ticket_count) FILTER (WHERE priority IS NOT NULL)
  FROM (
    SELECT 
      st.*,
      COUNT(*) OVER (PARTITION BY category) as ticket_count
    FROM support_tickets st
    WHERE st.organization_id = p_organization_id
      AND st.created_at >= v_start_date
  ) grouped_tickets
  LEFT JOIN customer_feedback cf ON cf.ticket_id = grouped_tickets.id;
END;
$$;

-- Function to get customer portal stats
CREATE OR REPLACE FUNCTION get_customer_portal_stats(p_customer_id UUID)
RETURNS TABLE(
  total_tickets BIGINT,
  open_tickets BIGINT,
  resolved_tickets BIGINT,
  documents_count BIGINT,
  messages_count BIGINT,
  last_ticket_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM support_tickets WHERE customer_id = p_customer_id),
    (SELECT COUNT(*) FROM support_tickets WHERE customer_id = p_customer_id AND status IN ('open', 'in_progress', 'waiting')),
    (SELECT COUNT(*) FROM support_tickets WHERE customer_id = p_customer_id AND status IN ('resolved', 'closed')),
    (SELECT COUNT(*) FROM customer_documents WHERE customer_id = p_customer_id),
    (SELECT COUNT(*) FROM customer_messages WHERE customer_id = p_customer_id),
    (SELECT MAX(created_at) FROM support_tickets WHERE customer_id = p_customer_id);
END;
$$;

-- Function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(p_query TEXT, p_organization_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  category TEXT,
  helpful_count INTEGER,
  views INTEGER,
  search_rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kba.id,
    kba.title,
    kba.slug,
    kba.excerpt,
    kba.category,
    kba.helpful_count,
    kba.views,
    ts_rank(
      to_tsvector('english', COALESCE(kba.title, '') || ' ' || COALESCE(kba.content, '') || ' ' || COALESCE(kba.excerpt, '')),
      plainto_tsquery('english', p_query)
    )::REAL
  FROM knowledge_base_articles kba
  WHERE kba.is_published = true
    AND (p_organization_id IS NULL OR kba.organization_id = p_organization_id)
    AND (
      to_tsvector('english', COALESCE(kba.title, '') || ' ' || COALESCE(kba.content, '') || ' ' || COALESCE(kba.excerpt, ''))
      @@ plainto_tsquery('english', p_query)
      OR kba.title ILIKE '%' || p_query || '%'
      OR kba.excerpt ILIKE '%' || p_query || '%'
    )
  ORDER BY search_rank DESC, kba.views DESC
  LIMIT 20;
END;
$$;

-- Insert sample SLA
INSERT INTO service_level_agreements (organization_id, name, response_time_hours, resolution_time_hours)
SELECT 
  id,
  'Standard SLA',
  24,
  72
FROM organizations
WHERE slug = 'worksphere-technologies'
ON CONFLICT DO NOTHING;

-- Insert sample knowledge base categories
INSERT INTO kb_categories (organization_id, name, slug, description, icon, order_index)
SELECT 
  id,
  'Getting Started',
  'getting-started',
  'Basic guides and tutorials for new customers',
  'book-open',
  1
FROM organizations
WHERE slug = 'worksphere-technologies'
ON CONFLICT DO NOTHING;

INSERT INTO kb_categories (organization_id, name, slug, description, icon, order_index)
SELECT 
  id,
  'Support',
  'support',
  'Common issues and troubleshooting',
  'help-circle',
  2
FROM organizations
WHERE slug = 'worksphere-technologies'
ON CONFLICT DO NOTHING;

-- Insert sample knowledge base articles
INSERT INTO knowledge_base_articles (
  organization_id, title, slug, content, excerpt, category, author_id, is_published, published_at
)
SELECT 
  o.id,
  'Getting Started with WorkSphere AI',
  'getting-started-worksphere-ai',
  '# Getting Started with WorkSphere AI

Welcome to WorkSphere AI! This comprehensive guide will help you get up and running quickly.

## What is WorkSphere AI?

WorkSphere AI is an intelligent corporate operating system designed to streamline your business operations, enhance team collaboration, and provide powerful analytics insights.

## Key Features

### 1. Real-time Communication
- Instant messaging between team members
- Channel-based discussions
- File sharing and collaboration
- Video conferencing integration

### 2. Task Management
- Create and assign tasks
- Track progress and deadlines
- Automated notifications
- Performance analytics

### 3. Document Management
- Secure file storage
- Version control
- Access permissions
- Advanced search capabilities

### 4. Analytics Dashboard
- Real-time performance metrics
- Custom reports
- Business intelligence
- Predictive insights

## Getting Started

### Step 1: Complete Your Profile
1. Log in to your account
2. Navigate to Settings
3. Update your profile information
4. Upload a profile picture
5. Set your notification preferences

### Step 2: Join Your Team
1. Accept the team invitation sent to your email
2. Join relevant channels
3. Introduce yourself in the general channel
4. Explore the organization structure

### Step 3: Start Using Key Features
1. Send your first message
2. Create your first task
3. Upload a document
4. Explore the analytics dashboard

## Tips for Success

- **Be Active**: Regular participation helps you stay connected
- **Use Channels**: Keep discussions organized by using appropriate channels
- **Set Notifications**: Configure notifications to stay informed without being overwhelmed
- **Explore Features**: Take time to discover all available features

## Need Help?

If you need assistance:
- Check our knowledge base for detailed guides
- Contact our support team
- Join our community forums

## Next Steps

Now that you''re familiar with the basics, consider:
- Exploring advanced features
- Setting up integrations
- Customizing your workspace
- Learning about analytics

Welcome to WorkSphere AI - we''re excited to have you on board!',
  'Complete guide to getting started with WorkSphere AI, including key features, setup steps, and tips for success.',
  'Getting Started',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true,
  NOW()
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO knowledge_base_articles (
  organization_id, title, slug, content, excerpt, category, author_id, is_published, published_at
)
SELECT 
  o.id,
  'How to Create a Support Ticket',
  'how-to-create-support-ticket',
  '# How to Create a Support Ticket

This guide will walk you through the process of creating and managing support tickets in WorkSphere AI.

## What is a Support Ticket?

A support ticket is a formal request for assistance from our support team. Tickets help us track, prioritize, and resolve your issues efficiently.

## When to Create a Ticket

Create a support ticket when you need help with:
- Technical issues or bugs
- Account problems
- Feature requests
- Billing inquiries
- General questions not covered in our knowledge base

## Creating a Ticket

### Step 1: Access the Customer Portal
1. Log in to your WorkSphere AI account
2. Navigate to the Customer Portal
3. Click on "Support" or "Tickets"

### Step 2: Create New Ticket
1. Click the "New Ticket" button
2. Fill in the required information:
   - **Subject**: Brief description of your issue
   - **Category**: Select the most relevant category
   - **Priority**: Choose urgency level (Low, Medium, High, Urgent)
   - **Description**: Detailed explanation of your issue

### Step 3: Provide Additional Information
- Include screenshots if applicable
- Upload relevant documents
- Specify any error messages
- Mention steps to reproduce the issue

### Step 4: Submit the Ticket
1. Review your information
2. Click "Submit Ticket"
3. Note your ticket number for reference

## Ticket Statuses

### Open
Your ticket has been received and is waiting for initial response.

### In Progress
A support agent is actively working on your ticket.

### Waiting
We are waiting for additional information from you.

### Resolved
The issue has been addressed. Please confirm if you''re satisfied.

### Closed
The ticket is complete and archived.

## Best Practices

### Writing Effective Ticket Descriptions
- Be specific and detailed
- Include error messages exactly as they appear
- Describe what you expected to happen
- List steps you''ve already tried

### Choosing the Right Priority
- **Low**: General questions, non-urgent issues
- **Medium**: Issues affecting your workflow but not blocking
- **High**: Problems preventing normal operations
- **Urgent**: Critical system failures affecting multiple users

### Providing Context
- Include your account information
- Mention recent changes or updates
- Describe the impact on your business

## Response Times

Our Service Level Agreement (SLA) guarantees:
- **Urgent**: 1 hour response, 8 hour resolution
- **High**: 4 hour response, 24 hour resolution
- **Medium**: 8 hour response, 48 hour resolution
- **Low**: 24 hour response, 72 hour resolution

## Tracking Your Ticket

1. View ticket status in the Customer Portal
2. Receive email notifications for updates
3. Add comments or additional information
4. Rate the support experience

## Escalation

If you''re not satisfied with the response:
1. Reply to the ticket requesting escalation
2. Contact our support manager directly
3. Use the feedback system to rate your experience

## Tips for Faster Resolution

- Provide complete information upfront
- Respond promptly to agent questions
- Use the knowledge base for common issues
- Keep related issues in the same ticket

## Frequently Asked Questions

### Can I create multiple tickets for the same issue?
No, please keep related issues in one ticket for better tracking.

### How do I add more information to an existing ticket?
Log in to the Customer Portal, find your ticket, and add a comment.

### What if my issue is urgent?
Use the "Urgent" priority and provide detailed information about the business impact.

### Can I talk to someone directly?
For urgent issues, you can request a phone call in your ticket.

## Conclusion

Creating effective support tickets helps us provide you with faster, more accurate assistance. If you have questions about the ticket system, don''t hesitate to ask!

Remember: Our goal is to resolve your issues quickly and effectively. The more information you provide, the better we can help you.',
  'Step-by-step guide to creating and managing support tickets, including best practices and response time expectations.',
  'Support',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true,
  NOW()
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample external users for testing
INSERT INTO external_users (email, company_name, contact_person, phone, organization_id, created_by)
SELECT 
  'customer1@example.com',
  'Example Company',
  'John Customer',
  '+250788123456',
  o.id,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO external_users (email, company_name, contact_person, phone, organization_id, created_by)
SELECT 
  'customer2@example.com',
  'Tech Solutions Ltd',
  'Sarah Manager',
  '+250787654321',
  o.id,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
FROM organizations o
WHERE o.slug = 'worksphere-technologies'
ON CONFLICT (email, organization_id) DO NOTHING;

-- Insert sample support tickets for testing
INSERT INTO support_tickets (
  organization_id, customer_id, subject, description, status, priority, category
)
SELECT 
  o.id,
  eu.id,
  'Login Issues with Mobile App',
  'I am unable to log in to the mobile app using my credentials. The web version works fine, but the mobile app keeps showing "Invalid credentials" error.',
  'open',
  'medium',
  'Technical Support'
FROM organizations o
JOIN external_users eu ON eu.organization_id = o.id
WHERE o.slug = 'worksphere-technologies'
  AND eu.email = 'customer1@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO support_tickets (
  organization_id, customer_id, subject, description, status, priority, category
)
SELECT 
  o.id,
  eu.id,
  'Feature Request: Dark Mode',
  'Would it be possible to add a dark mode option to the interface? Many of our team members work late hours and would appreciate this feature.',
  'in_progress',
  'low',
  'Feature Request'
FROM organizations o
JOIN external_users eu ON eu.organization_id = o.id
WHERE o.slug = 'worksphere-technologies'
  AND eu.email = 'customer2@example.com'
ON CONFLICT DO NOTHING;

COMMIT;
