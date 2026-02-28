# WorkSphere AI Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Cloudinary account
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd WorkSphere
npm run install:all
```

### 2. Environment Configuration

#### Frontend Environment (frontend/.env)
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=worksphere_secure
```

#### Backend Environment (backend/.env)
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services (optional)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

#### Option A: Automated Setup
```bash
cd database
npm install
node setup.js
```

#### Option B: Manual Setup
1. Go to your Supabase project
2. Open SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL
5. Create storage bucket "worksphere-files"

### 4. Local Development

#### Start Frontend
```bash
cd frontend
npm run dev
```
Visit: http://localhost:5173

#### Start Backend (Edge Functions)
```bash
cd backend
npm run dev
```

### 5. Production Deployment

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Backend (Supabase)
```bash
cd backend
npm run deploy:all
```

## 📋 Configuration Details

### Supabase Setup
1. Create new project at https://supabase.com
2. Go to Settings > API
3. Copy URL and anon key
4. Go to Settings > Database
5. Enable Row Level Security
6. Execute schema.sql

### Cloudinary Setup
1. Create account at https://cloudinary.com
2. Create upload preset "worksphere_secure"
3. Note your cloud name

### Authentication
1. Enable Email auth in Supabase
2. Configure redirect URLs:
   - Local: http://localhost:5173
   - Production: https://your-domain.com

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use different keys for development/production
- Rotate keys regularly

### Row Level Security
The database schema includes RLS policies for:
- Organization data isolation
- User permission enforcement
- File access control

### API Security
- Edge functions use service role key
- Frontend uses anon key only
- Rate limiting implemented

## 📊 Monitoring

### Frontend Analytics
- Vercel Analytics (if using Vercel)
- Custom event tracking

### Backend Monitoring
- Supabase Logs
- Edge Function metrics
- Database performance

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
```typescript
// Ensure corsHeaders are properly set
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

#### Database Connection
```bash
# Test connection
npx supabase status
```

#### File Upload Issues
- Check Cloudinary credentials
- Verify upload preset exists
- Check file size limits

### Debug Mode
```bash
# Frontend debug
npm run dev -- --debug

# Backend debug
supabase functions serve --debug
```

## 📈 Performance Optimization

### Frontend
- Code splitting implemented
- Images optimized via Cloudinary
- Lazy loading for large datasets

### Backend
- Database indexes optimized
- Edge functions geographically distributed
- Connection pooling enabled

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy WorkSphere
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Deploy to Vercel
        run: |
          cd frontend
          npm install
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Edge Functions
        run: |
          cd backend
          npm install
          npm run deploy:all
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 📞 Support

### Documentation
- API docs: `/docs/api`
- Component docs: `/docs/components`
- Database schema: `/docs/database`

### Community
- GitHub Issues
- Discord Server
- Email support

---

**WorkSphere AI** - Building the future of intelligent work communication.
