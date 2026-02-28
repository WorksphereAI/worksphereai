-- WorkSphere AI Clean Signup Schema
-- Handles existing objects gracefully

-- ============================================
-- DROP EXISTING OBJECTS (if they exist)
-- ============================================
DROP TRIGGER IF EXISTS update_signup_attempts_updated_at ON signup_attempts;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS signup_attempts;

-- ============================================
-- SIGNUP ATTEMPTS TABLE
-- ============================================
CREATE TABLE signup_attempts (
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
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
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
-- INDEXES
-- ============================================
CREATE INDEX idx_signup_attempts_email ON signup_attempts(email);
CREATE INDEX idx_signup_attempts_status ON signup_attempts(status);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_email ON email_verifications(email);

-- ============================================
-- FUNCTION TO UPDATE UPDATED_AT COLUMN
-- ============================================
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_signup_attempts_updated_at 
    BEFORE UPDATE ON signup_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASIC RLS POLICIES
-- ============================================
-- Allow anonymous inserts for signup attempts
CREATE POLICY "Allow anonymous signup attempts" ON signup_attempts
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own signup attempts
CREATE POLICY "Users view own signup attempts" ON signup_attempts
    FOR SELECT USING (email = current_setting('app.current_email', true));

-- Allow anonymous inserts for email verifications
CREATE POLICY "Allow anonymous email verifications" ON email_verifications
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own email verifications
CREATE POLICY "Users view own email verifications" ON email_verifications
    FOR SELECT USING (email = current_setting('app.current_email', true));

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================
INSERT INTO signup_attempts (email, user_type, full_name, status)
VALUES ('test@example.com', 'individual', 'Test User', 'pending');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ WorkSphere AI Clean Signup Schema created successfully!';
    RAISE NOTICE '📋 Tables created: signup_attempts, email_verifications';
    RAISE NOTICE '🔒 RLS policies enabled';
    RAISE NOTICE '📝 Sample data inserted for testing';
    RAISE NOTICE '🚀 Ready for signup testing!';
END $$;
