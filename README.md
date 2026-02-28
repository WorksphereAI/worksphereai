# 🚀 WorkSphere AI - Intelligent Corporate Operating System

> The first AI-native platform for structured work communication, designed specifically for African businesses.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)](https://www.typescriptlang.org/)

## 🎯 Vision

WorkSphere AI transforms how African businesses communicate and operate by embedding intelligence into every layer of work. We eliminate friction, automate workflows, and provide actionable insights through AI-native architecture.

## ✨ Core Philosophy

- **Zero-Friction UX**: Instant structure visibility, no tutorials, no welcome text
- **AI-First Architecture**: Intelligence embedded in every layer, not added as a feature  
- **Structured Communication**: Company hierarchy, workflows, and approvals built-in
- **African Market Focus**: Optimized for local business contexts and challenges

## 🏗️ Architecture

### Frontend Stack
- **React 18.3.1** - Modern, component-based UI
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.3.1** - Lightning-fast build tool
- **TailwindCSS 3.4.19** - Utility-first styling
- **React Router 7.13.1** - Client-side routing
- **Lucide React** - Beautiful icon system

### Backend Stack  
- **Supabase** - PostgreSQL + Realtime + Auth + Edge Functions
- **Cloudinary** - File and media management
- **Resend** - Email delivery service
- **OpenAI** - AI and language processing

### Infrastructure
- **Vercel** - Frontend deployment and CDN
- **Supabase** - Backend hosting and database
- **Cloudinary** - Media storage and delivery

## 📁 Project Structure

```
worksphere-ai/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets
│   └── dist/               # Build output
├── backend/                 # Supabase Edge Functions
│   └── functions/          # Serverless functions
├── database/                # Database schemas and migrations
│   ├── schemas/            # Table definitions
│   ├── migrations/        # Database migrations
│   └── seeds/             # Initial data
├── docs/                   # Documentation and API specs
├── assets/                 # Images, icons, brand assets
└── scripts/               # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WorksphereAI/worksphereai.git
   cd worksphereai
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your credentials
   ```

4. **Set up database**
   ```bash
   npm run setup:db
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration  
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Email Service
VITE_RESEND_API_KEY=your_resend_api_key
```

## 🎯 MVP Features

### Phase 1: Foundation ✅
- [x] **Authentication & Company Setup** - Multi-provider auth with company profiles
- [x] **Organizational Structure** - Visual hierarchy and team management
- [x] **Real-time Messaging** - Instant communication with presence
- [x] **File Sharing** - Cloudinary-powered media management
- [x] **Basic Task Management** - Task creation, assignment, and tracking

### Phase 2: Intelligence 🚧
- [ ] **AI Assistant** - Contextual help and automation
- [ ] **Smart Notifications** - Intelligent alert system
- [ ] **Workflow Automation** - Custom business process automation
- [ ] **Analytics Dashboard** - Business insights and metrics

### Phase 3: Enterprise 📋
- [ ] **Approval Workflows** - Multi-level approval systems
- [ ] **Advanced Analytics** - Predictive insights and reporting
- [ ] **Integration Hub** - Third-party service integrations
- [ ] **White-label Solutions** - Custom branding for enterprises

## 🔧 Development Commands

```bash
# Development
npm run dev                # Start both frontend and backend
npm run dev:frontend       # Frontend only (http://localhost:5173)
npm run dev:backend        # Backend only (Supabase functions)

# Building
npm run build             # Build for production
npm run build:frontend    # Frontend build only
npm run build:backend     # Backend deployment

# Database
npm run setup:db          # Initialize database
npm run migrate:db        # Run migrations

# Utilities
npm run lint              # Code linting
npm run test              # Run tests
```

## 📊 Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Messages per day per user
- Task completion rate
- File sharing frequency

### Business Impact  
- Approval time reduction
- Meeting frequency reduction
- Decision-making speed
- User retention (Day 1, 7, 30)

### Technical Performance
- Application load time < 2s
- Message delivery latency < 100ms
- 99.9% uptime SLA
- Mobile responsiveness score > 95

## 🛡️ Security & Compliance

- **GDPR Compliant** - Data protection and privacy
- **SOC 2 Type II** - Security controls and processes
- **End-to-end Encryption** - Secure data transmission
- **Role-based Access Control** - Granular permissions
- **Audit Logging** - Complete activity tracking

## 🌍 African Market Focus

WorkSphere AI is specifically designed for African business contexts:

### Local Adaptations
- **Mobile-First Design** - Optimized for mobile internet usage
- **Offline Capabilities** - Work seamlessly with poor connectivity
- **Local Payment Integration** - Support for African payment systems
- **Multi-language Support** - English, French, Arabic, Swahili, more

### Business Context
- **SME Focus** - Solutions tailored for small and medium enterprises
- **Informal Economy Integration** - Support for informal business structures
- **Regulatory Compliance** - Adherence to local business regulations
- **Cultural Sensitivity** - UI/UX designed for local business practices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Website**: [worksphere.ai](https://worksphere.ai)
- **Email**: info@worksphere.ai
- **Twitter**: [@WorkSphereAI](https://twitter.com/WorkSphereAI)
- **LinkedIn**: [WorkSphere AI](https://linkedin.com/company/worksphere-ai)

## 🙏 Acknowledgments

- The Supabase team for the amazing backend platform
- Vercel for excellent hosting and deployment
- Our early users and beta testers across Africa
- The open-source community for the tools we build upon

---

**WorkSphere AI** - Building the future of intelligent work communication in Africa. 🌍✨
