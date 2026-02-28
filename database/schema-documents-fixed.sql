-- WORKSPHERE AI - DOCUMENT MANAGEMENT SYSTEM
-- CORRECTED SCHEMA (Run in this exact order)

-- 1. First, ensure core tables exist
-- (These should already exist from MVP)

-- 2. Create Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add document management columns to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE files ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 4. Create Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  format TEXT,
  size BIGINT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  changes_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 5. Create Document Shares Table
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_email TEXT, -- For external sharing
  shared_with_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
  expires_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (shared_with_email IS NOT NULL OR shared_with_user_id IS NOT NULL)
);

-- 6. Create Document Comments Table
CREATE TABLE IF NOT EXISTS document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES document_comments(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Document Tags Table
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, organization_id)
);

-- 8. Create Document Tag Relations Table
CREATE TABLE IF NOT EXISTS document_tag_relations (
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES document_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (document_id, tag_id)
);

-- 9. Create Document Favorites Table
CREATE TABLE IF NOT EXISTS document_favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, document_id)
);

-- 10. Create Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create Document Activities Table for Audit
CREATE TABLE IF NOT EXISTS document_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_organization ON folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_folders_department ON folders(department_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON folders(created_by);

CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_organization ON files(organization_id);
CREATE INDEX IF NOT EXISTS idx_files_department ON files(department_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files(expires_at);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created ON document_versions(created_at);

CREATE INDEX IF NOT EXISTS idx_document_shares_document ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_by ON document_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with ON document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_email ON document_shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_document_shares_expires ON document_shares(expires_at);

CREATE INDEX IF NOT EXISTS idx_document_comments_document ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_parent ON document_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_created ON document_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_document_tag_relations_document ON document_tag_relations(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tag_relations_tag ON document_tag_relations(tag_id);

CREATE INDEX IF NOT EXISTS idx_document_activities_document ON document_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_user ON document_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_created ON document_activities(created_at);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activities ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Folders
CREATE POLICY "Users can view folders in their organization" ON folders
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create folders" ON folders
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (created_by = auth.uid());

-- Document Versions
CREATE POLICY "Users can view versions of accessible files" ON document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM files WHERE 
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create versions for their files" ON document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM files WHERE uploaded_by = auth.uid()
    )
  );

-- Document Shares
CREATE POLICY "Users can view shares they created or received" ON document_shares
  FOR SELECT USING (
    shared_by = auth.uid() OR 
    shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can create shares for their files" ON document_shares
  FOR INSERT WITH CHECK (
    document_id IN (SELECT id FROM files WHERE uploaded_by = auth.uid())
  );

CREATE POLICY "Users can delete their own shares" ON document_shares
  FOR DELETE USING (shared_by = auth.uid());

-- Document Comments
CREATE POLICY "Users can view comments on accessible files" ON document_comments
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM files WHERE 
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments" ON document_comments
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM files WHERE 
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own comments" ON document_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON document_comments
  FOR DELETE USING (user_id = auth.uid());

-- Document Tags
CREATE POLICY "Users can view tags in their organization" ON document_tags
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create tags" ON document_tags
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Document Favorites
CREATE POLICY "Users can view their favorites" ON document_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their favorites" ON document_favorites
  FOR ALL USING (user_id = auth.uid());

-- Document Templates
CREATE POLICY "Users can view templates in their organization" ON document_templates
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) OR
    organization_id IS NULL -- Public templates
  );

-- Document Activities (only insert, no select for regular users)
CREATE POLICY "System can insert activities" ON document_activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view activities" ON document_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ceo', 'admin')
    )
  );

-- ENABLE REAL-TIME
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
ALTER PUBLICATION supabase_realtime ADD TABLE document_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE document_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE document_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE document_favorites;

-- CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folders_updated_at 
  BEFORE UPDATE ON folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_shares_updated_at 
  BEFORE UPDATE ON document_shares 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at 
  BEFORE UPDATE ON document_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at 
  BEFORE UPDATE ON document_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT SAMPLE DATA
DO $$
DECLARE
  org_id UUID;
  ceo_user_id UUID;
  folder_id UUID;
BEGIN
  -- Get organization ID
  SELECT id INTO org_id FROM organizations WHERE slug = 'worksphere-technologies' LIMIT 1;
  
  IF org_id IS NOT NULL THEN
    -- Get CEO user ID
    SELECT id INTO ceo_user_id FROM users WHERE email = 'ceo@worksphere.app' LIMIT 1;
    
    -- Insert sample tags
    INSERT INTO document_tags (name, color, organization_id, created_by) VALUES
      ('Important', '#EF4444', org_id, ceo_user_id),
      ('Work', '#3B82F6', org_id, ceo_user_id),
      ('Personal', '#10B981', org_id, ceo_user_id),
      ('Confidential', '#DC2626', org_id, ceo_user_id),
      ('Draft', '#6B7280', org_id, ceo_user_id),
      ('Approved', '#059669', org_id, ceo_user_id),
      ('Archive', '#8B5CF6', org_id, ceo_user_id)
    ON CONFLICT (name, organization_id) DO NOTHING;
    
    -- Insert sample folders
    INSERT INTO folders (name, organization_id, created_by) VALUES
      ('Company Documents', org_id, ceo_user_id),
      ('HR', org_id, ceo_user_id),
      ('Finance', org_id, ceo_user_id),
      ('Projects', org_id, ceo_user_id),
      ('Templates', org_id, ceo_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
