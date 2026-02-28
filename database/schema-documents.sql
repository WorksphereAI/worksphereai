-- WorkSphere AI - Document Management Schema
-- Add to existing schema after core tables are created

-- Folders Table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update Files Table with Document Management Fields
ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE files ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Document Versions Table
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  format TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Document Sharing Table
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE
);

-- Document Comments Table
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES document_comments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Tags Table
CREATE TABLE document_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Tag Relations Table
CREATE TABLE document_tag_relations (
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES document_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (document_id, tag_id)
);

-- Indexes for Performance
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_organization ON folders(organization_id);
CREATE INDEX idx_folders_department ON folders(department_id);
CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_files_version ON files(version, document_id);
CREATE INDEX idx_files_organization ON files(organization_id);
CREATE INDEX idx_files_department ON files(department_id);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_updated_at ON files(updated_at);

CREATE INDEX idx_document_versions_original ON document_versions(original_document_id);
CREATE INDEX idx_document_versions_created ON document_versions(created_at);

CREATE INDEX idx_document_shares_document ON document_shares(document_id);
CREATE INDEX idx_document_shares_shared_by ON document_shares(shared_by);
CREATE INDEX idx_document_shares_shared_with ON document_shares(shared_with);

CREATE INDEX idx_document_comments_document ON document_comments(document_id);
CREATE INDEX idx_document_comments_user ON document_comments(user_id);
CREATE INDEX idx_document_comments_created ON document_comments(created_at);

CREATE INDEX idx_document_tag_relations_document ON document_tag_relations(document_id);
CREATE INDEX idx_document_tag_relations_tag ON document_tag_relations(tag_id);

-- Row Level Security for Document Tables
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tag_relations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Folders
CREATE POLICY "Users can view folders in their organization" ON folders
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create folders in their organization" ON folders
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for Files
CREATE POLICY "Users can view files in their organization" ON files
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view files in their accessible folders" ON files
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND (
      folder_id IN (
        SELECT id FROM folders WHERE 
          organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
      )
      OR folder_id IS NULL
    )
  );

CREATE POLICY "Users can create files in their organization" ON files
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own files" ON files
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own files" ON files
  FOR DELETE USING (uploaded_by = auth.uid());

-- RLS Policies for Document Versions
CREATE POLICY "Users can view versions of accessible files" ON document_versions
  FOR SELECT USING (
    original_document_id IN (
      SELECT id FROM files WHERE 
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (
          folder_id IN (SELECT id FROM folders WHERE 
            organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
          ) OR folder_id IS NULL
        )
    )
  );

-- RLS Policies for Document Shares
CREATE POLICY "Users can view shares they created" ON document_shares
  FOR SELECT USING (shared_by = auth.uid());

CREATE POLICY "Users can view shares shared with them" ON document_shares
  FOR SELECT USING (shared_with = auth.uid());

CREATE POLICY "Users can create shares" ON document_shares
  FOR INSERT WITH CHECK (shared_by = auth.uid());

-- RLS Policies for Document Comments
CREATE POLICY "Users can view comments on accessible files" ON document_comments
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM files WHERE 
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (
          folder_id IN (SELECT id FROM folders WHERE 
            organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
          ) OR folder_id IS NULL
        )
    )
  );

CREATE POLICY "Users can create comments on accessible files" ON document_comments
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM files WHERE 
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (
          folder_id IN (SELECT id FROM folders WHERE 
            organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
          ) OR folder_id IS NULL
        )
    )
  );

-- RLS Policies for Document Tags
CREATE POLICY "Users can view tags in their organization" ON document_tags
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Enable real-time for document tables
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
ALTER PUBLICATION supabase_realtime ADD TABLE files;
ALTER PUBLICATION supabase_realtime ADD TABLE document_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE document_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE document_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE document_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE document_tag_relations;

-- Insert sample document tags
INSERT INTO document_tags (name, color, organization_id) VALUES
('Important', '#FF0000', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Work', '#3B82F6', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Personal', '#10B981', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Confidential', '#DC2626', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Draft', '#6B7280', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Approved', '#059669', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies')),
('Archive', '#6B759D', (SELECT id FROM organizations WHERE slug = 'worksphere-technologies'));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_folders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_document_versions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_document_shares_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_document_comments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_folders_updated_at();

CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_files_updated_at();

CREATE TRIGGER update_document_versions_updated_at
    BEFORE UPDATE ON document_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_document_versions_updated_at();

CREATE TRIGGER update_document_shares_updated_at
    BEFORE UPDATE ON document_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_document_shares_updated_at();

CREATE TRIGGER update_document_comments_updated_at
    BEFORE UPDATE ON document_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_document_comments_updated_at();
