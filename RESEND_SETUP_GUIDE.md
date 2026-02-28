# Resend Email Service Setup Guide

This guide will help you set up Resend for the WorkSphere AI signup system.

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

### 3. Configure Your Environment

1. **Open your `.env` file** in the frontend directory
2. **Replace the placeholder**:
   ```bash
   # Change this:
   VITE_RESEND_API_KEY=re_your_resend_api_key_here
   
   # To your actual key:
   VITE_RESEND_API_KEY=re_1234567890abcdef1234567890abcdef
   ```

### 4. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🎯 **For Development (Quick Test)**

### Option A: Use Resend (Recommended)
1. **Add a development domain**:
   - In Resend Dashboard → Domains
   - Add `localhost:5173`
   - Skip verification for now (works for development)

### Option B: Use Mock Service (For Testing)
If you want to test without Resend, I can create a mock email service.

## 📧 **Email Templates You'll Get**

### 1. Verification Email
- **Subject**: "Verify your WorkSphere AI account"
- **Content**: Professional HTML with verification link
- **Branding**: WorkSphere AI with gradients and icons

### 2. Welcome Email
- **Subject**: "🎉 Welcome to WorkSphere AI!"
- **Content**: Personalized welcome with next steps
- **User Type**: Different content for Enterprise/Individual/Customer

### 3. Onboarding Complete Email
- **Subject**: "🎊 Setup Complete! Welcome to WorkSphere AI"
- **Content**: Confirmation with dashboard link
- **Features**: Highlights of what's available

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

### Email Templates

The WorkSphere AI system includes professional email templates:
- **Verification emails** with security best practices
- **Welcome emails** with personalized content
- **Onboarding emails** with setup guidance
- **Support emails** for notifications and alerts

## 🚀 **Testing Your Setup**

### Test Email Verification
1. Go to `http://localhost:5173/signup`
2. Fill out any signup form
3. Check your email for verification link
4. Click the link to complete signup

### Test Different User Types
- **Enterprise**: `/signup/enterprise` → Company-focused emails
- **Individual**: `/signup/individual` → Professional emails  
- **Customer**: `/signup/customer` → Portal access emails

## 🛠️ **Troubleshooting**

### Common Issues

#### "Missing API key" Error
- **Solution**: Add your Resend API key to `.env` file
- **Check**: Make sure the key starts with `re_`

#### "Domain not verified" Error
- **Solution**: Add and verify your domain in Resend
- **Workaround**: Use `localhost:5173` for development

#### "Email not received"
- **Check**: Spam folder
- **Check**: Email address is correct
- **Check**: Domain verification status

#### "Rate limit exceeded"
- **Wait**: Resend has generous free tier limits
- **Upgrade**: Pro plans have higher limits

## 📊 **Email Analytics**

Resend provides built-in analytics:
- **Delivery rates**: Track email success
- **Open rates**: See who opens emails
- **Click rates**: Track link engagement
- **Bounce handling**: Manage invalid emails

## 🔐 **Security Best Practices**

### API Key Security
- **Never commit** `.env` file to version control
- **Use different keys** for development/production
- **Rotate keys** periodically
- **Monitor usage** for unusual activity

### Email Security
- **Domain verification** prevents spoofing
- **SPF/DKIM/DMARC** improves deliverability
- **Rate limiting** prevents abuse
- **Unsubscribe links** required for compliance

## 📞 **Support**

### Resend Support
- **Email**: support@resend.com
- **Documentation**: https://resend.com/docs
- **Status Page**: https://resend.com/status

### WorkSphere AI Support
- **GitHub Issues**: https://github.com/WorksphereAI/worksphereai/issues
- **Email**: support@worksphere.ai
- **Documentation**: Check project README

## ✅ **Setup Complete Checklist**

- [ ] Created Resend account
- [ ] Generated API key
- [ ] Added API key to `.env` file
- [ ] Restarted development server
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
