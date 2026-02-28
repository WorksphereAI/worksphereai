# Google OAuth Setup Guide for WorkSphere AI

This guide will help you set up Google OAuth authentication for the WorkSphere AI platform.

## Prerequisites

- Google Cloud Console account
- Supabase project access
- WorkSphere AI frontend project

## Step 1: Google Cloud Console Setup

1. **Create/Select a Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note your Project ID

2. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - "Google+ API" (if available) or "People API"
     - "Google Identity Toolkit API"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (for production) or "Internal" (for testing)
   - Fill in required fields:
     - **App name**: WorkSphere AI
     - **User support email**: your-email@company.com
     - **Developer contact information**: your-email@company.com
   - Add scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Add test users (for External apps)
   - Submit for verification (if required)

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Configure:
     - **Name**: WorkSphere AI Web Client
     - **Authorized JavaScript origins**:
       - `http://localhost:5173` (development)
       - `https://your-domain.com` (production)
     - **Authorized redirect URIs**:
       - `http://localhost:5173` (development)
       - `https://your-domain.com` (production)
   - Click "Create"
   - **Copy your Client ID** - you'll need this for the next steps

## Step 2: Supabase Configuration

1. **Configure Google Provider**
   - Go to your Supabase project dashboard
   - Navigate to "Authentication" → "Providers"
   - Find "Google" and enable it
   - Enter your Google Client ID from Step 1
   - Enter your Google Client Secret (if required)
   - Save the configuration

2. **Update Site URL**
   - Go to "Settings" → "General"
   - Set "Site URL" to your application URL
   - Add redirect URLs under "Redirect URLs"

## Step 3: Frontend Configuration

1. **Update Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit the file and add your Google Client ID
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
   ```

2. **Restart Development Server**
   ```bash
   npm run dev
   ```

## Step 4: Testing the Integration

1. **Test Sign Up**
   - Navigate to your application
   - Click "Sign up with Google"
   - Complete the Google authentication flow
   - Verify account creation in your database

2. **Test Sign In**
   - Log out if you're signed in
   - Click "Sign in with Google"
   - Verify successful authentication

## Step 5: Production Deployment

1. **Update Production Environment**
   - Add your Google Client ID to production environment variables
   - Update authorized origins and redirect URIs in Google Cloud Console

2. **Security Considerations**
   - Enable HTTPS in production
   - Regularly rotate secrets
   - Monitor authentication logs
   - Implement rate limiting

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Check that your redirect URI in Google Console matches your application URL
   - Ensure both HTTP and HTTPS versions are added if needed

2. **"invalid_client" Error**
   - Verify your Client ID is correct
   - Check that the OAuth app is properly configured

3. **"access_denied" Error**
   - Ensure the user has granted the required permissions
   - Check that your OAuth consent screen is properly configured

4. **Supabase Integration Issues**
   - Verify Google provider is enabled in Supabase
   - Check that Client ID matches in both Google Console and Supabase

### Debug Mode

To enable debug logging, temporarily add this to your auth component:

```typescript
// Add this to handle Google auth errors
console.log('Google Auth Response:', credentialResponse);
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different Client IDs for development and production
   - Regularly rotate secrets

2. **Domain Validation**
   - Always validate the domain in production
   - Use HTTPS for all authentication flows

3. **User Verification**
   - Implement email verification
   - Add additional security measures for sensitive operations

4. **Monitoring**
   - Track authentication success/failure rates
   - Monitor for suspicious activity
   - Set up alerts for authentication issues

## Additional Features

### Custom Scopes

You can request additional Google API scopes by modifying the GoogleLogin component:

```typescript
<GoogleLogin
  scope="email profile https://www.googleapis.com/auth/calendar"
  // ... other props
/>
```

### Multi-Provider Support

The authentication system is designed to support multiple providers. You can add:

- Microsoft Azure AD
- Apple Sign In
- SAML providers
- Custom OAuth providers

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all configuration steps
3. Review Google Cloud Console logs
4. Check Supabase authentication logs
5. Consult the [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)

## Next Steps

Once Google OAuth is working:

1. Implement user profile management
2. Add role-based access control
3. Set up multi-factor authentication
4. Configure session management
5. Add audit logging

---

**Note**: This authentication system is production-ready and includes proper error handling, security measures, and user experience optimizations.
