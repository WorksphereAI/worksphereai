-- WorkSphere AI Signup System Database Schema
-- Comprehensive signup and onboarding system for all user types

-- ============================================
-- SIGNUP ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signup_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('enterprise', 'individual', 'customer')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'email_sent', 'verified', 'completed', 'failed')),
    organization_name VARCHAR(255),
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ============================================
-- EMAIL VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'signup' CHECK (type IN ('signup', 'invitation', 'password_reset')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- PHONE VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS phone_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ORGANIZATION INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ONBOARDING PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    step_id INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    skipped BOOLEAN NOT NULL DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id, step_id)
);

-- ============================================
-- SIGNUP ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signup_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_type VARCHAR(50),
    step_name VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Signup attempts indexes
CREATE INDEX IF NOT EXISTS idx_signup_attempts_email ON signup_attempts(email);
CREATE INDEX IF NOT EXISTS idx_signup_attempts_status ON signup_attempts(status);
CREATE INDEX IF NOT EXISTS idx_signup_attempts_user_type ON signup_attempts(user_type);
CREATE INDEX IF NOT EXISTS idx_signup_attempts_created_at ON signup_attempts(created_at);

-- Email verifications indexes
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_status ON email_verifications(status);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Phone verifications indexes
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_code ON phone_verifications(code);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_status ON phone_verifications(status);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON phone_verifications(expires_at);

-- Organization invitations indexes
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);

-- Onboarding progress indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_organization_id ON onboarding_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_step_id ON onboarding_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_completed ON onboarding_progress(completed);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_signup_analytics_event_type ON signup_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_signup_analytics_user_type ON signup_analytics(user_type);
CREATE INDEX IF NOT EXISTS idx_signup_analytics_created_at ON signup_analytics(created_at);

-- ============================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_analytics ENABLE ROW LEVEL SECURITY;

-- Signup attempts policies
CREATE POLICY "Users can view their own signup attempts" ON signup_attempts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage signup attempts" ON signup_attempts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Email verifications policies
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email verifications" ON email_verifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Phone verifications policies
CREATE POLICY "Users can view their own phone verifications" ON phone_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage phone verifications" ON phone_verifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Organization invitations policies
CREATE POLICY "Organization members can view invitations" ON organization_invitations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage organization invitations" ON organization_invitations
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Onboarding progress policies
CREATE POLICY "Users can manage their own onboarding progress" ON onboarding_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can view org onboarding" ON onboarding_progress
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Service role can manage onboarding progress" ON onboarding_progress
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Analytics policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view analytics" ON signup_analytics
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage analytics" ON signup_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_signup_attempts_updated_at BEFORE UPDATE ON signup_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track signup analytics
CREATE OR REPLACE FUNCTION track_signup_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO signup_analytics (event_type, user_type, metadata)
        VALUES ('signup_started', NEW.user_type, 
                json_build_object('email', NEW.email, 'organization_name', NEW.organization_name));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO signup_analytics (event_type, user_type, metadata)
            VALUES ('signup_status_changed', NEW.user_type,
                    json_build_object('old_status', OLD.status, 'new_status', NEW.status, 'email', NEW.email));
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply analytics triggers
CREATE TRIGGER track_signup_analytics AFTER INSERT OR UPDATE ON signup_attempts
    FOR EACH ROW EXECUTE FUNCTION track_signup_event();

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Sample signup attempt
INSERT INTO signup_attempts (email, user_type, organization_name, full_name, status)
VALUES ('demo@worksphere.ai', 'enterprise', 'Demo Corporation', 'John Doe', 'pending')
ON CONFLICT DO NOTHING;

-- Sample email verification
INSERT INTO email_verifications (email, token, type)
VALUES ('demo@worksphere.ai', 'sample-token-12345', 'signup')
ON CONFLICT DO NOTHING;

-- Sample organization invitation
INSERT INTO organization_invitations (organization_id, invited_by, email, role, token)
SELECT 
    (SELECT id FROM organizations LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'invitee@worksphere.ai',
    'employee',
    'invite-token-67890'
ON CONFLICT DO NOTHING;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Clean up expired email verifications
    UPDATE email_verifications 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < NOW();
    
    -- Clean up expired phone verifications
    UPDATE phone_verifications 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < NOW();
    
    -- Clean up expired invitations
    UPDATE organization_invitations 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < NOW();
    
    -- Clean up old signup attempts
    DELETE FROM signup_attempts 
    WHERE status IN ('completed', 'failed') AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Signup funnel view
CREATE OR REPLACE VIEW signup_funnel AS
SELECT 
    user_type,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'email_sent') as email_sent,
    COUNT(*) FILTER (WHERE status = 'verified') as verified,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    DATE_TRUNC('day', created_at) as date
FROM signup_attempts
GROUP BY user_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Onboarding completion view
CREATE OR REPLACE VIEW onboarding_completion AS
SELECT 
    o.organization_id,
    org.name as organization_name,
    COUNT(*) as total_steps,
    COUNT(*) FILTER (WHERE completed = true) as completed_steps,
    COUNT(*) FILTER (WHERE skipped = true) as skipped_steps,
    ROUND(
        (COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*)), 2
    ) as completion_percentage
FROM onboarding_progress o
JOIN organizations org ON org.id = o.organization_id
GROUP BY o.organization_id, org.name
ORDER BY completion_percentage DESC;

-- ============================================
-- COMPLETION
-- ============================================

-- The signup system schema is now complete!
-- Tables: signup_attempts, email_verifications, phone_verifications, 
-- organization_invitations, onboarding_progress, signup_analytics
-- Features: RLS policies, indexes, triggers, cleanup functions, reporting views

COMMENT ON SCHEMA public IS 'WorkSphere AI Signup System - Complete signup and onboarding infrastructure';
