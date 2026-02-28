# Resend Email Service Setup Guide

This guide will help you set up Resend for the WorkSphere AI email system. A critical security update has been implemented: **API keys are now kept server-side only** and never exposed to the browser.

## ⚠️ Important Security Note

The frontend **cannot and should not** have direct access to Resend API keys. All email sending is now handled through secure backend endpoints. This prevents:
- API key exposure in browser console
- Client-side accidental key leaking
- Man-in-the-middle attacks on API keys

## 🚀 Quick Setup (5 minutes)

### 1. Create Resend Account

1. **Go to [https://resend.com](https://resend.com)**
2. **Click "Sign Up"** (it's free to start)
3. **Sign up with Google** or use email/password
4. **Check your email** and verify your account

### 2. Get Your API Key

1. **Login to Resend Dashboard**
2. **Click "API Keys"** in the left sidebar
3. **Click "Create API Key"**
4. **Give it a name** (e.g., "WorkSphere AI Development")
5. **Copy the API key** (it starts with `re_`)

### 3. Configure Your Backend Environment

**IMPORTANT: Store the API key in your backend `.env` file, NOT the frontend!**

#### For Local Development:

1. **Create/Update `backend\.env`** (in the backend directory):
   ```bash
   # Email Service (Resend) - BACKEND ONLY
   RESEND_API_KEY=re_1234567890abcdef1234567890abcdef
   ```

2. **Ensure `frontend\.env` does NOT have RESEND_API_KEY**:
   ```bash
   # ❌ DO NOT ADD THIS TO FRONTEND .env:
   # VITE_RESEND_API_KEY=...
   ```

#### For Vercel Deployment:

1. **Add environment variable to your Vercel project**:
   - Go to Project Settings → Environment Variables
   - Add: `RESEND_API_KEY` = `re_your_api_key`
   - Apply to all environments (Production, Preview, Development)

2. **Do NOT add VITE_RESEND_API_KEY**:
   - The frontend will call backend endpoints
   - No API key should be exposed to the browser

### 4. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev:backend
# In another terminal:
npm run dev:frontend
```

Or run both together:
```bash
npm run dev
```

## 📡 **Architecture Overview**

### Email Flow (Updated for Security)

```
Frontend User Action
    ↓
Frontend calls: POST /functions/v1/send-email
    ↓
Backend (Supabase Edge Function)
    ↓
Backend uses: process.env.RESEND_API_KEY (SECURE)
    ↓
Resend API
    ↓
Email Delivered to User
```

### Key Differences from Insecure Setup

| Aspect | ❌ Old (Insecure) | ✅ New (Secure) |
|--------|------------------|-----------------|
| **API Key Location** | Frontend `.env` | Backend `.env` |
| **Exposed to Browser** | ❌ Yes (can be seen in console) | ✅ No |
| **Backend Endpoint** | No backend | `POST /functions/v1/send-email` |
| **Frontend Usage** | Direct Resend library | HTTP request to backend |
| **Security Risk** | Very High | Minimal |

## 📧 **Email Templates**

### Supported Email Types

1. **Verification Email**
   - Subject: "Verify your WorkSphere AI account"
   - Used during signup
   - Includes verification link

2. **Resend Verification Email**
   - Subject: "Here's your verification link"
   - Retry for failed verification
   - Same verification URL

3. **Welcome Email**
   - Subject: "🎉 Welcome to WorkSphere AI!"
   - User-personalized greeting
   - Different for Enterprise/Individual/Customer users

4. **Onboarding Complete Email**
   - Subject: "🎊 Setup Complete! Welcome to WorkSphere AI"
   - Confirms setup success
   - Includes dashboard link

5. **Password Reset Email**
   - Subject: "Reset your WorkSphere AI password"
   - Includes reset link with token
   - Time-limited (for security)

6. **Invitation Email**
   - Subject: "You're invited to join WorkSphere AI"
   - Sent by team admins
   - Includes acceptance link

7. **Invitation Accepted Email**
   - Subject: "New team member joined!"
   - Notifies admins of acceptance
   - Shows new member name

8. **Account Suspended Email**
   - Subject: "Your WorkSphere AI account has been suspended"
   - Includes suspension reason
   - Support contact information

## 🔧 **Advanced Configuration**

### Custom Domain Setup (Production)

1. **Add your domain** in Resend Dashboard
2. **Add DNS records**:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   ```
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@resend.com
   ```

3. **Verify domain** (takes 5-10 minutes)

### Using a Custom Send Domain

In `backend/.env`:
```bash
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Then update [send-email/index.ts](backend/functions/send-email/index.ts):
```typescript
const from = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@worksphere.ai'
```

## 🚀 **Testing Your Setup**

### Local Testing

1. **Start development servers**:
   ```bash
   npm run dev
   ```

2. **Test signup endpoint**:
   - Go to `http://localhost:5173/signup`
   - Fill in the form
   - You should see email logs in console

3. **Check console logs**:
   - Backend logs: Check terminal running backend
   - Frontend logs: Check browser console

### API Testing with cURL

```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello</h1>",
    "from": "noreply@worksphere.ai"
  }'
```

### Production Testing

1. **Deploy backend to Vercel**:
   ```bash
   npm run build:backend
   npm run deploy:prod
   ```

2. **Test with production Resend key**:
   - Verify emails arrive
   - Check Resend dashboard for delivery stats

## 🛠️ **Troubleshooting**

### Common Issues

#### "Cannot POST /functions/v1/send-email"
- **Cause**: Backend not running or endpoint not deployed
- **Solution**: 
  - Local: Run `npm run dev:backend`
  - Production: Redeploy backend functions

#### "RESEND_API_KEY is not configured"
- **Cause**: Backend `.env` file missing the key
- **Solution**: Add to `backend/.env`: `RESEND_API_KEY=re_...`

#### "Email not sent - 401 Unauthorized"
- **Cause**: Invalid or expired Resend API key
- **Solution**: Generate new key in Resend dashboard

#### "Email delivery failing in production"
- **Cause**: Domain not verified or SPF/DKIM not set
- **Solution**: 
  1. Verify domain in Resend
  2. Add DNS records
  3. Wait 24 hours for DNS propagation

#### "Emails going to spam folder"
- **Cause**: Missing authentication or suspicious content
- **Solution**:
  - Set up SPF/DKIM/DMARC
  - Use consistent sender email
  - Include unsubscribe link

## 📊 **Email Analytics**

Monitor your email performance in Resend Dashboard:
- **Delivery rate**: Percentage successfully delivered
- **Open rate**: Percentage opened by recipients
- **Click rate**: Engagement with links
- **Bounce rate**: Failed deliveries
- **Spam complaints**: By sender domain

## 🔐 **Security Best Practices**

### Keep Your API Key Safe
- ✅ Store in `backend/.env` (gitignored)
- ✅ Use Vercel environment variables for production
- ✅ Rotate keys periodically
- ✅ Monitor for unusual activity
- ❌ Never commit `.env` to git
- ❌ Never share via email/chat
- ❌ Never put in frontend code

### Email Security
- **Domain verification**: Prevents email spoofing
- **SPF records**: Authorizes mail servers
- **DKIM**: Digitally signs emails
- **DMARC**: Authentication policy
- **Unsubscribe links**: Required by law (CAN-SPAM, GDPR)

## 📞 **Support**

### Resend Documentation
- **Official Docs**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference
- **Status Page**: https://resend.com/status

### Resend Support
- **Email**: support@resend.com
- **Discord**: Join Resend community

### WorkSphere AI
- **GitHub**: https://github.com/WorksphereAI/worksphereai
- **Issues**: Report problems on GitHub
- **Email**: support@worksphere.ai

## ✅ **Setup Complete Checklist**

- [ ] Created Resend account at resend.com
- [ ] Generated API key (starts with `re_`)
- [ ] Added `RESEND_API_KEY=re_...` to `backend/.env`
- [ ] Verified `frontend/.env` does NOT have RESEND_API_KEY
- [ ] Started backend with `npm run dev:backend`
- [ ] Started frontend with `npm run dev:frontend`
- [ ] Tested email sending with signup form
- [ ] Checked backend logs for email delivery confirmation
- [ ] For production: Added environment variable to Vercel
- [ ] For production: Set up custom domain in Resend (optional)
- [ ] Tested email verification
- [ ] Verified email delivery
- [ ] Checked spam folder
- [ ] Confirmed all user types work

## 🎉 **You're Ready!**

Once you've completed these steps, your WorkSphere AI signup system will send beautiful, professional emails to all users. The email service is fully integrated with:

- ✅ **Email verification** for account activation
- ✅ **Welcome emails** for new users
- ✅ **Onboarding emails** for setup completion
- ✅ **Support emails** for notifications
- ✅ **Analytics tracking** for email performance

**Your signup system is now production-ready with professional email communication!** 🚀
