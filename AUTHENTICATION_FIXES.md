# 🔧 WorkSphere AI - Authentication Fixes Guide

This guide addresses the authentication and authorization errors you're experiencing.

## 🚨 **Current Issues**

1. **Google OAuth Error**: `The given client ID is not found`
2. **Supabase Auth Error**: `400 Bad Request` on password login
3. **Analytics API Error**: `401 Unauthorized` on analytics endpoint

---

## 🎯 **QUICK FIXES**

### **1. Fix Google OAuth (Immediate)**

Replace the placeholder Google Client ID with a real one:

```bash
# Update your .env file
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

**How to get a real Google Client ID:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable "Google+ API" and "Google OAuth2 API"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy the Client ID and update your `.env` file

### **2. Fix Supabase Auth (Immediate)**

The 400 error suggests invalid credentials. Let's check if users exist:

```sql
-- Check if users exist in the database
SELECT email, full_name, role, organization_id 
FROM users 
WHERE email IN ('admin@worksphere.ai', 'user@example.com');
```

If no users exist, create them:

```sql
-- Create a test admin user (you'll need to do this via Supabase Auth API)
INSERT INTO users (email, full_name, role, organization_id, created_at, updated_at)
VALUES 
  ('admin@worksphere.ai', 'System Administrator', 'admin', NULL, NOW(), NOW());
```

### 3. Fix Analytics API (Immediate)**

The analytics API doesn't exist in your current schema. Let's remove the problematic code:
<tool_call>grep_search
<arg_key>SearchPath</arg_key>
<arg_value>d:/Apps/Workspehere/frontend/src
