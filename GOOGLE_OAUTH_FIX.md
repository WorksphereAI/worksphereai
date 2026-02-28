# Google OAuth Fix Instructions

## Issue: "The given origin is not allowed for the given client ID"

## Solution: Configure Google OAuth Client

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create one if needed)

2. **Navigate to Credentials**
   - Go to "APIs & Services" → "Credentials"

3. **Find your OAuth 2.0 Client ID**
   - Look for the client ID: `4024053505-pcvp6ut02pcda4ee15om0jvs9f47ohkd.apps.googleusercontent.com`
   - Click on it to edit

4. **Add Authorized Origins**
   - In "Authorized JavaScript origins", add:
     - `http://localhost:5173`
     - `http://localhost:3000` (if using alternative port)
     - `https://your-production-domain.com` (when deployed)

5. **Add Authorized Redirect URIs**
   - In "Authorized redirect URIs", add:
     - `http://localhost:5173`
     - `http://localhost:5173/auth/callback`

6. **Save Changes**
   - Click "Save" at the bottom

7. **Wait for Propagation**
   - Changes may take a few minutes to propagate
   - Clear browser cache if needed

## Alternative: Use Environment Variable

If you don't control the Google OAuth client, create a new one:

1. Create a new OAuth 2.0 Client ID in Google Cloud Console
2. Add the required origins and redirect URIs
3. Update your `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your-new-client-id-here
   ```

## Test the Fix

After configuring, restart your development server and test the Google Sign-In button.
